import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBTOa2LT4sNu2mQVVnw_3-aGAYmDNWkSsQ",
  authDomain: "quizapp-77d6d.firebaseapp.com",
  projectId: "quizapp-77d6d",
  storageBucket: "quizapp-77d6d.firebasestorage.app",
  messagingSenderId: "672345219554",
  appId: "1:672345219554:web:97edd78eab4426aaf499bb",
  measurementId: "G-320PLJLBRQ"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
