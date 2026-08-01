import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration loaded from client Firebase project (my-electric-app-10288)
const firebaseConfig = {
  apiKey: "AIzaSyDu6ItwVnug28bjFTx4RDviKT-Gutd9A3s",
  authDomain: "my-electric-app-10288.firebaseapp.com",
  projectId: "my-electric-app-10288",
  storageBucket: "my-electric-app-10288.firebasestorage.app",
  messagingSenderId: "581468864032",
  appId: "1:581468864032:web:3c6b19ed64e6aa50c84645",
  measurementId: "G-WCJMVZPS0N"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
