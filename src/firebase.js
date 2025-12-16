import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABb6HykpBFEymtkh4vXnj6H15hgIHP_Ug",
  authDomain: "khang-ma-poh.firebaseapp.com",
  projectId: "khang-ma-poh",
  storageBucket: "khang-ma-poh.firebasestorage.app",
  messagingSenderId: "562617429592",
  appId: "1:562617429592:web:5275f5e458c01b8005242d",
  measurementId: "G-62947NFYNB"
};

const app = initializeApp(firebaseConfig);

// QUAN TRỌNG: Phải có chữ export ở đây
export const db = getFirestore(app);