import { NextRequest, NextResponse } from 'next/server'
import { updateScore } from '@/lib/score'

export async function POST(req: NextRequest) {
  try {
    const { score } = await req.json()
    
    if (typeof score !== 'number' || score < 300 || score > 900) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid score value' 
      }, { status: 400 })
    }

    // Note: This won't actually update localStorage from the server
    // The client should handle this directly
    return NextResponse.json({ 
      success: true,
      message: 'Score received. Client should update localStorage.'
    })
  } catch (error) {
    console.error('Error handling score update:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 })
  }
} 