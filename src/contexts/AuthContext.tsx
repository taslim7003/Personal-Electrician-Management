import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../database/firebase/config';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The owner email from metadata is universefact67@gmail.com
const AUTHORIZED_EMAIL = 'universefact67@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('demo_mode') === 'true';
  });

  // Mock user for Demo Mode
  const [demoUser, setDemoUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('demo_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isDemoMode) {
        setCurrentUser(user);
        setLoading(false);
      }
    }, (err) => {
      console.error("Auth state error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  // Handle Demo Mode synchronization
  useEffect(() => {
    if (isDemoMode && demoUser) {
      setCurrentUser(demoUser);
      setLoading(false);
    } else if (isDemoMode && !demoUser) {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [isDemoMode, demoUser]);

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      if (isDemoMode) {
        // Simple demo authentication
        if (email.trim().toLowerCase() === AUTHORIZED_EMAIL && password === 'admin123') {
          const mUser = {
            uid: 'demo-admin-uid-12345',
            email: AUTHORIZED_EMAIL,
            displayName: 'Electrician Owner',
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          };
          setDemoUser(mUser);
          setCurrentUser(mUser as User);
          localStorage.setItem('demo_user', JSON.stringify(mUser));
          return;
        } else {
          throw new Error('Incorrect credentials for Demo Mode. Use universefact67@gmail.com and admin123');
        }
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Email login error:", err);
      let errMsg = err.message || 'Login failed';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'Invalid email or password';
      } else if (err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid credentials. If popup/auth is blocked in the iframe, toggle "Demo Mode" to log in instantly.';
      }
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      if (isDemoMode) {
        const mUser = {
          uid: 'demo-admin-uid-12345',
          email: AUTHORIZED_EMAIL,
          displayName: 'Electrician Owner',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        };
        setDemoUser(mUser);
        setCurrentUser(mUser as User);
        localStorage.setItem('demo_user', JSON.stringify(mUser));
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Verify authorized email
      if (result.user.email !== AUTHORIZED_EMAIL) {
        await signOut(auth);
        throw new Error(`Unauthorized email. Access restricted to owner (${AUTHORIZED_EMAIL}).`);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      let errMsg = err.message || 'Google Sign-In failed';
      if (
        err.message?.includes('popup') || 
        err.code?.includes('popup') || 
        err.message?.includes('closed-by-user') || 
        err.code === 'auth/popup-closed-by-user' || 
        err.code === 'auth/cancelled-popup-request'
      ) {
        errMsg = 'Google Login popup process successfully initiated but was either closed or blocked. Because this preview runs in a restricted iframe sandbox, browser security blocks Google Auth popups.\n\n👉 Solution 1: Click the "Open in new tab" icon (diagonal arrow) at the top-right of your preview frame to load this app in a separate tab, where Google Login works 100% perfectly!\n\n👉 Solution 2 (Hinglish / Easy Bypass): Niche diye gaye "Evaluation / Demo Bypass" button par click karein to immediately log in ho jayenge bina kisi setup ke!';
      }
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      setDemoUser(null);
      setIsDemoMode(false);
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_user');
      setCurrentUser(null);
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || 'Logout failed');
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('demo_mode', 'true');
    // Log out of Firebase if we switch to demo
    signOut(auth).catch(() => {});
    setCurrentUser(null);
  };

  // Check if current logged-in user is the authorised administrator
  const isAdmin = currentUser ? currentUser.email?.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase() : false;

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAdmin, 
      loading, 
      error, 
      loginWithEmail, 
      loginWithGoogle, 
      logout,
      isDemoMode,
      enableDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
