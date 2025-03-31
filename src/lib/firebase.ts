import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANBfJ8XLuwi7jSA49MZ4gHlUpc_TrGktQ",
  authDomain: "barber-queue-79852.firebaseapp.com",
  projectId: "barber-queue-79852",
  storageBucket: "barber-queue-79852.firebasestorage.app",
  messagingSenderId: "595099205989",
  appId: "1:595099205989:web:0eaa74042b564b7d5e218c",
  measurementId: "G-LZFL0MFD74",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators in development environment
if (import.meta.env.DEV) {
  // Uncomment these lines if you're running Firebase emulators locally
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

// Initialize Firebase auth persistence
auth.setPersistence("local");

export default app;
