import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthState {
  currentUser: FirebaseUser | null;
  isLoading: boolean; // true until the initial auth state resolves
}

/** Tracks the current Firebase user, including cross-tab/session-restore updates. */
export function useAuthSession(): AuthState {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return { currentUser, isLoading };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<UserCredential> {
  if (!auth) throw new Error('Firebase belum dikonfigurasi.');
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });
  return credential;
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  if (!auth) throw new Error('Firebase belum dikonfigurasi.');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (!auth) throw new Error('Firebase belum dikonfigurasi.');
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOut(): Promise<void> {
  if (!auth) return;
  await firebaseSignOut(auth);
}

const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'Email ini sudah terdaftar. Coba masuk saja.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/weak-password': 'Password terlalu lemah, minimal 6 karakter.',
  'auth/invalid-credential': 'Email atau password salah.',
  'auth/user-not-found': 'Akun dengan email ini tidak ditemukan.',
  'auth/wrong-password': 'Password salah.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi sebentar lagi.',
  'auth/popup-closed-by-user': 'Jendela Google ditutup sebelum selesai. Coba lagi.',
  'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.',
  'auth/account-exists-with-different-credential':
    'Email ini sudah terdaftar lewat cara masuk lain (misal email/password).',
};

/** Turns a Firebase Auth error (e.g. `auth/email-already-in-use`) into Indonesian copy. */
export function firebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && FRIENDLY_AUTH_ERRORS[code]) return FRIENDLY_AUTH_ERRORS[code];
  return (err as { message?: string })?.message || 'Autentikasi gagal.';
}
