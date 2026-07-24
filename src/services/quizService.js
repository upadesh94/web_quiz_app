import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, query, where, setDoc } from 'firebase/firestore';
import { createId } from '../utils/createId';

const QUIZZES_COLLECTION = 'quizzes';
const RESULTS_COLLECTION = 'results';
const LOCAL_QUIZZES_KEY = 'quiz_app_local_quizzes';
const LOCAL_RESULTS_KEY = 'quiz_app_local_results';

const isPermissionError = (error) => error?.code === 'permission-denied' || /permission|missing or insufficient/i.test(error?.message || '');

const readLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const mockQuizzes = [
  {
    id: 'q1',
    title: 'Class 8 Science: Cell Structure',
    classLevel: 8,
    subject: 'Science',
    topic: 'Biology',
    duration: 300,
    questions: [
      { id: 'q1_1', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'], correctIndex: 1 },
      { id: 'q1_2', text: 'Which organelle contains genetic material?', options: ['Nucleus', 'Golgi Apparatus', 'Lysosome', 'Vacuole'], correctIndex: 0 },
      { id: 'q1_3', text: 'What is the outermost layer of a plant cell?', options: ['Cell Membrane', 'Cell Wall', 'Cytoplasm', 'Nuclear Envelope'], correctIndex: 1 },
    ]
  },
  {
    id: 'q2',
    title: 'Class 9 Math: Algebra Basics',
    classLevel: 9,
    subject: 'Math',
    topic: 'Algebra',
    duration: 300,
    questions: [
      { id: 'q2_1', text: 'If x + 5 = 12, what is x?', options: ['5', '7', '12', '17'], correctIndex: 1 },
      { id: 'q2_2', text: 'What is 3^2?', options: ['6', '9', '12', '27'], correctIndex: 1 },
      { id: 'q2_3', text: 'Solve: 2x - 4 = 10', options: ['7', '3', '14', '5'], correctIndex: 0 },
    ]
  },
  {
    id: 'q3',
    title: 'Class 10 Physics: Light & Reflection',
    classLevel: 10,
    subject: 'Science',
    topic: 'Physics',
    duration: 300,
    questions: [
      { id: 'q3_1', text: 'What is the speed of light in a vacuum?', options: ['3 x 10^8 m/s', '3 x 10^5 m/s', '3 x 10^8 km/s', '3 x 10^6 m/s'], correctIndex: 0 },
      { id: 'q3_2', text: 'Which mirror is used in cars as a rear-view mirror?', options: ['Concave', 'Convex', 'Plane', 'Cylindrical'], correctIndex: 1 },
    ]
  }
];

export const getQuizzes = async (classLevel = null) => {
  try {
    const qRef = collection(db, QUIZZES_COLLECTION);
    const snapshot = await getDocs(qRef);
    
    let quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Auto-seed dummy data if empty
    if (quizzes.length === 0) {
      console.log("Seeding dummy quizzes to Firestore...");
      for (const q of mockQuizzes) {
        const { id, ...quizData } = q;
        const docRef = doc(db, QUIZZES_COLLECTION, id);
        await setDoc(docRef, quizData);
        quizzes.push({ id, ...quizData });
      }
    }

    if (classLevel) {
      return quizzes.filter(q => q.classLevel === classLevel);
    }
    return quizzes;
  } catch (err) {
    if (isPermissionError(err)) {
      const localQuizzes = readLocalJson(LOCAL_QUIZZES_KEY, []);
      const quizzes = localQuizzes.length > 0 ? localQuizzes : mockQuizzes;
      writeLocalJson(LOCAL_QUIZZES_KEY, quizzes);
      if (classLevel) {
        return quizzes.filter((quiz) => quiz.classLevel === classLevel);
      }
      return quizzes;
    }

    console.error("Error getting quizzes:", err);
    return [];
  }
};

export const getQuizById = async (id) => {
  try {
    const docRef = doc(db, QUIZZES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (err) {
    if (isPermissionError(err)) {
      return readLocalJson(LOCAL_QUIZZES_KEY, mockQuizzes).find((quiz) => quiz.id === id) || null;
    }

    console.error("Error getting quiz:", err);
    return null;
  }
};

export const saveQuizResult = async (userId, quizId, score, total, topicAnalysis) => {
  try {
    const newResult = {
      userId,
      quizId,
      score,
      total,
      topicAnalysis,
      date: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, RESULTS_COLLECTION), newResult);
    return { id: docRef.id, ...newResult };
  } catch (err) {
    if (isPermissionError(err)) {
      const results = readLocalJson(LOCAL_RESULTS_KEY, []);
      const newResult = {
        id: createId(),
        userId,
        quizId,
        score,
        total,
        topicAnalysis,
        date: new Date().toISOString()
      };
      results.push(newResult);
      writeLocalJson(LOCAL_RESULTS_KEY, results);
      return newResult;
    }

    console.error("Error saving result:", err);
    throw err;
  }
};

export const getUserResults = async (userId) => {
  try {
    const q = query(collection(db, RESULTS_COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    if (isPermissionError(err)) {
      return readLocalJson(LOCAL_RESULTS_KEY, []).filter((result) => result.userId === userId);
    }

    console.error("Error getting user results:", err);
    return [];
  }
};

export const addQuiz = async (quiz) => {
  try {
    const docRef = await addDoc(collection(db, QUIZZES_COLLECTION), quiz);
    return { id: docRef.id, ...quiz };
  } catch (err) {
    if (isPermissionError(err)) {
      const quizzes = readLocalJson(LOCAL_QUIZZES_KEY, mockQuizzes);
      const newQuiz = { id: createId(), ...quiz };
      quizzes.push(newQuiz);
      writeLocalJson(LOCAL_QUIZZES_KEY, quizzes);
      return newQuiz;
    }

    console.error("Error adding quiz:", err);
    throw err;
  }
};
