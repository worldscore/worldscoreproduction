import { db, initializeFirebase } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  CollectionReference,
  DocumentReference,
  Firestore,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// User type definition
export type User = {
  walletAddress: string;
  creditScore: number;
  updatedAt: Date;
  orbVerified?: boolean;
  metamaskConnected?: boolean;
}

// Queue for offline operations
const pendingOperations: Array<{
  type: 'save' | 'update',
  data: any
}> = [];

// Try to reinitialize Firebase if needed
const ensureFirebase = async (): Promise<boolean> => {
  try {
    // If db is already available, return true
    if (db) return true;
    
    // Try to initialize
    const { db: freshDb } = await initializeFirebase();
    return !!freshDb;
  } catch (error) {
    console.error('Failed to ensure Firebase:', error);
    return false;
  }
};

// Process any pending operations when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    if (pendingOperations.length > 0) {
      const isAvailable = await ensureFirebase();
      if (!isAvailable) return;
      
      const operations = [...pendingOperations];
      pendingOperations.length = 0; // Clear the queue
      
      for (const op of operations) {
        try {
          if (op.type === 'save') {
            await saveUser(op.data);
          } else if (op.type === 'update') {
            await updateUserScore(op.data.walletAddress, op.data.creditScore);
          }
        } catch (error) {
          console.error('Error processing pending operation:', error);
        }
      }
    }
  });
}

// Safely get users collection
const getUsersCollection = async (): Promise<CollectionReference | null> => {
  try {
    // Check if Firebase is initialized, try to initialize if not
    if (!db) {
      const isAvailable = await ensureFirebase();
      if (!isAvailable) return null;
    }
    
    // If still not available after attempting initialization, return null
    if (!db) return null;
    
    return collection(db, 'users');
  } catch (error) {
    console.error('Error getting collection:', error);
    return null;
  }
};

// Safely get user document reference
const getUserDocRef = async (walletAddress: string): Promise<DocumentReference | null> => {
  try {
    const usersCollection = await getUsersCollection();
    if (!usersCollection) return null;
    
    return doc(usersCollection, walletAddress);
  } catch (error) {
    console.error('Error getting document reference:', error);
    return null;
  }
};

// Get a user by wallet address
export async function getUser(walletAddress: string): Promise<User | null> {
  try {
    // Always try in local storage first for maximum speed
    const localUser = getLocalUser(walletAddress);
    
    // Try to get from Firestore
    try {
      const docRef = await getUserDocRef(walletAddress);
      if (!docRef) return localUser;
      
      const userDoc = await getDoc(docRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const firestoreUser = {
          walletAddress: data.walletAddress,
          creditScore: data.creditScore,
          // Handle both server timestamp and Date objects
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          orbVerified: data.orbVerified,
          metamaskConnected: data.metamaskConnected
        };
        
        // Update local storage with the latest data
        saveLocalUser(firestoreUser);
        
        return firestoreUser;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
    
    return localUser;
  } catch (error) {
    console.error('Error getting user:', error);
    return getLocalUser(walletAddress);
  }
}

// Create or update a user
export async function saveUser(user: User): Promise<boolean> {
  try {
    // Always save to local storage first for immediate access
    saveLocalUser(user);
    
    // Add to pending operations queue for offline support
    pendingOperations.push({
      type: 'save',
      data: user
    });
    
    // If we're offline, just return success from local storage
    if (!navigator.onLine) {
      return true;
    }
    
    // Try to save to Firestore
    const docRef = await getUserDocRef(user.walletAddress);
    if (!docRef) return true; // Local storage succeeded
    
    try {
      // Use serverTimestamp() for better synchronization
      await setDoc(docRef, {
        walletAddress: user.walletAddress,
        creditScore: user.creditScore,
        updatedAt: serverTimestamp(), // Use server timestamp for better consistency
        orbVerified: user.orbVerified || false,
        metamaskConnected: user.metamaskConnected || false
      }, { merge: true }); // Use merge to prevent overwriting existing data
      
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    }
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
    
    // Add to pending operations queue for offline support
    pendingOperations.push({
      type: 'update',
      data: { walletAddress, creditScore }
    });
    
    // If we're offline, just return success from local storage
    if (!navigator.onLine) {
      return true;
    }
    
    const docRef = await getUserDocRef(walletAddress);
    if (!docRef) return true; // Local storage succeeded
    
    try {
      await updateDoc(docRef, {
        creditScore,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      
      // Try to create the document if it doesn't exist
      try {
        return await saveUser({
          walletAddress,
          creditScore,
          updatedAt: new Date()
        });
      } catch (createError) {
        console.error('Error creating document:', createError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error updating user score:', error);
    return false;
  }
}

// Default functions that will work with localStorage for offline first approach
export const getLocalUser = (walletAddress: string): User | null => {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    // Try to get user-specific storage
    const userDataJson = localStorage.getItem(`worldscore_user_${walletAddress}`);
    if (userDataJson) {
      const userData = JSON.parse(userDataJson);
      return {
        walletAddress: userData.walletAddress,
        creditScore: userData.creditScore,
        updatedAt: new Date(userData.updatedAt),
        orbVerified: userData.orbVerified,
        metamaskConnected: userData.metamaskConnected
      };
    }
    
    // Fall back to legacy storage
    const score = localStorage.getItem('worldscore_score');
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
    // Store full user data in more specific format
    localStorage.setItem(`worldscore_user_${user.walletAddress}`, JSON.stringify({
      walletAddress: user.walletAddress,
      creditScore: user.creditScore,
      updatedAt: user.updatedAt.toISOString(),
      orbVerified: user.orbVerified || false,
      metamaskConnected: user.metamaskConnected || false
    }));
    
    // Also maintain legacy storage for backward compatibility
    localStorage.setItem('worldscore_score', user.creditScore.toString());
    localStorage.setItem('worldscore_wallet', user.walletAddress);
    return true;
  } catch (error) {
    console.error('Error saving local user:', error);
    return false;
  }
};

export const updateLocalScore = (walletAddress: string, creditScore: number): boolean => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    // Update the user-specific storage if it exists
    const userDataJson = localStorage.getItem(`worldscore_user_${walletAddress}`);
    if (userDataJson) {
      const userData = JSON.parse(userDataJson);
      userData.creditScore = creditScore;
      userData.updatedAt = new Date().toISOString();
      localStorage.setItem(`worldscore_user_${walletAddress}`, JSON.stringify(userData));
    }
    
    // Also update legacy storage
    localStorage.setItem('worldscore_score', creditScore.toString());
    localStorage.setItem('worldscore_wallet', walletAddress);
    return true;
  } catch (error) {
    console.error('Error updating local score:', error);
    return false;
  }
}; 