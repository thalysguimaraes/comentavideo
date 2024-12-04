import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-100">
      <SignIn 
        appearance={{
          elements: {
            baseTheme: "default",
            colorPrimary: "#000000",
            colorTextOnPrimaryBackground: "#FFFFFF",
            colorTextSecondary: "#666666",
            colorBackground: "#FFFFFF",
            colorInputBackground: "#FFFFFF",
            colorInputText: "#000000",
            colorTextOnPrimary: "#FFFFFF",
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
} 