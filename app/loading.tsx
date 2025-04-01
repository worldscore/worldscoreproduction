import LoadingUI from "@/components/loading-ui"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 bg-clip-text text-transparent">
            WorldScore
          </h1>
          <p className="text-sm text-muted-foreground text-center">Decentralized Credit Score for the World</p>
        </div>

        <LoadingUI />
      </div>
    </div>
  )
} 