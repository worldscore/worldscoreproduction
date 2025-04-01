"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { collection, doc, setDoc, getDoc, Firestore } from "firebase/firestore"
import { MiniKit } from "@worldcoin/minikit-js"

export default function FirebaseDebug() {
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testFirebaseConnection = async () => {
    setIsLoading(true)
    setResult("Testing Firebase connection...\n")

    try {
      // Check if Firebase is initialized
      if (!db) {
        setResult(prev => prev + "❌ Firebase DB not initialized\n")
        return
      }

      setResult(prev => prev + "✅ Firebase DB is initialized\n")

      // Check if we can create a test collection
      try {
        const testCollection = collection(db, 'debug')
        setResult(prev => prev + "✅ Collection reference created\n")

        // Try to write a test document
        const docRef = doc(testCollection, 'test-doc')
        await setDoc(docRef, {
          timestamp: new Date(),
          test: "This is a test document"
        })
        setResult(prev => prev + "✅ Test document created successfully\n")

        // Try to read it back
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setResult(prev => prev + "✅ Test document read successfully\n")
          setResult(prev => prev + JSON.stringify(docSnap.data(), null, 2) + "\n")
        } else {
          setResult(prev => prev + "❌ Test document not found\n")
        }
      } catch (error) {
        setResult(prev => prev + `❌ Error accessing Firestore: ${error}\n`)
      }

      // Test user collection
      try {
        setResult(prev => prev + "\nTesting users collection...\n")
        
        const walletAddress = MiniKit.walletAddress || "test-user-debug"
        setResult(prev => prev + `Using wallet address: ${walletAddress}\n`)
        
        const usersCollection = collection(db, 'users')
        const userDocRef = doc(usersCollection, walletAddress)
        
        // Try to create a user
        await setDoc(userDocRef, {
          walletAddress,
          creditScore: 750,
          updatedAt: new Date(),
          orbVerified: false,
          metamaskConnected: false
        })
        setResult(prev => prev + "✅ User document created successfully\n")
        
        // Try to read the user
        const userSnap = await getDoc(userDocRef)
        if (userSnap.exists()) {
          setResult(prev => prev + "✅ User document read successfully\n")
          setResult(prev => prev + JSON.stringify(userSnap.data(), null, 2) + "\n")
        } else {
          setResult(prev => prev + "❌ User document not found\n")
        }
      } catch (error) {
        setResult(prev => prev + `❌ Error accessing users collection: ${error}\n`)
      }
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Firebase Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testFirebaseConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Firebase Connection"}
        </Button>
        
        {result && (
          <div className="p-4 bg-black text-green-400 rounded-md whitespace-pre-wrap font-mono text-sm overflow-auto max-h-80">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 