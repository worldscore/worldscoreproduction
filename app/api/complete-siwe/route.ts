import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = await req.json() as IRequestPayload
  
  // Verify that the nonce matches the one we stored in the cookie
  if (nonce !== cookies().get('siwe')?.value) {
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: 'Invalid nonce',
    })
  }
  
  try {
    // Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (validMessage.isValid) {
      // Store the user's address in a cookie for authenticated sessions
      cookies().set('wallet_address', payload.address, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }
    
    return NextResponse.json({
      status: 'success',
      isValid: validMessage.isValid,
    })
  } catch (error: any) {
    // Handle errors in validation or processing
    return NextResponse.json({
      status: 'error',
      isValid: false,
      message: error.message,
    })
  }
} 