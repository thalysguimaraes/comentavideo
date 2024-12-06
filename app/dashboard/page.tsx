import { VideoGrid } from '@/components/dashboard/video-grid'
import { auth } from "@clerk/nextjs"
import { createSupabaseServerClient } from '@/app/supabase/server'
import { Database } from '@/lib/database.types'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

type Video = Database['public']['Tables']['videos']['Row'] & {
  views_count: number
  comments_count: number
}

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) return null

  const supabase = await createSupabaseServerClient()
  
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const formattedVideos: Video[] = (videos || []).map(video => ({
    ...video,
    views_count: 0,
    comments_count: 0
  }))

  return <DashboardClient initialVideos={formattedVideos} />
} 