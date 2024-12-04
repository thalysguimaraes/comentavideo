import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook"],
  afterAuth(auth, req) {
    // Redirecionar para onboarding se não tiver nome
    if (auth.userId && !auth.user?.firstName && !req.url.includes('/onboarding')) {
      const onboardingUrl = new URL('/onboarding', req.url)
      return Response.redirect(onboardingUrl)
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
  runtime: 'nodejs'
} 