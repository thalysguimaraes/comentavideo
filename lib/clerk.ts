import { authMiddleware } from "@clerk/nextjs"

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}

export const middleware = authMiddleware({
  publicRoutes: ["/sign-in", "/sign-up"],
  afterAuth(auth, req) {
    // Redirecionar para onboarding se não tiver nome
    if (auth.userId && !auth.user?.firstName && req.url !== "/onboarding") {
      const onboardingUrl = new URL("/onboarding", req.url)
      return Response.redirect(onboardingUrl)
    }
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
} 