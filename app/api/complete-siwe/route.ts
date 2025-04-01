import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  console.log('API route: /api/complete-siwe - Verifying SIWE');
  
  const { payload, nonce } = await req.json() as IRequestPayload
  console.log('Request payload - nonce:', nonce);
  console.log('Wallet address from payload:', payload.address);
  
  // Verify that the nonce matches the one we stored in the cookie
  const storedNonce = cookies().get('siwe')?.value;
  console.log('Stored nonce from cookie:', storedNonce);
  
  if (nonce !== storedNonce) {
    console.log('Nonce verification failed - nonces do not match');
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: 'Invalid nonce',
    })
  }
  
  try {
    // Verify the SIWE message
    console.log('Verifying SIWE message');
    const validMessage = await verifySiweMessage(payload, nonce)
    console.log('SIWE verification result:', validMessage);
    
    if (validMessage.isValid) {
      console.log('SIWE verification successful, setting wallet_address cookie');
      // Store the user's address in a cookie for authenticated sessions
      try {
        cookies().set('wallet_address', payload.address, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
        console.log('Wallet address cookie set successfully');
      } catch (error) {
        console.error('Error setting wallet_address cookie:', error);
      }
    }
    
    console.log('Returning verification result');
    return NextResponse.json({
      status: 'success',
      isValid: validMessage.isValid,
    })
  } catch (error: any) {
    // Handle errors in validation or processing
    console.error('SIWE verification error:', error);
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: error.message,
    })
  }
} 