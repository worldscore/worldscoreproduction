'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { saveUser } from '@/lib/firebase-db'

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  // Flag to track if we've already saved this wallet address to avoid duplicate saves
  const savedWallets = useRef<Set<string>>(new Set());

  // Create a function to save the user after wallet connection
  const saveWalletUser = useCallback(async (walletAddress: string) => {
    try {
      // Skip if we've already saved this wallet to prevent duplicate/unnecessary operations
      if (savedWallets.current.has(walletAddress)) {
        return;
      }
      
      // Mark this wallet as saved
      savedWallets.current.add(walletAddress);
      
      await saveUser({
        walletAddress,
        creditScore: 640, // Default initial score
        updatedAt: new Date(),
        orbVerified: false,
        metamaskConnected: false
      });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, []);

  useEffect(() => {
    // Set isClient to true once the component mounts
    setIsClient(true)
    
    // Only run on client-side
    if (typeof window === 'undefined') {
      return;
    }
    
    // Immediately check if wallet is already connected
    const immediateCheck = () => {
      if (MiniKit.isInstalled() && MiniKit.walletAddress) {
        // Save user data immediately
        saveWalletUser(MiniKit.walletAddress);
      }
    };
    
    // Run the immediate check
    immediateCheck();
    
    // Check if wallet is already connected (for state updates)
    const checkWalletConnection = () => {
      if (MiniKit.isInstalled() && MiniKit.walletAddress) {
        // If we have a wallet address, always immediately try to save it
        if (!savedWallets.current.has(MiniKit.walletAddress)) {
          saveWalletUser(MiniKit.walletAddress);
        }
        
        // Only update state if the address has changed
        if (!isConnected || address !== MiniKit.walletAddress) {
          setIsConnected(true)
          setAddress(MiniKit.walletAddress)
        }
      }
    }
    
    // Check connection status on mount
    checkWalletConnection()
    
    // Set up an interval to periodically check connection status
    const interval = setInterval(checkWalletConnection, 1000)
    
    return () => clearInterval(interval)
  }, [isConnected, address, saveWalletUser])

  const connect = async () => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return null;
    }
    
    // This function is called by WalletConnect component
    // after successful authentication
    if (MiniKit.walletAddress) {
      // Immediately save the wallet data
      await saveWalletUser(MiniKit.walletAddress);
      
      // Then update the UI state
      setIsConnected(true)
      setAddress(MiniKit.walletAddress)
      
      return MiniKit.walletAddress
    }
    return null
  }

  const disconnect = async () => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return;
    }
    
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
    isConnected: isClient && isConnected,
    address,
    connect,
    disconnect
  }
} 