import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <SignIn 
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-card shadow-none",
          formButtonPrimary: "bg-primary hover:bg-primary/90",
          footerActionLink: "text-primary hover:text-primary/90"
        }
      }}
      redirectUrl="/dashboard"
    />
  )
} 