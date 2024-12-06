'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Play, MessageCircle, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface VideoCardProps {
  id: string
  title: string
  url: string
  thumbnailUrl: string | null
  viewCount: number
  commentCount: number
  onDelete: () => void
}

export function VideoCard({ 
  id, 
  title,
  url, 
  thumbnailUrl, 
  viewCount: initialViewCount, 
  commentCount: initialCommentCount,
  onDelete 
}: VideoCardProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [viewCount, setViewCount] = useState(initialViewCount)
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function loadCounts() {
      // Get comment count
      const { count: comments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', id)

      setCommentCount(comments || 0)
    }

    loadCounts()
  }, [id, supabase])

  const handleDelete = () => {
    onDelete()
    setShowDeleteAlert(false)
  }

  return (
    <>
      <div className="group relative bg-card rounded-lg overflow-hidden border transition-all hover:shadow-xl">
        <Link
          href={`/video/${id}`}
          className="block relative aspect-video overflow-hidden bg-muted"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="h-8 w-8 text-muted-foreground"
                >
                  <path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="absolute h-12 w-12 text-white opacity-75 group-hover:opacity-100 transition-opacity"
            >
              <path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" />
            </svg>
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/video/${id}`} className="block">
            <h3 className="font-medium line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{initialViewCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteAlert(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vídeo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 