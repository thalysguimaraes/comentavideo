import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css"
import { Toaster } from '@/components/ui/toaster'
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "VideoLink",
  description: "Compartilhe vídeos com comentários em momentos específicos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <ClerkProvider
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card shadow-none",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90"
            }
          }}
        >
          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
