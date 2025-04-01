// Credit score calculation and storage

import { getUser, saveUser, updateUserScore } from './supabase'
import { MiniKit } from '@worldcoin/minikit-js'

// Get user's credit score
export async function getScore(): Promise<number> {
  try {
    if (!MiniKit.isInstalled() || !MiniKit.walletAddress) {
      return getDefaultScore()
    }

    const walletAddress = MiniKit.walletAddress
    
    // Try to get the user from the database
    const user = await getUser(walletAddress)
    
    if (user) {
      return user.credit_score
    } else {
      // New user - save default score
      const defaultScore = getDefaultScore()
      await saveUser({
        wallet_address: walletAddress,
        credit_score: defaultScore
      })
      return defaultScore
    }
  } catch (error) {
    console.error('Error retrieving score:', error)
    return getDefaultScore()
  }
}

// Update user's credit score
export async function updateScore(newScore: number): Promise<boolean> {
  try {
    if (!MiniKit.isInstalled() || !MiniKit.walletAddress) {
      return false
    }
    
    // Ensure score is within valid range
    const validScore = Math.max(300, Math.min(900, newScore))
    
    // Update the score in the database
    const updated = await updateUserScore(MiniKit.walletAddress, validScore)
    return !!updated
  } catch (error) {
    console.error('Error updating score:', error)
    return false
  }
}

// Default score function - separate to make testing easier
function getDefaultScore(): number {
  return 640
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

