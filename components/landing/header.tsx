'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-semibold">comenta.video</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">
              Entrar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">
              Criar conta
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 