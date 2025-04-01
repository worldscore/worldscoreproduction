import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('API route: /api/nonce - Generating nonce');
  
  // Generate a random nonce
  const nonce = crypto.randomUUID().replace(/-/g, '')
  console.log('Generated nonce:', nonce);
  
  try {
    // Store the nonce in a cookie for later verification
    cookies().set('siwe', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
    });
    console.log('Stored nonce in cookie, returning response');
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
  
  return NextResponse.json({ nonce });
} 