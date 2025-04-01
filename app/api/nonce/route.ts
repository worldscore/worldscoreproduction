import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Generate a random nonce
  const nonce = crypto.randomUUID().replace(/-/g, '')
  
  try {
    // Store the nonce in a cookie for later verification
    const cookieStore = cookies();
    cookieStore.set('siwe', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
    });
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
  
  return NextResponse.json({ nonce });
} 