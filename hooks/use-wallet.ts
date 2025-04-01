'use client'

import { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set isClient to true once the component mounts
    setIsClient(true)
    console.log('useWallet: Running client-side initialization');
    
    // Only run on client-side
    if (typeof window === 'undefined') {
      console.log('useWallet: Running on server, exiting');
      return;
    }
    
    // Check if wallet is already connected
    const checkWalletConnection = () => {
      console.log('checkWalletConnection: MiniKit installed:', MiniKit.isInstalled());
      if (MiniKit.isInstalled()) {
        console.log('checkWalletConnection: MiniKit wallet address:', MiniKit.walletAddress);
      }
      
      if (MiniKit.isInstalled() && MiniKit.walletAddress) {
        console.log('checkWalletConnection: Wallet connected:', MiniKit.walletAddress);
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
    // Only run on client-side
    if (typeof window === 'undefined') {
      console.log('connect: Running on server, returning null');
      return null;
    }
    
    console.log('connect: Attempting to connect wallet');
    // This function is called by WalletConnect component
    // after successful authentication
    if (MiniKit.walletAddress) {
      console.log('connect: Wallet connected with address:', MiniKit.walletAddress);
      setIsConnected(true)
      setAddress(MiniKit.walletAddress)
      return MiniKit.walletAddress
    }
    console.log('connect: No wallet address available');
    return null
  }

  const disconnect = async () => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      console.log('disconnect: Running on server, exiting');
      return;
    }
    
    console.log('disconnect: Disconnecting wallet');
    // Update the state
    setIsConnected(false)
    setAddress(null)
    
    // Clear cookies using document.cookie
    document.cookie = 'wallet_address=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'siwe=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('disconnect: Cookies cleared');
    
    // Force reload the page to ensure all state is reset
    window.location.reload();
  }

  return {
    isConnected: isClient && isConnected,
    address,
    connect,
    disconnect
  }
} 