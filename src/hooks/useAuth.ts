import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

// Generate a privacy-friendly username suggestion
const generateRandomUsername = () => `boricua-${Math.random().toString(36).slice(2, 8)}`;

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  // Fetch or create user profile
  const fetchOrCreateProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as UserProfile;
      }

      // Create new profile with a random, editable username to avoid exposing real names
      const safeDisplayName = generateRandomUsername();
      const newProfile = {
        email: firebaseUser.email || '',
        displayName: safeDisplayName,
        photoUrl: firebaseUser.photoURL || null,
        reportsCount: 0,
        upvotesReceived: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(userRef, newProfile);
      return { id: firebaseUser.uid, ...newProfile, createdAt: { toDate: () => new Date() } } as unknown as UserProfile;
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      return null;
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchOrCreateProfile(firebaseUser);
        setState({
          user: profile,
          firebaseUser,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, [fetchOrCreateProfile]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  }, []);

  // Allow user to edit their display name anytime
  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!state.firebaseUser) throw new Error('No hay usuario autenticado');

      const userRef = doc(db, 'users', state.firebaseUser.uid);
      await setDoc(
        userRef,
        {
          displayName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setState((prev) =>
        prev
          ? {
              ...prev,
              user: prev.user ? { ...prev.user, displayName } : null,
            }
          : prev
      );
    },
    [state.firebaseUser]
  );

  return {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateDisplayName,
    isAuthenticated: !!state.firebaseUser,
  };
}

// Helper to get user-friendly error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado';
      case 'auth/invalid-email':
        return 'Correo electrónico inválido';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Correo o contraseña incorrectos';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      case 'auth/popup-closed-by-user':
        return 'Inicio de sesión cancelado';
      default:
        return error.message || 'Ocurrió un error';
    }
  }
  return 'Ocurrió un error';
}

export default useAuth;

