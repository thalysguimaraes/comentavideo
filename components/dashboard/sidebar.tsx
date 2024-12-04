'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import Lottie from 'lottie-react'
import videoAnimation from '@/public/lottie.json'

const STORAGE_LIMIT_MB = 1024 // 1GB em MB

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [storageUsed, setStorageUsed] = useState(0)
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function calculateStorageUsage() {
      if (!user?.id) return

      try {
        // Lista todos os arquivos do usuário
        const { data: videos } = await supabase
          .from('videos')
          .select('url')
          .eq('user_id', user.id)

        if (!videos) return

        // Obtém os metadados de cada arquivo
        const filePromises = videos.map(async (video) => {
          const fileName = video.url.split('/').pop()
          if (!fileName) return 0

          const { data } = await supabase
            .storage
            .from('videos')
            .getPublicUrl(fileName)

          // Faz uma requisição HEAD para obter o tamanho do arquivo
          const response = await fetch(data.publicUrl, { method: 'HEAD' })
          const sizeInBytes = parseInt(response.headers.get('content-length') || '0')
          return sizeInBytes / (1024 * 1024) // Converte para MB
        })

        const fileSizes = await Promise.all(filePromises)
        const totalSize = fileSizes.reduce((acc, size) => acc + size, 0)
        setStorageUsed(totalSize)
      } catch (error) {
        console.error('Erro ao calcular uso de storage:', error)
      }
    }

    calculateStorageUsage()
  }, [user?.id])

  const storagePercentage = Math.min((storageUsed / STORAGE_LIMIT_MB) * 100, 100)
  const formattedStorage = storageUsed.toFixed(1)

  return (
    <div className="flex flex-col h-full shadow-2xl bg-background">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-16 h-16">
            <Lottie
              animationData={videoAnimation}
              loop={true}
              className="w-full h-full"
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {/* {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })} */}
      </nav>

      {/* Storage Usage */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <div className="text-sm font-medium">uso de espaço</div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {formattedStorage}MB de 1GB usados
          </div>
        </div>
      </div>

      {/* User Button */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <UserButton 
            afterSignOutUrl="/"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 