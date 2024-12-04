import { authMiddleware } from "@clerk/nextjs"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook"],
  afterAuth(auth, req) {
    // Redirecionar para onboarding se não tiver nome
    if (auth.userId && !auth.user?.firstName && !req.url.includes('/onboarding')) {
      const url = new URL('/onboarding', req.url)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
  runtime: 'nodejs'
} 