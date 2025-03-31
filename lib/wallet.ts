"use client"

import { useState, useEffect, useCallback } from "react"

// Mock implementation of Minikit SDK wallet-auth
// In a real implementation, you would import from the actual SDK
interface WalletAuth {
  connect: () => Promise<string>
  disconnect: () => Promise<void>
  isConnected: () => Promise<boolean>
  getAddress: () => Promise<string | null>
}

// Mock implementation for demo purposes
const minikit: WalletAuth = {
  connect: async () => {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("worldscore_connected", "true")
    localStorage.setItem("worldscore_address", "0x" + Math.random().toString(16).substring(2, 42))
    return localStorage.getItem("worldscore_address") || ""
  },
  disconnect: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    localStorage.removeItem("worldscore_connected")
    localStorage.removeItem("worldscore_address")
  },
  isConnected: async () => {
    return localStorage.getItem("worldscore_connected") === "true"
  },
  getAddress: async () => {
    return localStorage.getItem("worldscore_address")
  },
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize wallet state
  useEffect(() => {
    const init = async () => {
      try {
        const connected = await minikit.isConnected()
        setIsConnected(connected)

        if (connected) {
          const addr = await minikit.getAddress()
          setAddress(addr)
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error)
      } finally {
        setIsInitialized(true)
      }
    }

    init()
  }, [])

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      const addr = await minikit.connect()
      setAddress(addr)
      setIsConnected(true)
      return addr
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }, [])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await minikit.disconnect()
      setAddress(null)
      setIsConnected(false)
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
      throw error
    }
  }, [])

  return {
    isConnected,
    address,
    connect,
    disconnect,
    isInitialized,
  }
}

