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
  return typeof window !== 'undefined' && db !== undefined;
};

// Safely get users collection
const getUsersCollection = (): CollectionReference | null => {
  if (!isFirebaseAvailable() || !db) {
    return null;
  }
  
  return collection(db, 'users');
};

// Safely get user document reference
const getUserDocRef = (walletAddress: string): DocumentReference | null => {
  const usersCollection = getUsersCollection();
  if (!usersCollection) {
    return null;
  }
  
  return doc(usersCollection, walletAddress);
};

// Get a user by wallet address
export async function getUser(walletAddress: string): Promise<User | null> {
  try {
    // If Firebase is not available, fall back to local storage
    if (!isFirebaseAvailable()) {
      return getLocalUser(walletAddress);
    }
    
    const docRef = getUserDocRef(walletAddress);
    if (!docRef) {
      return getLocalUser(walletAddress);
    }
    
    const userDoc = await getDoc(docRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        walletAddress: data.walletAddress,
        creditScore: data.creditScore,
        updatedAt: data.updatedAt.toDate(),
        orbVerified: data.orbVerified,
        metamaskConnected: data.metamaskConnected
      };
    }
    
    return getLocalUser(walletAddress);
  } catch (error) {
    console.error('Error getting user:', error);
    return getLocalUser(walletAddress);
  }
}

// Create or update a user
export async function saveUser(user: User): Promise<boolean> {
  try {
    // Always try local storage first for fallback
    saveLocalUser(user);
    
    // If Firebase is not available, return the local storage result
    if (!isFirebaseAvailable()) {
      return true;
    }
    
    const docRef = getUserDocRef(user.walletAddress);
    if (!docRef) {
      return true; // Local storage succeeded
    }
    
    await setDoc(docRef, {
      walletAddress: user.walletAddress,
      creditScore: user.creditScore,
      updatedAt: user.updatedAt,
      orbVerified: user.orbVerified || false,
      metamaskConnected: user.metamaskConnected || false
    });
    
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

// Update a user's credit score
export async function updateUserScore(walletAddress: string, creditScore: number): Promise<boolean> {
  try {
    // Always update local storage first
    updateLocalScore(walletAddress, creditScore);
    
    // If Firebase is not available, return the local storage result
    if (!isFirebaseAvailable()) {
      return true;
    }
    
    const docRef = getUserDocRef(walletAddress);
    if (!docRef) {
      return true; // Local storage succeeded
    }
    
    await updateDoc(docRef, {
      creditScore,
      updatedAt: new Date()
    });
    
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
    if (!score) return null;
    
    return {
      walletAddress,
      creditScore: parseInt(score, 10),
      updatedAt: new Date()
    };
  } catch (error) {
    return null;
  }
};

export const saveLocalUser = (user: User): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    localStorage.setItem('worldscore_score', user.creditScore.toString());
    return true;
  } catch (error) {
    return false;
  }
};

export const updateLocalScore = (walletAddress: string, creditScore: number): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    localStorage.setItem('worldscore_score', creditScore.toString());
    return true;
  } catch (error) {
    return false;
  }
}; 