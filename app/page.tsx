"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import WalletConnect from "@/components/wallet-connect"
import CreditScore from "@/components/credit-score"
import ScoreDetails from "@/components/score-details"
import { useWallet } from "@/hooks/use-wallet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, CreditCard, PieChart, User } from "lucide-react"
// Import the AccountTasks component
import AccountTasks from "@/components/account-tasks"

export default function Home() {
  const { isConnected, address, connect, disconnect } = useWallet()
  const [showAnimation, setShowAnimation] = useState(true)

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 bg-clip-text text-transparent">
            WorldScore
          </h1>
          <p className="text-sm text-muted-foreground text-center">Decentralized Credit Score for the World</p>
        </div>

        {!isConnected ? (
          <WalletConnect onConnect={connect} />
        ) : (
          <>
            <CreditScore showAnimation={showAnimation} onAnimationComplete={() => setShowAnimation(false)} />

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">
                  <PieChart className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="accounts">
                  <CreditCard className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Accounts</span>
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Profile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScoreDetails />
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">Wallet Connected</p>
                          <p className="text-sm text-muted-foreground">Initial score generated</p>
                        </div>
                        <span className="text-sm text-muted-foreground">Just now</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accounts">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Linked Accounts</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-medium">Worldcoin Wallet</p>
                            <p className="text-sm text-muted-foreground truncate w-48">
                              {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Primary</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <AccountTasks />
                </div>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-medium">Your Profile</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Wallet Address</p>
                      <p className="text-sm text-muted-foreground break-all">{address}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={async () => {
                        try {
                          // First try to call server-side logout (may fail silently if endpoint doesn't exist)
                          await fetch('/api/logout', { 
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                          }).catch(() => {
                            // Ignore error if API route doesn't exist
                          });
                        } finally {
                          // Always call client-side disconnect
                          disconnect();
                        }
                      }} 
                      className="w-full mt-4"
                    >
                      Disconnect Wallet
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  )
}

