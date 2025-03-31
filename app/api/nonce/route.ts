import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Generate a random nonce
  const nonce = crypto.randomUUID().replace(/-/g, '')
  
  // Store the nonce in a cookie for later verification
  cookies().set('siwe', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  })
  
  return NextResponse.json({ nonce })
} 