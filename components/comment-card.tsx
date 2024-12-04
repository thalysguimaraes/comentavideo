'use client'

import { formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play, Trash2 } from 'lucide-react'
import { usePlayer } from '@/contexts/player-context'
import { useState } from 'react'
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
import { createSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'

interface CommentCardProps {
  comment: {
    id: string
    content: string
    timestamp: number
    created_at: string
    author_name: string
  }
  videoUrl: string
  onDelete: (commentId: string) => Promise<void>
}

export function CommentCard({ comment, videoUrl, onDelete }: CommentCardProps) {
  const { seekTo } = usePlayer()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const currentUser = localStorage.getItem('author_name')
  const isOwnComment = currentUser === comment.author_name

  const getThumbnailUrl = (videoUrl: string, timestamp: number) => {
    const fileName = videoUrl.split('/').pop()
    if (!fileName) return null

    // Escolher a thumbnail mais próxima do timestamp
    const thumbnailIndex = Math.floor(timestamp / 5)
    const thumbnailPath = `thumbnails/${fileName}_${thumbnailIndex}.jpg`
    
    return createSupabaseClient()
      .storage
      .from('videos')
      .getPublicUrl(thumbnailPath)
      .data.publicUrl
  }

  const thumbnailUrl = getThumbnailUrl(videoUrl, comment.timestamp)

  const handleTimeClick = () => {
    seekTo(comment.timestamp)
  }

  const handleDelete = async () => {
    await onDelete(comment.id)
    setShowDeleteAlert(false)
  }

  return (
    <>
      <div className="p-3 bg-card rounded-lg border">
        <div className="flex justify-between items-start mb-2">
          <span className="font-medium">{comment.author_name}</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleTimeClick}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {formatTime(comment.timestamp)}
            </Button>
            {isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                className="text-xs text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center group"
            onClick={handleTimeClick}
          >
            <div className="absolute inset-0">
              <Image
                src={thumbnailUrl}
                alt={`Momento ${formatTime(comment.timestamp)}`}
                fill
                className="object-cover"
                onError={(e) => {
                  // In case of error, hide the image
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <Play className="absolute w-6 h-6 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-1 right-1 text-[10px] text-white font-medium shadow">
              {formatTime(comment.timestamp)}
            </span>
          </button>
          <p className="text-sm flex-1">{comment.content}</p>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
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