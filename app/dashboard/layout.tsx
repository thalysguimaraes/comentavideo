import { auth } from "@clerk/nextjs"
import { createSupabaseServerClient } from '@/app/supabase/server'
import { DashboardLayoutClient } from './layout-client'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()
  if (!userId) {
    redirect('/auth/login')
  }

  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return (
    <DashboardLayoutClient 
      userId={userId} 
      videoCount={count || 0}
    >
      {children}
    </DashboardLayoutClient>
  )
} 