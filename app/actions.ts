'use server'

import { createSupabaseServerClient } from '@/app/supabase/server'
import { auth } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'

export async function uploadVideo(formData: FormData) {
  try {
    const { userId } = auth()
    if (!userId) throw new Error('Unauthorized')

    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const thumbnail = formData.get('thumbnail') as File
    if (!thumbnail) throw new Error('No thumbnail provided')

    const title = formData.get('title') as string
    if (!title) throw new Error('Title is required')

    const description = formData.get('description') as string
    const supabase = await createSupabaseServerClient()

    // 1. Upload video
    const videoExt = file.name.split('.').pop()
    const videoName = `${Math.random()}.${videoExt}`
    const videoPath = `${userId}/videos/${videoName}`

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('videos')
      .upload(videoPath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw new Error('Error uploading video')
    if (!uploadData?.path) throw new Error('Video path not found')

    // 2. Upload thumbnail
    const thumbnailPath = `${userId}/videos/${videoName}_0.jpg`
    
    const { error: thumbError } = await supabase.storage
      .from('videos')
      .upload(thumbnailPath, thumbnail, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      })

    if (thumbError) throw new Error('Error uploading thumbnail')

    // Get URLs with full paths
    const { data: { publicUrl: videoUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(videoPath)

    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(thumbnailPath)

    // Log URLs for debugging
    console.log('Video URL:', videoUrl)
    console.log('Thumbnail URL:', thumbnailUrl)

    // 3. Save video to database
    const { error: dbError, data: videoData } = await supabase
      .from('videos')
      .insert({
        title: title.trim(),
        description: description?.trim(),
        url: videoUrl,
        thumbnail_url: thumbnailUrl,
        user_id: userId,
        status: 'published',
        processing_status: 'completed'
      })
      .select()
      .single()

    if (dbError) {
      await Promise.all([
        supabase.storage.from('videos').remove([videoPath]),
        supabase.storage.from('videos').remove([thumbnailPath])
      ])
      throw new Error(`Error saving video information: ${dbError.message}`)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Error uploading video')
  }
}

export async function deleteVideo(videoId: string) {
  try {
    const { userId } = auth()
    if (!userId) throw new Error('Unauthorized')

    const supabase = await createSupabaseServerClient()

    // 1. Get video details
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('url, thumbnail_url')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw new Error('Video not found')

    // 2. Delete files from storage
    const videoPath = video.url.split('/storage/v1/object/public/videos/')[1]
    const thumbnailPath = video.thumbnail_url?.split('/storage/v1/object/public/videos/')[1]

    if (videoPath) {
      await supabase.storage
        .from('videos')
        .remove([videoPath])
    }

    if (thumbnailPath) {
      await supabase.storage
        .from('videos')
        .remove([thumbnailPath])
    }

    // 3. Delete from database
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Delete error:', error)
    throw new Error(error.message || 'Error deleting video')
  }
} 