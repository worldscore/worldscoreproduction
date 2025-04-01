'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize MiniKit with your app ID
    try {
      MiniKit.install('app_fa8974b2c77a879724c770556d4a9451')
    } catch (error) {
      console.error('Error initializing MiniKit:', error);
    }
  }, [])

  return <>{children}</>
} 