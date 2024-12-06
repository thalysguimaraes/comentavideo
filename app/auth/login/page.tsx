'use client'

import { SignIn } from "@clerk/nextjs/app-beta"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-background border shadow-sm",
          }
        }}
        redirectUrl="/dashboard"
        afterSignInUrl="/dashboard"
        signUpUrl="/auth/register"
      />
    </div>
  )
} 