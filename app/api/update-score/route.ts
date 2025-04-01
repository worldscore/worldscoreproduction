import { NextRequest, NextResponse } from 'next/server'
import { updateScore } from '@/lib/score'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // Verify user is authenticated
  const walletAddress = cookies().get('wallet_address')?.value
  if (!walletAddress) {
    return NextResponse.json({ 
      success: false, 
      message: 'Unauthorized' 
    }, { status: 401 })
  }

  try {
    const { score } = await req.json()
    
    if (typeof score !== 'number' || score < 300 || score > 900) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid score value' 
      }, { status: 400 })
    }

    const success = await updateScore(score)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update score' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating score:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 })
  }
} 