import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=No code provided', requestUrl.origin))
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }

    // Verify session was created
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login?error=Failed to create session', requestUrl.origin))
    }

    // Successfully authenticated, redirect to next URL
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (err) {
    console.error('Unexpected error in auth callback:', err)
    return NextResponse.redirect(new URL('/auth/login?error=Authentication failed', requestUrl.origin))
  }
} 