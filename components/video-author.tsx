'use client'

import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'

interface VideoAuthorProps {
  userId: string
}

export function VideoAuthor({ userId }: VideoAuthorProps) {
  const { user } = useUser()

  if (!user) return null

  return (
    <div className="flex items-center gap-3 p-4 border-t">
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8"
          }
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">
          enviado por{' '}
          <span className="font-medium text-foreground">
            {user.firstName || 'Usuário'}
          </span>
          {' '}usando o{' '}
          <span className="text-primary font-medium">
            comenta.video
          </span>
        </p>
      </div>
    </div>
  )
} 