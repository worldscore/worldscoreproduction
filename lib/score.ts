// Credit score calculation and storage

// Get user's credit score
export function getScore(): number {
  // Check if user has a stored score
  const storedScore = localStorage.getItem("worldscore_score")

  if (storedScore) {
    return Number.parseInt(storedScore, 10)
  }

  // New users get a default score of 640
  const defaultScore = 640
  localStorage.setItem("worldscore_score", defaultScore.toString())

  return defaultScore
}

// Update user's credit score
export function updateScore(newScore: number): void {
  // Ensure score is within valid range
  const validScore = Math.max(300, Math.min(900, newScore))
  localStorage.setItem("worldscore_score", validScore.toString())
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

