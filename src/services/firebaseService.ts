import { auth, db } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// User registration
export async function registerUser(email: string, password: string, userData: any) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Save user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    ...userData,
    email,
    createdAt: serverTimestamp(),
    role: userData.role || 'student',
  });
  return user;
}

// User login
export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// User logout
export async function logoutUser() {
  await signOut(auth);
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// Listen for auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Add assignment
export async function addAssignment(assignment: any) {
  return await addDoc(collection(db, 'assignments'), {
    ...assignment,
    createdAt: serverTimestamp(),
  });
}

// Add event
export async function addEvent(event: any) {
  return await addDoc(collection(db, 'events'), {
    ...event,
    createdAt: serverTimestamp(),
  });
}

// Add notification
export async function addNotification(notification: any) {
  return await addDoc(collection(db, 'notifications'), {
    ...notification,
    createdAt: serverTimestamp(),
  });
}

// Get all assignments (optionally filter by user/role)
export async function getAssignments() {
  const snapshot = await getDocs(collection(db, 'assignments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all events
export async function getEvents() {
  const snapshot = await getDocs(collection(db, 'events'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get all notifications (optionally filter by user/role)
export async function getNotifications() {
  const snapshot = await getDocs(collection(db, 'notifications'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Real-time listeners
export function listenToAssignments(callback: (assignments: any[]) => void) {
  return onSnapshot(collection(db, 'assignments'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export function listenToEvents(callback: (events: any[]) => void) {
  return onSnapshot(collection(db, 'events'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export function listenToNotifications(callback: (notifications: any[]) => void) {
  return onSnapshot(collection(db, 'notifications'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
} 