'use client'

import { Button } from '@/components/ui/button'
import { SignInButton, SignUpButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-semibold">comenta.video</div>
        <div className="flex items-center gap-4">
          <SignInButton mode="modal">
            <Button variant="ghost">
              Entrar
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>
              Criar conta
            </Button>
          </SignUpButton>
        </div>
      </div>
    </header>
  )
} 