import { auth, db, firebaseConfig } from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { createId } from '../utils/createId';

const SESSION_KEY = 'quiz_app_session';
const LOCAL_USERS_KEY = 'quiz_app_local_users';

export const DEMO_ACCOUNTS = {
  student: {
    email: 'student@school.com',
    password: 'password',
    name: 'Student One',
  },
  teacher: {
    email: 'teacher@school.com',
    password: 'password',
    name: 'Mr. Teacher',
  },
};

const isPermissionError = (error) => error?.code === 'permission-denied' || /permission|missing or insufficient/i.test(error?.message || '');

const readLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const upsertLocalUser = (user) => {
  const users = readLocalUsers();
  const index = users.findIndex((item) => item.email === user.email);
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  writeLocalUsers(users);
  return user;
};

const createLocalDemoSession = (email, password) => {
  const demoAccount = Object.values(DEMO_ACCOUNTS).find((account) => account.email === email && account.password === password);
  if (!demoAccount) {
    return null;
  }

  const sessionUser = upsertLocalUser({
    id: createId(),
    email: demoAccount.email,
    role: demoAccount.email === DEMO_ACCOUNTS.teacher.email ? 'teacher' : 'student',
    name: demoAccount.name,
    status: 'approved',
    password: demoAccount.password
  });

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    role: sessionUser.role,
    name: sessionUser.name,
    status: sessionUser.status
  };
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let sessionUser = {
      id: user.uid,
      email: user.email,
      role: 'student', 
      name: user.email.split('@')[0],
      status: 'approved'
    };

    if (userDoc.exists()) {
      sessionUser = { ...sessionUser, ...userDoc.data() };
    } else {
      await setDoc(userDocRef, {
        role: 'student',
        name: sessionUser.name,
        email: sessionUser.email,
        status: 'approved'
      });
    }

    // Check for pending approval
    if (sessionUser.role === 'student' && sessionUser.status === 'pending') {
      await firebaseSignOut(auth);
      throw new Error('Account pending approval from a teacher. Please try again later.');
    }
    
    if (sessionUser.status === 'suspended') {
      await firebaseSignOut(auth);
      throw new Error('This account has been suspended.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  } catch (error) {
    if (isPermissionError(error)) {
      const localUser = readLocalUsers().find((item) => item.email === email && item.password === password);
      if (localUser) {
        const sessionUser = {
          id: localUser.id,
          email: localUser.email,
          role: localUser.role || 'student',
          name: localUser.name || localUser.email.split('@')[0],
          status: localUser.status || 'approved'
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        return sessionUser;
      }

      const demoSession = createLocalDemoSession(email, password);
      if (demoSession) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(demoSession));
        return demoSession;
      }

      throw new Error('Unable to access Firebase right now. Create a demo account first, then log in with that email and password.', { cause: error });
    }

    console.error("Login Error:", error);
    throw new Error(error.message, { cause: error });
  }
};

export const signUp = async (email, password, role = 'student', name = '') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Hardcode the demo accounts to bypass the pending state to avoid locking the user out
    const isDemo = email === DEMO_ACCOUNTS.student.email || email === DEMO_ACCOUNTS.teacher.email;
    const status = (role === 'teacher' || isDemo) ? 'approved' : 'pending';
    
    const sessionUser = {
      id: user.uid,
      email: user.email,
      role,
      name: name || user.email.split('@')[0],
      status
    };

    await setDoc(doc(db, 'users', user.uid), {
      role: sessionUser.role,
      name: sessionUser.name,
      email: sessionUser.email,
      status: sessionUser.status
    });

    if (status === 'pending') {
      // Sign them out immediately since they need approval
      await firebaseSignOut(auth);
      throw new Error('Registration successful! However, your account is pending approval from a teacher.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  } catch (error) {
    if (isPermissionError(error)) {
      const isDemo = email === DEMO_ACCOUNTS.student.email || email === DEMO_ACCOUNTS.teacher.email;
      const status = (role === 'teacher' || isDemo) ? 'approved' : 'pending';
      const sessionUser = {
        id: createId(),
        email,
        role,
        name: name || userEmailPrefix(email),
        status,
        password
      };

      upsertLocalUser(sessionUser);

      if (status === 'pending') {
        throw new Error('Registration successful! However, your account is pending approval from a teacher.', { cause: error });
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }

    console.error("SignUp Error:", error);
    throw new Error(error.message, { cause: error });
  }
};

export const logout = async () => {
  await firebaseSignOut(auth);
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = () => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// --- Teacher Student Management Functions ---

export const getStudents = async () => {
  try {
    const q = query(collection(db, 'users'), where("role", "==", "student"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    if (isPermissionError(err)) {
      return readLocalUsers()
        .filter((user) => user.role === 'student' && user.status !== 'deleted')
        .map((user) => {
          const { password: _password, ...safeUser } = user;
          return safeUser;
        });
    }

    console.error("Failed to get students:", err);
    return [];
  }
};

export const updateStudentStatus = async (userId, newStatus) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: newStatus });
    return true;
  } catch (err) {
    if (isPermissionError(err)) {
      const users = readLocalUsers();
      const index = users.findIndex((user) => user.id === userId);
      if (index >= 0) {
        users[index] = { ...users[index], status: newStatus };
        writeLocalUsers(users);
        return true;
      }
    }

    console.error("Failed to update status:", err);
    throw new Error("Could not update student status", { cause: err });
  }
};

export const updateStudentDetails = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    return true;
  } catch (err) {
    if (isPermissionError(err)) {
      const users = readLocalUsers();
      const index = users.findIndex((user) => user.id === userId);
      if (index >= 0) {
        users[index] = { ...users[index], ...data };
        writeLocalUsers(users);
        return true;
      }
    }

    console.error("Failed to update student details:", err);
    throw new Error("Could not update student details", { cause: err });
  }
};

export const createStudentAccount = async (email, password, name) => {
  try {
    // We use a secondary app instance to create the user without logging the teacher out
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryAuthApp");
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUid = userCredential.user.uid;
    
    await secondaryAuth.signOut();
    
    // Directly approve accounts created by teachers
    await setDoc(doc(db, 'users', newUid), {
      role: 'student',
      name: name || email.split('@')[0],
      email: email,
      status: 'approved'
    });
    
    return true;
  } catch (err) {
    if (isPermissionError(err)) {
      upsertLocalUser({
        id: createId(),
        role: 'student',
        name: name || email.split('@')[0],
        email,
        status: 'approved',
        password
      });
      return true;
    }

    console.error("Failed to create student account:", err);
    throw new Error(err.message, { cause: err });
  }
};

const userEmailPrefix = (email) => email.split('@')[0];

window.seedDemoUsers = async () => {
  try {
    console.log("Seeding student...");
    await signUp(DEMO_ACCOUNTS.student.email, DEMO_ACCOUNTS.student.password, 'student', DEMO_ACCOUNTS.student.name);
    await firebaseSignOut(auth);
    
    console.log("Seeding teacher...");
    await signUp(DEMO_ACCOUNTS.teacher.email, DEMO_ACCOUNTS.teacher.password, 'teacher', DEMO_ACCOUNTS.teacher.name);
    await firebaseSignOut(auth);
    
    console.log("Demo users created successfully!");
  } catch (err) {
    console.error("Failed to seed demo users:", err);
  }
};
