// Test script to verify Firebase connectivity
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('Firebase configuration:', firebaseConfig);
    console.log('Testing Firestore connection...');
    
    // Create a test document
    const testDocRef = doc(collection(db, 'users'), 'test-user');
    await setDoc(testDocRef, {
      walletAddress: 'test-user',
      creditScore: 700,
      updatedAt: new Date(),
      orbVerified: false,
      metamaskConnected: false
    });
    console.log('Test document created successfully');
    
    // Read the test document
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
    } else {
      console.log('Document does not exist!');
    }
  } catch (error) {
    console.error('Error testing Firebase:', error);
  }
}

testFirebase(); 