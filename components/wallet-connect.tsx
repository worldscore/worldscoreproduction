"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Info, Shield } from "lucide-react"
import { MiniKit } from "@worldcoin/minikit-js"

interface WalletConnectProps {
  onConnect: () => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    console.log('handleConnect: Starting wallet connection process');
    setIsLoading(true)
    setError(null)

    try {
      console.log('handleConnect: MiniKit installed:', MiniKit.isInstalled());
      if (!MiniKit.isInstalled()) {
        console.log('handleConnect: MiniKit not installed');
        throw new Error("WorldScore requires World App to function. Please open it in World App.")
      }

      // Fetch a nonce from your backend
      console.log('handleConnect: Fetching nonce from API');
      const res = await fetch('/api/nonce')
      const { nonce } = await res.json()
      console.log('handleConnect: Received nonce:', nonce);

      // Request wallet authentication using SIWE (Sign-In with Ethereum)
      console.log('handleConnect: Requesting wallet authentication');
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        statement: 'Sign in to WorldScore - a decentralized credit score app',
      })

      console.log('handleConnect: Authentication response:', finalPayload);
      if (finalPayload.status === 'error') {
        console.log('handleConnect: Authentication failed');
        throw new Error('Authentication failed')
      }

      // Verify the SIWE message on your backend
      console.log('handleConnect: Verifying SIWE message');
      const verifyRes = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const verification = await verifyRes.json()
      console.log('handleConnect: Verification result:', verification);
      if (!verification.isValid) {
        console.log('handleConnect: Signature verification failed');
        throw new Error('Signature verification failed')
      }

      // If everything is successful, call the onConnect callback
      console.log('handleConnect: Authentication successful, wallet address:', finalPayload.address);
      onConnect()
    } catch (err) {
      console.error("Failed to connect wallet:", err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
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
        <span className="text-xs text-muted-foreground">V: 1.0.0</span>
      </CardFooter>
    </Card>
  )
}

