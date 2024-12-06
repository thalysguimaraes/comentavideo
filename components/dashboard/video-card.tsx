'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Play, MessageCircle, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  viewCount, 
  commentCount,
  onDelete 
}: VideoCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/video/${id}`}
        className="block relative aspect-video overflow-hidden rounded-lg bg-muted hover:opacity-75 transition"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2">
        <Link href={`/video/${id}`} className="block">
          <h3 className="font-medium line-clamp-2 leading-tight mb-1 pt-1 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 