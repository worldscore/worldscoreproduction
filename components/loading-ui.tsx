import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoadingUI() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading WorldScore...</p>
      </CardContent>
    </Card>
  )
} 