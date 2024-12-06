'use client'

import Link from 'next/link'
import Lottie from 'lottie-react'
import videoAnimation from '@/public/lottie.json'
import { StorageUsage } from './storage-usage'
import { UserButton, useUser } from "@clerk/nextjs"

interface SidebarProps {
  userId: string
}

export function Sidebar({ userId }: SidebarProps) {
  const { user } = useUser()

  return (
    <div className="w-64 h-screen bg-card shadow-2xl flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/dashboard" className="block">
          <div className="w-12 h-12">
            <Lottie
              animationData={videoAnimation}
              loop={true}
              className="w-full h-full"
            />
          </div>
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        <StorageUsage userId={userId} />
        
        <div className="flex items-center gap-3 py-3">
          <UserButton afterSignOutUrl="/" />
          {user && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.fullName || user.username}</span>
              <span className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 