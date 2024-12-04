import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'
import { cookies } from 'next/headers'

// Cliente para server components
export async function createSupabaseServer() {
  const { userId } = auth()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          'x-user-id': userId || ''
        }
      }
    }
  )
}

// Cliente para client components
export function createSupabaseClient() {
  let userId = ''
  
  // Verificar se estamos no browser de forma segura
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      userId = localStorage.getItem('clerk-user-id') || ''
    } catch (error) {
      console.error('Error accessing localStorage:', error)
    }
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          'x-user-id': userId
        }
      },
      auth: {
        persistSession: false // Desabilitar persistência de sessão para evitar problemas com Edge
      }
    }
  )
} 