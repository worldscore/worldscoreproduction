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
    // Update the state
    setIsConnected(false)
    setAddress(null)
    
    // Clear cookies using document.cookie
    document.cookie = 'wallet_address=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'siwe=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Force reload the page to ensure all state is reset
    window.location.reload();
  }

  return {
    isConnected,
    address,
    connect,
    disconnect
  }
} 