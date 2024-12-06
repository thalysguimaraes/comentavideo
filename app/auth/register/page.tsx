'use client'

import { SignUp } from "@clerk/nextjs/app-beta"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-background border shadow-sm",
          }
        }}
        redirectUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        signInUrl="/auth/login"
      />
    </div>
  )
} 