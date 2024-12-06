'use client'

import { User } from '@supabase/auth-helpers-nextjs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

interface UserButtonProps {
  user: User
}

export function UserButton({ user }: UserButtonProps) {
  return (
    <div className="p-4 border-t mt-auto">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>
            {user?.email?.[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.email?.split('@')[0] || 'Usuário'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 