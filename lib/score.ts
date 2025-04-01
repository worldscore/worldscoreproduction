// Credit score calculation and storage

import { MiniKit } from '@worldcoin/minikit-js'
import { getUser, saveUser, updateUserScore, getLocalUser, saveLocalUser, updateLocalScore } from './firebase-db'

// Get user's credit score
export async function getScore(): Promise<number> {
  try {
    // For server-side rendering safety
    if (typeof window === 'undefined') {
      return 640; // Default score
    }

    if (!MiniKit.isInstalled() || !MiniKit.walletAddress) {
      // Fall back to localStorage if no wallet is connected
      const localScore = localStorage.getItem("worldscore_score");
      return localScore ? Number.parseInt(localScore, 10) : 640;
    }

    const walletAddress = MiniKit.walletAddress;
    
    // Try to get user from Firebase
    const user = await getUser(walletAddress);
    
    if (user) {
      // User exists in Firebase, return their score
      return user.creditScore;
    } else {
      // Create new user with default score
      const defaultScore = 640;
      await saveUser({
        walletAddress,
        creditScore: defaultScore,
        updatedAt: new Date()
      });
      
      // Also save to localStorage as fallback
      localStorage.setItem("worldscore_score", defaultScore.toString());
      
      return defaultScore;
    }
  } catch (error) {
    console.error('Error retrieving score:', error);
    
    // Fall back to localStorage if Firebase fails
    const localScore = localStorage.getItem("worldscore_score");
    return localScore ? Number.parseInt(localScore, 10) : 640;
  }
}

// Update user's credit score
export async function updateScore(newScore: number): Promise<void> {
  try {
    // Ensure score is within valid range
    const validScore = Math.max(300, Math.min(900, newScore));
    
    // Update localStorage as fallback
    localStorage.setItem("worldscore_score", validScore.toString());
    
    if (MiniKit.isInstalled() && MiniKit.walletAddress) {
      // If wallet is connected, update in Firebase too
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

