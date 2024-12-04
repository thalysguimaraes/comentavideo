'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Lottie from 'lottie-react'
import videoAnimation from '@/public/lottie.json'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="flex-1 pt-12 pb-16 flex items-center">
      <div className="container flex flex-col items-center text-center">
        {/* Lottie Animation */}
        <div className="mb-8 w-32 h-32">
          <Lottie
            animationData={videoAnimation}
            loop={true}
            className="w-full h-full"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mb-6">
          Compartilhe vídeos e{' '}
          <span className="text-primary">receba feedback rápido</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          Faça upload dos seus vídeos e permita que outras pessoas comentem em momentos específicos. 
          Uma alternativa perfeita para feedback, revisões e colaboração.
        </p>
        <Button size="lg" className='w-40' asChild>
          <Link href="/sign-up">
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
} 