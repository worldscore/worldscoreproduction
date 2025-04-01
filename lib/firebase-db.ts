import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

// User type definition
export type User = {
  walletAddress: string;
  creditScore: number;
  updatedAt: Date;
  orbVerified?: boolean;
  metamaskConnected?: boolean;
}

// Collection reference
const usersCollection = collection(db, 'users');

// Get a user by wallet address
export async function getUser(walletAddress: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(usersCollection, walletAddress));
    
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
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Create or update a user
export async function saveUser(user: User): Promise<boolean> {
  try {
    await setDoc(doc(usersCollection, user.walletAddress), {
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
    await updateDoc(doc(usersCollection, walletAddress), {
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
  
  const score = localStorage.getItem('worldscore_score');
  if (!score) return null;
  
  return {
    walletAddress,
    creditScore: parseInt(score, 10),
    updatedAt: new Date()
  };
};

export const saveLocalUser = (user: User): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  localStorage.setItem('worldscore_score', user.creditScore.toString());
  return true;
};

export const updateLocalScore = (walletAddress: string, creditScore: number): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  localStorage.setItem('worldscore_score', creditScore.toString());
  return true;
}; 