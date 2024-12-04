import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Interceptar todas as requisições para adicionar o header
  supabase.rest.headers = {
    ...supabase.rest.headers,
    'x-user-id': localStorage.getItem('clerk-user-id') || ''
  }

  return supabase
} 