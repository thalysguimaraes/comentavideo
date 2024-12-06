'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface VideoAuthorProps {
  userId: string
}

export function VideoAuthor({ userId }: VideoAuthorProps) {
  const [displayName, setDisplayName] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [initials, setInitials] = useState<string>('')
  const supabase = createSupabaseClient()
  const { user } = useUser()

  useEffect(() => {
    async function fetchUserProfile() {
      // If it's the current user, use Clerk's info and ensure profile exists
      if (user && userId === user.id) {
        const name = user.firstName || user.username || user.id.split('_')[1] || 'Usuário'
        setDisplayName(name)
        setAvatarUrl(user.imageUrl || '')
        setInitials(name[0].toUpperCase())

        // Ensure profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (!existingProfile) {
          await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              username: name
            })
        }
        return
      }

      // Try to get from cache first
      const cachedName = sessionStorage.getItem(`user_${userId}`)
      if (cachedName) {
        setDisplayName(cachedName)
        setInitials(cachedName[0].toUpperCase())
        return
      }

      // Otherwise try to get from Supabase
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', userId)
        .single()

      if (profile?.username) {
        setDisplayName(profile.username)
        setInitials(profile.username[0].toUpperCase())
        sessionStorage.setItem(`user_${userId}`, profile.username)
      } else {
        const fallbackName = userId.split('_')[1] || 'Usuário'
        setDisplayName(fallbackName)
        setInitials(fallbackName[0].toUpperCase())
        sessionStorage.setItem(`user_${userId}`, fallbackName)
      }
    }

    fetchUserProfile()
  }, [userId, user, supabase])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        enviado por
        <span className="font-medium text-foreground">{displayName}</span>
        usando o
        <a href="https://comenta.video" className="font-medium text-foreground hover:text-purple-600 transition-colors">comenta.video</a>
      </div>
    </div>
  )
} 