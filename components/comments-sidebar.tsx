'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AuthorDialog } from '@/components/author-dialog'
import { CommentCard } from '@/components/comment-card'
import { usePlayer } from '@/contexts/player-context'
import { formatTime } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  timestamp: number
  created_at: string
  author_name: string
  video_id: string
}

interface CommentsSidebarProps {
  videoId: string
  videoUrl: string
}

export function CommentsSidebar({ videoId, videoUrl }: CommentsSidebarProps) {
  const supabase = createSupabaseClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const { toast } = useToast()
  const { seekTo } = usePlayer()

  useEffect(() => {
    loadComments()
    
    const subscription = supabase
      .channel('comments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `video_id=eq.${videoId}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setComments(current => [...current, payload.new as Comment])
        } else if (payload.eventType === 'DELETE') {
          setComments(current => current.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [videoId])

  useEffect(() => {
    const handleTimeUpdate = (e: CustomEvent<{ currentTime: number }>) => {
      setCurrentTime(e.detail.currentTime)
    }

    window.addEventListener('videoTimeUpdate', handleTimeUpdate as EventListener)
    return () => {
      window.removeEventListener('videoTimeUpdate', handleTimeUpdate as EventListener)
    }
  }, [])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(data)
    }
  }

  async function handleAddComment() {
    const authorName = localStorage.getItem('author_name')
    if (!authorName) {
      toast({
        variant: 'destructive',
        title: 'Identificação necess��ria',
        description: 'Por favor, informe seu nome para comentar.'
      })
      return
    }

    if (!newComment.trim()) return

    try {
      const { error, data } = await supabase.from('comments')
        .insert({
          video_id: videoId,
          content: newComment.trim(),
          timestamp: Math.floor(currentTime),
          author_name: authorName
        })
        .select('*')
        .single()

      if (error) throw error

      setNewComment('')
      
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao comentar:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao comentar',
        description: 'Não foi possível adicionar seu comentário.'
      })
    }
  }

  const handleTimeClick = (time: number) => {
    seekTo(time)
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const currentUser = localStorage.getItem('author_name')
      if (!currentUser) {
        throw new Error('Usuário não identificado')
      }

      // First verify if the comment belongs to the current user
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('author_name')
        .eq('id', commentId)
        .single()

      if (fetchError) throw fetchError
      if (!comment || comment.author_name !== currentUser) {
        throw new Error('Você não tem permissão para excluir este comentário')
      }

      // Then delete the comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_name', currentUser)

      if (deleteError) throw deleteError

      // Update local state
      setComments(current => current.filter(c => c.id !== commentId))

      toast({
        title: 'Comentário excluído',
        description: 'Seu comentário foi removido com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao excluir comentário:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error instanceof Error 
          ? error.message 
          : 'Não foi possível excluir o comentário.'
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <AuthorDialog />
      <div className="pt-6 px-6">
        <h2 className="font-semibold">comentários</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {comments.map(comment => (
            <CommentCard 
              key={comment.id} 
              comment={comment}
              videoUrl={videoUrl}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      </div>
      <div className="p-6 border-t bg-background">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="adicione um comentário..."
          className="w-full mb-2 resize-none"
          rows={3}
        />
        <Button 
          onClick={handleAddComment}
          className="w-full mt-2"
        >
          comentar em {formatTime(currentTime)}
        </Button>
      </div>
    </div>
  )
} 