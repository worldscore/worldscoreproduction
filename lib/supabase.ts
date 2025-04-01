import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export type User = {
  wallet_address: string
  credit_score: number
  updated_at?: string
  orb_verified?: boolean
  metamask_connected?: boolean
}

// CRUD operations for users

export async function getUser(walletAddress: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error || !data) return null
  return data as User
}

export async function saveUser(user: User): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      wallet_address: user.wallet_address,
      credit_score: user.credit_score,
      updated_at: new Date().toISOString(),
      orb_verified: user.orb_verified || false,
      metamask_connected: user.metamask_connected || false
    })
    .select()
    .single()

  if (error || !data) return null
  return data as User
}

export async function updateUserScore(
  walletAddress: string, 
  creditScore: number
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ 
      credit_score: creditScore,
      updated_at: new Date().toISOString()
    })
    .eq('wallet_address', walletAddress)
    .select()
    .single()

  if (error || !data) return null
  return data as User
} 