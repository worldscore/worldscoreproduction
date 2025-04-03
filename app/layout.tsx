import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/toaster"
import MiniKitProvider from '@/components/minikit-provider'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WorldScore - Decentralized Credit Score for the World",
  description: "Decentralized Credit Score for the World",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MiniKitProvider>
            {children}
          </MiniKitProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}