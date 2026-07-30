import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration loaded from the provisioned firebase applet config
const firebaseConfig = {
  apiKey: "AIzaSyCtkfcOAghWTdK-Y4JNrSKlX0E-AXG-3DE",
  authDomain: "gen-lang-client-0380882277.firebaseapp.com",
  projectId: "gen-lang-client-0380882277",
  storageBucket: "gen-lang-client-0380882277.firebasestorage.app",
  messagingSenderId: "62239758944",
  appId: "1:62239758944:web:351cc05382b946629e8105"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
