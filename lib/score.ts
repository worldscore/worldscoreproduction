// Credit score calculation and storage

import { MiniKit } from '@worldcoin/minikit-js'
import { getUser, saveUser, updateUserScore, getLocalUser, saveLocalUser, updateLocalScore } from './firebase-db'

// Get user's credit score
export async function getScore(): Promise<number> {
  try {
    // For server-side rendering safety
    if (typeof window === 'undefined') {
      console.log('getScore: Server-side rendering, returning default score');
      return 640; // Default score
    }

    console.log('getScore: MiniKit installed:', MiniKit.isInstalled(), 'Wallet address:', MiniKit.walletAddress);
    if (!MiniKit.isInstalled() || !MiniKit.walletAddress) {
      // Fall back to localStorage if no wallet is connected
      console.log('getScore: No wallet connected, checking localStorage');
      const localScore = localStorage.getItem("worldscore_score");
      console.log('getScore: Local storage score:', localScore);
      return localScore ? Number.parseInt(localScore, 10) : 640;
    }

    const walletAddress = MiniKit.walletAddress;
    console.log('getScore: Wallet connected with address:', walletAddress);
    
    // Try to get user from Firebase
    console.log('getScore: Attempting to get user from Firebase');
    const user = await getUser(walletAddress);
    
    if (user) {
      // User exists in Firebase, return their score
      console.log('getScore: User found, returning score:', user.creditScore);
      return user.creditScore;
    } else {
      // Create new user with default score
      console.log('getScore: User not found, creating new user with default score');
      const defaultScore = 640;
      await saveUser({
        walletAddress,
        creditScore: defaultScore,
        updatedAt: new Date()
      });
      
      // Also save to localStorage as fallback
      localStorage.setItem("worldscore_score", defaultScore.toString());
      console.log('getScore: Default score saved to localStorage:', defaultScore);
      
      return defaultScore;
    }
  } catch (error) {
    console.error('Error retrieving score:', error);
    
    // Fall back to localStorage if Firebase fails
    const localScore = localStorage.getItem("worldscore_score");
    console.log('getScore (error fallback): Using localStorage score:', localScore);
    return localScore ? Number.parseInt(localScore, 10) : 640;
  }
}

// Update user's credit score
export async function updateScore(newScore: number): Promise<void> {
  try {
    // Ensure score is within valid range
    const validScore = Math.max(300, Math.min(900, newScore));
    console.log('updateScore: Updating score to:', validScore);
    
    // Update localStorage as fallback
    localStorage.setItem("worldscore_score", validScore.toString());
    console.log('updateScore: Updated localStorage with score:', validScore);
    
    console.log('updateScore: MiniKit installed:', MiniKit.isInstalled(), 'Wallet address:', MiniKit.walletAddress);
    if (MiniKit.isInstalled() && MiniKit.walletAddress) {
      // If wallet is connected, update in Firebase too
      console.log('updateScore: Updating score in Firebase for wallet:', MiniKit.walletAddress);
      await updateUserScore(MiniKit.walletAddress, validScore);
    }
  } catch (error) {
    console.error('Error updating score:', error);
  }
}

// Calculate score based on various factors
export function calculateScore(
  paymentHistory: number, // 0-100
  creditUtilization: number, // 0-100
  creditAge: number, // in days
  creditMix: number, // 0-100
  recentInquiries: number, // count
): number {
  // Weights for different factors
  const weights = {
    paymentHistory: 0.35,
    creditUtilization: 0.3,
    creditAge: 0.15,
    creditMix: 0.1,
    recentInquiries: 0.1,
  }

  // Normalize credit age (0-100)
  const normalizedCreditAge = Math.min(100, (creditAge / 365) * 20)

  // Negative impact of recent inquiries (0-100, lower is better)
  const inquiryImpact = Math.max(0, 100 - recentInquiries * 10)

  // Calculate weighted score
  const weightedScore =
    paymentHistory * weights.paymentHistory +
    creditUtilization * weights.creditUtilization +
    normalizedCreditAge * weights.creditAge +
    creditMix * weights.creditMix +
    inquiryImpact * weights.recentInquiries

  // Convert to 300-900 scale
  const finalScore = 300 + weightedScore * 6

  return Math.round(finalScore)
}

