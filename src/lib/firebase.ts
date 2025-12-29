// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPryWI1Z_HAfdZ8TOTiSqQql47bu7XP4E",
  authDomain: "kheops-game.firebaseapp.com",
  projectId: "kheops-game",
  storageBucket: "kheops-game.appspot.com",
  messagingSenderId: "61326874413",
  appId: "1:61326874413:web:8fd874d77e1e45391365a4",
  measurementId: "G-6GKV4HCBCS"
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
