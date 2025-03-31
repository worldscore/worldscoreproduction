import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ScoreDetails() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Score Factors</CardTitle>
          <CardDescription>Key factors affecting your credit score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  On-chain Payment History
                  <ArrowUpRight className="h-3 w-3 ml-1 text-green-600" />
                </h3>
                <p className="text-xs text-muted-foreground">Your wallet has a positive transaction history</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 p-1.5 rounded-full">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  Credit Utilization
                  <ArrowUpRight className="h-3 w-3 ml-1 text-green-600" />
                </h3>
                <p className="text-xs text-muted-foreground">You're using a healthy amount of available credit</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-1.5 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  Credit Age
                  <ArrowDownRight className="h-3 w-3 ml-1 text-red-600" />
                </h3>
                <p className="text-xs text-muted-foreground">Your wallet is relatively new to the system</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recommendations</CardTitle>
          <CardDescription>Ways to improve your credit score</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-primary" />
              </div>
              <span>Connect additional wallets to build credit history</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-primary" />
              </div>
              <span>Maintain consistent transaction patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-primary" />
              </div>
              <span>Keep your wallet active with regular transactions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

