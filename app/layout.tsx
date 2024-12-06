import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VideoLink',
  description: 'Compartilhe seus vídeos com o mundo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
