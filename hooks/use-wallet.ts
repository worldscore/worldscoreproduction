'use client'

import { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = () => {
      if (MiniKit.isInstalled() && MiniKit.walletAddress) {
        setIsConnected(true)
        setAddress(MiniKit.walletAddress)
      }
    }
    
    // Check connection status on mount
    checkWalletConnection()
    
    // Set up an interval to periodically check connection status
    const interval = setInterval(checkWalletConnection, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const connect = async () => {
    // This function is called by WalletConnect component
    // after successful authentication
    if (MiniKit.walletAddress) {
      setIsConnected(true)
      setAddress(MiniKit.walletAddress)
      return MiniKit.walletAddress
    }
    return null
  }

  const disconnect = async () => {
    // Clear cookies or local storage related to authentication
    // For now, just update the state
    setIsConnected(false)
    setAddress(null)
    
    // In a real implementation, you'd make a call to your backend
    // to invalidate the session or clear cookies
  }

  return {
    isConnected,
    address,
    connect,
    disconnect
  }
} 