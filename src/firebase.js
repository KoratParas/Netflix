import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBc1Ihpilou4i3EMMzVy80tPt6IMtJ1I8Q",
  authDomain: "netflix-clone-4c6b2.firebaseapp.com",
  projectId: "netflix-clone-4c6b2",
  storageBucket: "netflix-clone-4c6b2.firebasestorage.app",
  messagingSenderId: "210763469406",
  appId: "1:210763469406:web:0367863604942ad6285acf",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth();

export { db, auth };
