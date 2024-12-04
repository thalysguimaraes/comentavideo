import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Hero } from '@/components/landing/hero'
import { Header } from '@/components/landing/header'

// Configurar geração estática apenas para a página inicial
export const dynamic = 'force-static'

export default async function Home() {
  const { userId } = auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />

      {/* Footer */}
      <footer className="py-6">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 comenta.video 
          </p>
          <p className="text-xs text-muted-foreground">
            feito por <a href="https://thalys.design" className="text-foreground font-medium hover:text-primary transition-colors">thalys guimarães</a> em 2024
          </p>
        </div>
      </footer>
    </div>
  )
}
