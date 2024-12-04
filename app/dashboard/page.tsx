import { VideoGrid } from '@/components/dashboard/video-grid'
import { createSupabaseServer } from '@/lib/supabase'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const supabase = await createSupabaseServer()
  
  const { data: videos } = await supabase
    .from('videos')
    .select(`
      *,
      comments:comments(count),
      views:views(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const formattedVideos = videos?.map(video => ({
    ...video,
    views_count: Number(video.views?.[0]?.count || 0),
    comments_count: Number(video.comments?.[0]?.count || 0),
    views: undefined,
    comments: undefined
  }))

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <VideoGrid videos={formattedVideos || []} />
        </main>
      </div>
    </div>
  )
} 