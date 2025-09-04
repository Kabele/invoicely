
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// We are not exporting the instances directly anymore.
// Instead, we export functions that will dynamically import the services.

export const getDb = async (): Promise<Firestore> => {
    return (await import('firebase/firestore')).getFirestore(app);
};

export const getAuthInstance = async (): Promise<Auth> => {
    return (await import('firebase/auth')).getAuth(app);
};

export { app };

    