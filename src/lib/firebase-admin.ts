
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

const app = !getApps().length ? initializeApp({
    credential: cert(serviceAccount)
}) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
