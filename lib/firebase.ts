// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getFirestore, Firestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
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

// Initialize Firebase with retry logic
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let isInitialized = false;

/**
 * Initialize Firebase safely with retry mechanism
 * This ensures that even if initialization fails initially, it can be retried
 */
const initializeFirebase = async () => {
  // Skip if already initialized or not in browser
  if (isInitialized || typeof window === 'undefined') {
    return { app, db, auth };
  }
  
  try {
    // Initialize or get the existing Firebase app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    // Get Firestore instance with optimized settings for mobile
    db = getFirestore(app);
    
    // Enable offline persistence with unlimited cache size for better mobile experience
    try {
      await enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support all of the features required to enable persistence');
        }
      });
    } catch (error) {
      console.error('Error attempting to enable persistence:', error);
      // Continue even if persistence enabling fails - basic functionality should still work
    }
    
    // Get Auth instance
    auth = getAuth(app);
    
    // Mark as initialized
    isInitialized = true;
    
    return { app, db, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Return undefined instances so callers can handle fallback gracefully
    return { app: undefined, db: undefined, auth: undefined };
  }
};

// Initialize immediately in client
if (typeof window !== 'undefined') {
  initializeFirebase().catch(console.error);
}

export { app, db, auth, initializeFirebase }; 