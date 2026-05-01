import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, query, where, setDoc } from 'firebase/firestore';

const QUIZZES_COLLECTION = 'quizzes';
const RESULTS_COLLECTION = 'results';

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
    console.error("Error getting user results:", err);
    return [];
  }
};

export const addQuiz = async (quiz) => {
  try {
    const docRef = await addDoc(collection(db, QUIZZES_COLLECTION), quiz);
    return { id: docRef.id, ...quiz };
  } catch (err) {
    console.error("Error adding quiz:", err);
    throw err;
  }
};
