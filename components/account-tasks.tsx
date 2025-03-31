"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Plus, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AccountTasks() {
  const { toast } = useToast()

  const handleTaskClick = (taskName: string) => {
    toast({
      title: "Coming in next versions",
      description: `The "${taskName}" feature will be available in future updates.`,
      variant: "default",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Boost Your Score</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Connect World ID</p>
                <p className="text-xs text-muted-foreground">Verify your identity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">+50 points</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTaskClick("Connect World ID")}
                className="relative"
              >
                Connect
                <Lock className="h-3 w-3 absolute -top-1 -right-1" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Connect MetaMask</p>
                <p className="text-xs text-muted-foreground">Link your Ethereum wallet</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">+20 points</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTaskClick("Connect MetaMask")}
                className="relative"
              >
                Connect
                <Lock className="h-3 w-3 absolute -top-1 -right-1" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Connect Binance Account</p>
                <p className="text-xs text-muted-foreground">Link your exchange account</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">+20 points</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTaskClick("Connect Binance Account")}
                className="relative"
              >
                Connect
                <Lock className="h-3 w-3 absolute -top-1 -right-1" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Analyze On-chain Transactions</p>
                <p className="text-xs text-muted-foreground">Verify transaction history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">+50 points</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTaskClick("Analyze On-chain Transactions")}
                className="relative"
              >
                Analyze
                <Lock className="h-3 w-3 absolute -top-1 -right-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-amber-700">
            These features are coming in future versions. Stay tuned for updates!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

