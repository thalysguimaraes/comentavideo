'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
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
}

interface CommentsSidebarProps {
  videoId: string
  videoUrl: string
}

export function CommentsSidebar({ videoId, videoUrl }: CommentsSidebarProps) {
  const supabase = createSupabaseClient()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const { toast } = useToast()
  const { seekTo } = usePlayer()

  useEffect(() => {
    loadComments()
    
    const subscription = supabase
      .channel('comments')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `video_id=eq.${videoId}`
      }, payload => {
        setComments(current => [...current, payload.new as Comment])
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
    return () => window.removeEventListener('videoTimeUpdate', handleTimeUpdate as EventListener)
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
        title: 'Identificação necessária',
        description: 'Por favor, informe seu nome para comentar.'
      })
      return
    }

    if (!newComment.trim()) return

    try {
      const { error, data } = await supabase.from('comments')
        .insert({
          video_id: videoId,
          content: newComment,
          timestamp: currentTime,
          author_name: authorName
        })
        .select('*')
        .single()

      if (error) throw error

      setComments(comments => [...comments, data])
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
      
      // Verificar se o comentário pertence ao usuário atual
      const { data: comment } = await supabase
        .from('comments')
        .select('author_name')
        .eq('id', commentId)
        .single()

      if (!comment || comment.author_name !== currentUser) {
        throw new Error('Você não tem permissão para excluir este comentário')
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_name', currentUser) // Dupla verificação de segurança

      if (error) throw error

      // Atualizar estado local
      setComments(comments => comments.filter(c => c.id !== commentId))

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
    <>
      <AuthorDialog />
      <div className="h-full flex flex-col p-4">
        <h2 className="font-bold mb-4">Comentários</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {comments.map(comment => (
            <CommentCard 
              key={comment.id} 
              comment={comment}
              videoUrl={videoUrl}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="w-full"
          />
          <Button 
            onClick={handleAddComment}
            className="w-full"
          >
            Comentar em {formatTime(currentTime)}
          </Button>
        </div>
      </div>
    </>
  )
} 