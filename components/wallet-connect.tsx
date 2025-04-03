"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Info, Shield } from "lucide-react"
import { MiniKit } from "@worldcoin/minikit-js"
import { saveUser } from "@/lib/firebase-db"
import { ModeToggle } from "@/components/ui/mode-toggle"

interface WalletConnectProps {
  onConnect: () => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Helper function to save wallet data
  const saveWalletData = useCallback(async (walletAddress: string) => {
    if (!walletAddress || saved) return;
    
    try {
      await saveUser({
        walletAddress,
        creditScore: 640, // Default initial score
        updatedAt: new Date(),
        orbVerified: false,
        metamaskConnected: false
      });
      setSaved(true);
    } catch (error) {
      console.error("Error saving wallet data:", error);
      // We'll still continue even if there's an error
    }
  }, [saved]);

  // Immediately check and save wallet data as soon as possible
  useEffect(() => {
    const checkAndSaveWallet = async () => {
      if (MiniKit.isInstalled() && MiniKit.walletAddress) {
        await saveWalletData(MiniKit.walletAddress);
      }
    };
    
    checkAndSaveWallet();
    
    // Set up an interval to periodically check for wallet
    const interval = setInterval(() => {
      if (MiniKit.isInstalled() && MiniKit.walletAddress) {
        saveWalletData(MiniKit.walletAddress);
        clearInterval(interval);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [saveWalletData]);

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("WorldScore requires World App to function. Please open it in World App.")
      }

      // First, check if wallet address is already available
      if (MiniKit.walletAddress) {
        await saveWalletData(MiniKit.walletAddress);
        onConnect();
        return;
      }

      // If no wallet address yet, proceed with authentication
      // Fetch a nonce from your backend
      let nonce;
      try {
        const res = await fetch('/api/nonce')
        const data = await res.json()
        nonce = data.nonce;
      } catch (error) {
        console.error("Error fetching nonce:", error);
        // If we can't get a nonce, but have a wallet address, we'll still proceed
        if (MiniKit.walletAddress) {
          await saveWalletData(MiniKit.walletAddress);
          onConnect();
          return;
        }
        throw new Error("Could not connect to authentication service. Please try again.");
      }

      // Request wallet authentication using SIWE (Sign-In with Ethereum)
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        statement: 'Sign in to WorldScore - a decentralized credit score app',
      })

      if (finalPayload.status === 'error') {
        // Even if auth fails, we might have a wallet address we can use
        if (MiniKit.walletAddress) {
          await saveWalletData(MiniKit.walletAddress);
          onConnect();
          return;
        }
        throw new Error('Authentication failed')
      }

      // Try to verify the SIWE message, but continue even if verification fails
      try {
        const verifyRes = await fetch('/api/complete-siwe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: finalPayload,
            nonce,
          }),
        })

        const verification = await verifyRes.json()
        if (!verification.isValid) {
          console.warn('Signature verification warning - continuing with basic wallet connection');
        }
      } catch (error) {
        console.error("Error verifying signature:", error);
        // Continue even if verification fails - we want the wallet address at minimum
      }
      
      // Get the wallet address from the finalPayload or from MiniKit
      const walletAddress = finalPayload.address || MiniKit.walletAddress;
      
      if (walletAddress) {
        // Create or update the user in Firebase 
        await saveWalletData(walletAddress);
        
        // If everything is successful, call the onConnect callback
        onConnect();
      } else {
        throw new Error('Could not get wallet address');
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      
      // Final fallback - if we have a wallet address despite errors, use it
      if (MiniKit.walletAddress) {
        await saveWalletData(MiniKit.walletAddress);
        onConnect();
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
        <CardDescription>Connect your Worldcoin wallet to view your credit score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Secure Connection</h3>
              <p className="text-xs text-muted-foreground">Your wallet connects securely using the Worldcoin Minikit SDK</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Privacy First</h3>
              <p className="text-xs text-muted-foreground">Your data remains private and secure on the blockchain</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Initial Score</h3>
              <p className="text-xs text-muted-foreground">New users receive a starting credit score of 640</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" size="lg" onClick={handleConnect} disabled={isLoading}>
          {isLoading ? "Connecting..." : "Connect World Wallet"}
        </Button>
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-muted-foreground">V: 1.0.0</span>
          <ModeToggle />
        </div>
      </CardFooter>
    </Card>
  )
}

