import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "invoicefast-m2v00",
  appId: "1:824648957137:web:a085fa538a9d3ffd30d9f0",
  storageBucket: "invoicefast-m2v00.firebasestorage.app",
  apiKey: "AIzaSyDUr34UoQGAE6citEKuhdOeN8Ll4Zeaqk8",
  authDomain: "invoicefast-m2v00.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "824648957137"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
