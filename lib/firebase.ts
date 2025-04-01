// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // Add your Firebase configuration here
  // You'll get this from the Firebase console when you create a project
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Check if we are on the client side and if Firebase isn't already initialized
if (typeof window !== 'undefined' && !getApps().length) {
  try {
    console.log('Initializing Firebase on client side');
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully:', !!app, 'Firestore initialized:', !!db);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.log('Firebase not initialized: Window available:', typeof window !== 'undefined', 'Apps length:', getApps().length);
}

export { app, db, auth }; 