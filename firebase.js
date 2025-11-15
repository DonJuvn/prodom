import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmLfB7VPI6KNxhLQelwbqq_SkvG1ZAD44",
  authDomain: "prodom-b75c4.firebaseapp.com",
  projectId: "prodom-b75c4",
  storageBucket: "prodom-b75c4.firebasestorage.app",
  messagingSenderId: "415832030472",
  appId: "1:415832030472:web:e2431e04ce7b3db2e100bd",
  measurementId: "G-T69BQKCELB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
