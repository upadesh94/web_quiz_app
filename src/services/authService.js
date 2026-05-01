import { auth, db, firebaseConfig } from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SESSION_KEY = 'quiz_app_session';

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
    console.error("Login Error:", error);
    throw new Error(error.message);
  }
};

export const signUp = async (email, password, role = 'student', name = '') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Hardcode the demo accounts to bypass the pending state to avoid locking the user out
    const isDemo = email === 'student@school.com' || email === 'teacher@school.com';
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
    console.error("SignUp Error:", error);
    throw new Error(error.message);
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
    console.error("Failed to update status:", err);
    throw new Error("Could not update student status");
  }
};

export const updateStudentDetails = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    return true;
  } catch (err) {
    console.error("Failed to update student details:", err);
    throw new Error("Could not update student details");
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
    console.error("Failed to create student account:", err);
    throw new Error(err.message);
  }
};

window.seedDemoUsers = async () => {
  try {
    console.log("Seeding student...");
    await signUp('student@school.com', 'password', 'student', 'Student One');
    await firebaseSignOut(auth);
    
    console.log("Seeding teacher...");
    await signUp('teacher@school.com', 'password', 'teacher', 'Mr. Teacher');
    await firebaseSignOut(auth);
    
    console.log("Demo users created successfully!");
  } catch (err) {
    console.error("Failed to seed demo users:", err);
  }
};
