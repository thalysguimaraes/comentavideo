'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MoreVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

interface VideoActionsProps {
  videoId: string
  userId: string
}

export function VideoActions({ videoId, userId }: VideoActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: 'Vídeo excluído',
        description: 'O vídeo foi excluído com sucesso.'
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o vídeo.'
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          size="icon"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDelete}
        >
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 