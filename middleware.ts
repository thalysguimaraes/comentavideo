import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook"],
  beforeAuth: (req) => {
    // Seu código aqui
  },
  afterAuth: (auth, req) => {
    if (auth.userId && !auth.user?.firstName && !req.url.includes('/onboarding')) {
      const url = req.url.replace(req.nextUrl.pathname, '/onboarding')
      return Response.redirect(url)
    }
  }
})

// Configuração do matcher sem runtime específico
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
} 