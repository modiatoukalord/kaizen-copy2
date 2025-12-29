
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBF8uFBWV5hM47aSHoit5PQmvH-keDan4k",
  authDomain: "studio-5294796188-f2001.firebaseapp.com",
  projectId: "studio-5294796188-f2001",
  storageBucket: "studio-5294796188-f2001.appspot.com",
  messagingSenderId: "209995673689",
  appId: "1:209995673689:web:9788b861af814dfd890148"
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
