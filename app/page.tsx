import { redirect } from 'next/navigation'
import { Hero } from '@/components/landing/hero'
import { Header } from '@/components/landing/header'
import { auth } from '@clerk/nextjs'

export default async function Home() {
  const { userId } = auth()
  
  // Only redirect to dashboard if user is authenticated
  if (userId) {
    redirect('/dashboard')
  }

  // Show landing page for non-authenticated users
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />

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
