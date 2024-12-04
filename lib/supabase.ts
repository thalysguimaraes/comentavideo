import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para server components
export async function createSupabaseServer() {
  const { userId } = auth()
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'x-user-id': userId || ''
      }
    }
  })
}

// Cliente para client components com gerenciamento de estado
let clientInstance: ReturnType<typeof createClient> | null = null

export function createSupabaseClient() {
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'x-user-id': ''
        }
      }
    })
  }

  if (!clientInstance) {
    let userId = ''
    try {
      userId = window.localStorage.getItem('clerk-user-id') || ''
    } catch (error) {
      console.error('Error accessing localStorage:', error)
    }

    clientInstance = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'x-user-id': userId
        }
      }
    })
  }

  return clientInstance
} 