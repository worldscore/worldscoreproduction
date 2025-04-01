import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  CollectionReference,
  DocumentReference,
  Firestore
} from 'firebase/firestore';

// User type definition
export type User = {
  walletAddress: string;
  creditScore: number;
  updatedAt: Date;
  orbVerified?: boolean;
  metamaskConnected?: boolean;
}

// Check if Firebase is available
const isFirebaseAvailable = (): boolean => {
  const available = typeof window !== 'undefined' && db !== undefined;
  console.log('Firebase available:', available, 'db defined:', db !== undefined);
  return available;
};

// Safely get users collection
const getUsersCollection = (): CollectionReference | null => {
  if (!isFirebaseAvailable() || !db) {
    console.log('getUsersCollection: Firebase not available or db is undefined');
    return null;
  }
  
  console.log('getUsersCollection: Getting users collection');
  return collection(db, 'users');
};

// Safely get user document reference
const getUserDocRef = (walletAddress: string): DocumentReference | null => {
  const usersCollection = getUsersCollection();
  if (!usersCollection) {
    console.log('getUserDocRef: Users collection not available');
    return null;
  }
  
  console.log('getUserDocRef: Getting document reference for wallet', walletAddress);
  return doc(usersCollection, walletAddress);
};

// Get a user by wallet address
export async function getUser(walletAddress: string): Promise<User | null> {
  console.log('getUser: Fetching user with wallet address', walletAddress);
  try {
    // If Firebase is not available, fall back to local storage
    if (!isFirebaseAvailable()) {
      console.log('getUser: Firebase not available, falling back to local storage');
      return getLocalUser(walletAddress);
    }
    
    const docRef = getUserDocRef(walletAddress);
    if (!docRef) {
      console.log('getUser: Document reference not available, falling back to local storage');
      return getLocalUser(walletAddress);
    }
    
    console.log('getUser: Fetching document from Firestore');
    const userDoc = await getDoc(docRef);
    
    if (userDoc.exists()) {
      console.log('getUser: Document exists in Firestore', userDoc.data());
      const data = userDoc.data();
      return {
        walletAddress: data.walletAddress,
        creditScore: data.creditScore,
        updatedAt: data.updatedAt.toDate(),
        orbVerified: data.orbVerified,
        metamaskConnected: data.metamaskConnected
      };
    }
    
    console.log('getUser: Document does not exist in Firestore, falling back to local storage');
    return getLocalUser(walletAddress);
  } catch (error) {
    console.error('Error getting user:', error);
    return getLocalUser(walletAddress);
  }
}

// Create or update a user
export async function saveUser(user: User): Promise<boolean> {
  console.log('saveUser: Attempting to save user', user);
  try {
    // Always try local storage first for fallback
    saveLocalUser(user);
    
    // If Firebase is not available, return the local storage result
    if (!isFirebaseAvailable()) {
      console.log('saveUser: Firebase not available, using local storage only');
      return true;
    }
    
    const docRef = getUserDocRef(user.walletAddress);
    if (!docRef) {
      console.log('saveUser: Document reference not available, using local storage only');
      return true; // Local storage succeeded
    }
    
    console.log('saveUser: Saving document to Firestore');
    await setDoc(docRef, {
      walletAddress: user.walletAddress,
      creditScore: user.creditScore,
      updatedAt: user.updatedAt,
      orbVerified: user.orbVerified || false,
      metamaskConnected: user.metamaskConnected || false
    });
    
    console.log('saveUser: User saved successfully to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

// Update a user's credit score
export async function updateUserScore(walletAddress: string, creditScore: number): Promise<boolean> {
  console.log('updateUserScore: Updating score for wallet', walletAddress, 'to', creditScore);
  try {
    // Always update local storage first
    updateLocalScore(walletAddress, creditScore);
    
    // If Firebase is not available, return the local storage result
    if (!isFirebaseAvailable()) {
      console.log('updateUserScore: Firebase not available, using local storage only');
      return true;
    }
    
    const docRef = getUserDocRef(walletAddress);
    if (!docRef) {
      console.log('updateUserScore: Document reference not available, using local storage only');
      return true; // Local storage succeeded
    }
    
    console.log('updateUserScore: Updating document in Firestore');
    await updateDoc(docRef, {
      creditScore,
      updatedAt: new Date()
    });
    
    console.log('updateUserScore: Score updated successfully in Firestore');
    return true;
  } catch (error) {
    console.error('Error updating user score:', error);
    return false;
  }
}

// Default functions that will work with localStorage until Firebase is set up
export const getLocalUser = (walletAddress: string): User | null => {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const score = localStorage.getItem('worldscore_score');
    console.log('getLocalUser: Local storage score for wallet', walletAddress, ':', score);
    if (!score) return null;
    
    return {
      walletAddress,
      creditScore: parseInt(score, 10),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error getting local user:', error);
    return null;
  }
};

export const saveLocalUser = (user: User): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    localStorage.setItem('worldscore_score', user.creditScore.toString());
    console.log('saveLocalUser: Saved score to local storage:', user.creditScore);
    return true;
  } catch (error) {
    console.error('Error saving local user:', error);
    return false;
  }
};

export const updateLocalScore = (walletAddress: string, creditScore: number): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    localStorage.setItem('worldscore_score', creditScore.toString());
    console.log('updateLocalScore: Updated score in local storage:', creditScore);
    return true;
  } catch (error) {
    console.error('Error updating local score:', error);
    return false;
  }
}; 