import { authMiddleware, clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default authMiddleware({
  async afterAuth(auth, req) {
    if (!auth.userId) return

    try {
      const user = await clerkClient.users.getUser(auth.userId)
      const supabase = createServerComponentClient({ cookies })

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', auth.userId)
        .single()

      // If no profile exists, create one
      if (!existingProfile) {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: auth.userId,
            username: user.firstName || user.username || user.id.split('_')[1] || 'Usuário'
          })
      }
    } catch (error) {
      console.error('Error in auth middleware:', error)
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
} 