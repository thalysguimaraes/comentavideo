import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { auth } from '@clerk/nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export async function createSupabaseServerClient() {
  const { userId } = auth()

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          'x-user-id': userId || ''
        }
      }
    }
  )
}