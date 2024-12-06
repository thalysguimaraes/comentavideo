'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { useAuth } from "@clerk/nextjs"
import { StorageUsage } from '@/components/dashboard/storage-usage'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VideoUploadForm } from '@/components/video-upload-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { userId } = useAuth()

  if (!userId) return null

  const handleCloseSidebar = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowMobileSidebar(false)
      setIsClosing(false)
    }, 200)
  }

  const handleUploadSuccess = () => {
    setShowUploadDialog(false)
    // Refresh the page to show new video
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <Sidebar userId={userId} />
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          showMobileSidebar ? "block" : "hidden"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
            showMobileSidebar ? "opacity-100" : "opacity-0",
            isClosing && "opacity-0"
          )}
          onClick={handleCloseSidebar}
        />
        
        {/* Sidebar */}
        <div 
          className={cn(
            "absolute left-0 top-0 h-full w-[300px] bg-card shadow-lg transition-transform duration-200 ease-in-out",
            showMobileSidebar ? "translate-x-0" : "-translate-x-full",
            isClosing && "-translate-x-full"
          )}
        >
          <Sidebar userId={userId} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="lg:hidden p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-40">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 max-w-[200px]">
              <StorageUsage userId={userId} />
            </div>
            <Button size="sm" onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo vídeo
            </Button>
          </div>
        </div>
        {children}

        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo vídeo</DialogTitle>
            </DialogHeader>
            <VideoUploadForm onSuccess={handleUploadSuccess} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
} 