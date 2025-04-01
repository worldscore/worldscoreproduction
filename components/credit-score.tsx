"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { getScore } from "@/lib/score"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"

interface CreditScoreProps {
  showAnimation: boolean
  onAnimationComplete: () => void
}

export default function CreditScore({ showAnimation, onAnimationComplete }: CreditScoreProps) {
  const [score, setScore] = useState(0)
  const animationCompleted = useRef(false)
  const today = format(new Date(), "MMM d, yyyy")

  useEffect(() => {
    const userScore = getScore()

    if (showAnimation && !animationCompleted.current) {
      // Start with 0 and animate to the actual score
      setScore(0)

      // Animate the progress
      let currentProgress = 0
      const interval = setInterval(() => {
        if (currentProgress >= userScore) {
          clearInterval(interval)
          animationCompleted.current = true
          onAnimationComplete()
        } else {
          currentProgress += Math.ceil(userScore / 50) // Increment in steps
          if (currentProgress > userScore) currentProgress = userScore
          setScore(currentProgress)
          // No need to set progress state anymore since we use direct calculation
        }
      }, 40)

      return () => clearInterval(interval)
    } else {
      // If no animation, just set the score directly
      setScore(userScore)
      // No need to set progress state anymore
    }
  }, [showAnimation, onAnimationComplete])

  // Determine score color based on value
  const getScoreColor = () => {
    if (score < 580) return "text-red-500"
    if (score < 670) return "text-orange-500"
    if (score < 740) return "text-yellow-500"
    if (score < 800) return "text-green-500"
    return "text-emerald-600"
  }

  // Get the stroke color for the circle
  const getCircleColor = () => {
    if (score < 580) return "#ef4444" // red-500
    if (score < 670) return "#f97316" // orange-500
    if (score < 740) return "#eab308" // yellow-500
    if (score < 800) return "#22c55e" // green-500
    return "#059669" // emerald-600
  }

  // Calculate the exact circle progress for the score visualization
  const getCircleProgress = () => {
    // This should match the logic in getDotPosition for consistency
    // Converting from our custom scale to 0-100%
    return getDotPosition();
  }

  // Create the background gradient for the progress bar
  const createProgressBackground = () => {
    // The total score range is 600 points (from 300 to 900)
    
    // Calculate the width of each segment as percentage of the total range
    const poorWidth = ((579 - 300 + 1) / 600) * 100;     // 46.5% (279/600)
    const fairWidth = ((669 - 580 + 1) / 600) * 100;     // 15.17% (91/600)
    const goodWidth = ((739 - 670 + 1) / 600) * 100;     // 11.83% (71/600)
    const veryGoodWidth = ((799 - 740 + 1) / 600) * 100; // 10.17% (61/600)
    const excellentWidth = ((900 - 800 + 1) / 600) * 100; // 16.83% (101/600)
    
    // Calculate the position where each segment starts
    const fairStart = poorWidth;
    const goodStart = fairStart + fairWidth;
    const veryGoodStart = goodStart + goodWidth;
    const excellentStart = veryGoodStart + veryGoodWidth;
    
    return `linear-gradient(to right, 
      #ef4444 0%, 
      #ef4444 ${fairStart}%, 
      #f97316 ${fairStart}%, 
      #f97316 ${goodStart}%, 
      #eab308 ${goodStart}%, 
      #eab308 ${veryGoodStart}%, 
      #22c55e ${veryGoodStart}%, 
      #22c55e ${excellentStart}%, 
      #059669 ${excellentStart}%, 
      #059669 100%)`
  }

  // Calculate dot position directly based on score
  const getDotPosition = () => {
    // Clamp the score to the valid range
    const clampedScore = Math.max(300, Math.min(900, score));
    
    // Calculate the position as a percentage (0-100%) of the total range (600 points)
    return ((clampedScore - 300) / 600) * 100;
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-lg font-medium">Your World Score</h2>

          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getCircleColor()}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * getCircleProgress()) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>

            <motion.div
              className="absolute flex flex-col items-center justify-center"
              initial={{ scale: showAnimation ? 0.5 : 1, opacity: showAnimation ? 0 : 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: showAnimation ? 1 : 0 }}
            >
              <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
              <span className="text-xs text-muted-foreground">as of {today}</span>
            </motion.div>
          </div>

          <div className="w-full space-y-2">
            {/* Labels for score ranges - positioned to match color segments */}
            <div className="relative">
              <div className="absolute text-xs left-[0%] flex flex-col items-center">
                <span>Poor</span>
                <ChevronDown className="h-3 w-3 text-red-500" />
              </div>
              <div className="absolute text-xs left-[46.5%] -translate-x-1/2 flex flex-col items-center">
                <span>Fair</span>
                <ChevronDown className="h-3 w-3 text-orange-500" />
              </div>
              <div className="absolute text-xs left-[61.67%] -translate-x-1/2 flex flex-col items-center">
                <span>Good</span>
                <ChevronDown className="h-3 w-3 text-yellow-500" />
              </div>
              <div className="absolute text-xs left-[73.5%] -translate-x-1/2 flex flex-col items-center">
                <span>V Good</span>
                <ChevronDown className="h-3 w-3 text-green-500" />
              </div>
              <div className="absolute text-xs right-0 flex flex-col items-center">
                <span>Excellent</span>
                <ChevronDown className="h-3 w-3 text-emerald-600" />
              </div>
              <div className="h-6"></div>
            </div>

            {/* Custom progress bar with gradient background */}
            <div className="relative h-2.5 w-full rounded-full">
              {/* Background gradient */}
              <div 
                className="h-full w-full rounded-full overflow-hidden"
                style={{ background: createProgressBackground() }}
                key={`gradient-${Math.random()}`}
              />
              
              {/* Progress indicator */}
              <div 
                className="absolute top-0 bottom-0 my-auto w-4 h-4 rounded-full bg-white border-2"
                style={{ 
                  left: `${getDotPosition()}%`,
                  transform: 'translateX(-50%)',
                  borderColor: getCircleColor(),
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                }}
                key={`indicator-${Math.random()}`}
              />
            </div>

            {/* Score range numbers - positioned to match color segments */}
            <div className="relative">
              <div className="absolute text-xs text-muted-foreground left-[0%]">300</div>
              <div className="absolute text-xs text-muted-foreground left-[46.5%] -translate-x-1/2">580</div>
              <div className="absolute text-xs text-muted-foreground left-[61.67%] -translate-x-1/2">670</div>
              <div className="absolute text-xs text-muted-foreground left-[73.5%] -translate-x-1/2">740</div>
              <div className="absolute text-xs text-muted-foreground left-[83.33%] -translate-x-1/2">800</div>
              <div className="absolute text-xs text-muted-foreground right-0">900</div>
              <div className="h-5"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

