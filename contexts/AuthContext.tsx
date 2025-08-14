"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';

export type UserRole = 'user' | 'insurer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<UserRole>;
  signUp: (email: string, password: string, role?: UserRole, profile?: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: (role?: UserRole) => Promise<UserRole>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => { return 'user' as UserRole; },
  signUp: async () => {},
  logout: async () => {},
  signInWithGoogle: async () => { return 'user' as UserRole; }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, role?: UserRole) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Return the user role (or default to 'user')
      return role || 'user';
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role?: UserRole, profile?: Partial<UserProfile>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create a user profile if role and profile data are provided
      if (role) {
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          role: role,
          name: profile?.name || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        setUserProfile(userProfile);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (role?: UserRole) => {
    try {
      // This is a stub implementation to satisfy the type definition
      // In a real implementation, this would use GoogleAuthProvider and signInWithPopup
      console.warn('Google sign-in is not fully implemented in this version');
      return role || 'user';
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, logout, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}