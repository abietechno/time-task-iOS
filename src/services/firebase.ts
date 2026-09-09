import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

// Single app-owned Firebase project. When env vars are unset (e.g. local dev
// without .env.local), these are null and the app runs guest-only — nothing
// here should ever assume `auth`/`db` are non-null without checking first.
let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  // Optional fields across the app (project_id, project_name, client, ...)
  // are routinely built with `value || undefined` — Firestore's default
  // setDoc() throws a client-side error on any `undefined` field instead of
  // just omitting it, and that throw was silently swallowed wherever a
  // write wasn't awaited/caught, so the task/project never actually made it
  // to Firestore even though local state looked fine. Ignoring undefined
  // properties makes the SDK drop those fields instead of rejecting the
  // whole write.
  db = initializeFirestore(app, { ignoreUndefinedProperties: true });
}
