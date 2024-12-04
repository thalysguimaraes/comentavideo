'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { Copy } from 'lucide-react'

interface VideoFormDialogProps {
  videoId: string
  videoUrl: string
  onClose: () => void
}

export function VideoFormDialog({ videoId, videoUrl, onClose }: VideoFormDialogProps) {
  const supabase = createSupabaseClient()
  const [open, setOpen] = useState(true)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { toast } = useToast()

  // Log quando os dados são carregados inicialmente
  useEffect(() => {
    async function loadVideoData() {
      console.log('Carregando dados do vídeo:', videoId)
      const { data: video, error } = await supabase
        .from('videos')
        .select('title, description')
        .eq('id', videoId)
        .single()

      console.log('Dados carregados:', { video, error })

      if (!error && video) {
        setTitle(video.title || '')
        setDescription(video.description || '')
        console.log('States atualizados:', { title: video.title, description: video.description })
      }
    }

    loadVideoData()
  }, [videoId, supabase])

  // Log quando os inputs mudam
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Título alterado:', e.target.value)
    setTitle(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('Descrição alterada:', e.target.value)
    setDescription(e.target.value)
  }

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      // Também deletar o arquivo do storage
      const fileName = videoUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('videos')
          .remove([fileName])
      }

      toast({
        title: 'Vídeo excluído',
        description: 'O vídeo foi removido com sucesso.'
      })

      handleClose()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o vídeo.'
      })
    }
  }

  const handleSave = async () => {
    try {
      const updateData = {
        id: videoId,
        url: videoUrl,
        title: title.trim() || null,
        description: description.trim() || null,
        status: 'published'
      }

      console.log('Dados para atualização:', updateData)
      
      // Fazer update direto sem upsert
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title: title.trim() || null,
          description: description.trim() || null,
          status: 'published'
        })
        .eq('id', videoId)

      console.log('Resultado do update:', { updateError })

      if (updateError) {
        throw updateError
      }

      toast({
        title: 'Vídeo salvo',
        description: 'As informações foram atualizadas com sucesso.'
      })

      setOpen(false)
      setTimeout(() => {
        setShowSuccessDialog(true)
      }, 100)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as informações do vídeo.'
      })
    }
  }

  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}/video/${videoId}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'URL copiada!',
      description: 'A URL do vídeo foi copiada para sua área de transferência.'
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informações do Vídeo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Título</label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Digite um título para o vídeo"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Descrição</label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Digite uma descrição para o vídeo"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteAlert(true)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O vídeo será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAlert(false)}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deu tudo certo!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Compartilhe a URL do vídeo com quem quiser:</p>
            <div className="flex gap-2 items-center">
              <Input
                readOnly
                value={`${window.location.origin}/video/${videoId}`}
              />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 