'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  url: string
  created_at: string
}

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos: initialVideos }: VideoListProps) {
  const [videos, setVideos] = useState(initialVideos)
  const supabase = createSupabaseClient()

  async function handleDelete(videoId: string) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (!error) {
      setVideos(videos.filter(video => video.id !== videoId))
    }
  }

  return (
    <div className="grid gap-4">
      {videos.map(video => (
        <div 
          key={video.id} 
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex-1">
            <h3 className="font-medium">{video.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(video.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/video/${video.id}`}>
              <Button variant="outline">Ver</Button>
            </Link>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => handleDelete(video.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 