import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDi0snoM9fvH-YbsdHy1qf9mwwsAdLVtZU',
  authDomain: 'campus-copilot-1f836.firebaseapp.com',
  projectId: 'campus-copilot-1f836',
  storageBucket: 'campus-copilot-1f836.appspot.com',
  messagingSenderId: '540804276677',
  appId: '1:540804276677:android:63d03df7f47a0dd2472bac',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);