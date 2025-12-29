
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZoOXcRg7S5-cL9Wj_jl1LcXqfPQ_Qulc",
  authDomain: "le-kaizen.firebaseapp.com",
  projectId: "le-kaizen",
  storageBucket: "le-kaizen.firebasestorage.app",
  messagingSenderId: "501393531134",
  appId: "1:501393531134:web:4495d7798c8353f6ca85af"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
