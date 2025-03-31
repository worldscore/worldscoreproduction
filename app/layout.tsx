import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/toaster"
import MiniKitProvider from '@/components/minikit-provider'

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
    <html lang="en">
      <body className={inter.className}>
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
        <Toaster />
      </body>
    </html>
  )
}

import './globals.css'