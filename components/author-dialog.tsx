'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AuthorDialog() {
  const [open, setOpen] = useState(false)
  const [authorName, setAuthorName] = useState('')

  useEffect(() => {
    const savedName = localStorage.getItem('author_name')
    if (!savedName) {
      setOpen(true)
    }
  }, [])

  const handleSave = () => {
    if (authorName.trim()) {
      localStorage.setItem('author_name', authorName.trim())
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Identificação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Para comentar neste vídeo, precisamos saber seu nome:</p>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Digite seu nome"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!authorName.trim()}>
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 