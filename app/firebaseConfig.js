import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAhpm1vK-m_KGl2uX_e2MgUAhxEBRBEWJE",
  authDomain: "dais-icee.firebaseapp.com",
  projectId: "dais-icee",
  storageBucket: "dais-icee.firebasestorage.app",
  messagingSenderId: "2633599677",
  appId: Platform.OS === 'ios' ? "1:2633599677:ios:5d0c0b75fc10c298e245d4" : "1:2633599677:android:ef99b0139695353de245d4",
  measurementId: "G-2TNEFY77K4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, signInAnonymously };
