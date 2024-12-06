'use client'

import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UploadDrawer } from '@/components/upload-drawer'
import { createSupabaseClient } from '@/lib/supabase'

export function Header() {
  const [open, setOpen] = useState(false)
  const [videoCount, setVideoCount] = useState(0)
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function loadVideoCount() {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })

      if (count !== null) {
        setVideoCount(count)
      }
    }

    loadVideoCount()

    // Inscrever para atualizações
    const channel = supabase
      .channel('videos-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'videos' 
        }, 
        () => {
          setVideoCount(prev => prev + 1)
        }
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'videos' 
        }, 
        () => {
          setVideoCount(prev => prev - 1)
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  return (
    <>
      <div>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">meus vídeos</h1>
              <h2 className="text-sm font-medium text-muted-foreground">
                {videoCount} {videoCount === 1 ? 'vídeo' : 'vídeos'}
              </h2>
            </div>

            <Button onClick={() => setOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              novo vídeo
            </Button>
          </div>
        </div>
      </div>

      <UploadDrawer 
        open={open} 
        onOpenChange={setOpen}
      />
    </>
  )
} 