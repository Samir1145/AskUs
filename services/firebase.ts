import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnBjpvN_fZsaBOsYM2d1fqoTcDItCjQZ8",
  authDomain: "tacotribe-28669.firebaseapp.com",
  projectId: "tacotribe-28669",
  storageBucket: "tacotribe-28669.firebasestorage.app",
  messagingSenderId: "184561933946",
  appId: "1:184561933946:web:000fa0c82c3e7c2092a5c3",
  measurementId: "G-HXN135LBDX"
};

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
