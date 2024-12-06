'use server'

import { createSupabaseServerClient } from '@/app/supabase/server'
import { auth } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'
import { generateThumbnails } from '@/lib/video-utils'
import { createClient } from '@supabase/supabase-js'

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

    // 2. Upload initial thumbnail
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

    // 4. Generate and upload thumbnails at different timestamps
    const timestamps = [0, 5, 10, 15, 30, 45, 60] // Timestamps in seconds
    const thumbnails = await generateThumbnails(videoUrl, videoData.id, timestamps)

    // Upload each thumbnail
    for (const { timestamp, blob } of thumbnails) {
      const thumbPath = `${userId}/videos/${videoName}_${timestamp}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(thumbPath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error(`Error uploading thumbnail at ${timestamp}s:`, uploadError)
        continue
      }

      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(thumbPath)

      // Save thumbnail reference in the database
      await supabase
        .from('video_thumbnails')
        .insert({
          video_id: videoData.id,
          timestamp,
          url: thumbUrl
        })
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Error uploading video')
  }
}

export async function deleteVideo(videoId: string) {
  console.log('\n=== START DELETE VIDEO PROCESS ===')
  console.log('VideoId:', videoId)
  
  try {
    const { userId } = auth()
    if (!userId) {
      console.log('❌ No userId found')
      throw new Error('Unauthorized')
    }
    console.log('✅ UserId:', userId)

    // Create service role client for both DB and storage operations
    console.log('🔑 Creating service role client...')
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    )

    // First check if video exists and belongs to user
    console.log('🔍 Checking if video exists...')
    const { data: video, error: checkError } = await serviceRoleClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single()

    if (checkError || !video) {
      console.error('❌ Video not found or unauthorized:', checkError)
      throw new Error('Video not found or unauthorized')
    }
    console.log('✅ Video found:', video)

    // 1. Delete the video record first (will cascade to related records)
    console.log('🗑️ Attempting to delete video record...')
    const { error: deleteError } = await serviceRoleClient
      .from('videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('❌ Error deleting video record:', deleteError)
      throw new Error('Failed to delete video record')
    }
    console.log('✅ Video record deleted')

    // 2. Delete storage files
    console.log('📁 Setting up storage deletion...')
    
    // List all files in user's directory
    const { data: files, error: listError } = await serviceRoleClient.storage
      .from('videos')
      .list(`${userId}/videos`)

    if (listError) {
      console.error('❌ Error listing files:', listError)
      throw new Error('Failed to list video files')
    }
    console.log('📄 Files found:', files?.length || 0)

    // Filter and delete files related to this video
    const videoFiles = files?.filter(file => file.name.includes(videoId))
    console.log('🎯 Files to delete:', videoFiles?.map(f => f.name))

    if (videoFiles?.length) {
      const filePaths = videoFiles.map(file => `${userId}/videos/${file.name}`)
      console.log('🗑️ Attempting to delete files:', filePaths)

      const { error: deleteStorageError } = await serviceRoleClient.storage
        .from('videos')
        .remove(filePaths)

      if (deleteStorageError) {
        console.error('❌ Error deleting files:', deleteStorageError)
        throw new Error('Failed to delete video files')
      }
      console.log('✅ Storage files deleted')
    } else {
      console.log('ℹ️ No files found to delete')
    }

    revalidatePath('/dashboard')
    console.log('✅ DELETE VIDEO PROCESS COMPLETED')
    return { success: true }
  } catch (error: any) {
    console.error('\n❌ DELETE OPERATION FAILED')
    console.error('Error details:', error)
    console.error('Stack trace:', error.stack)
    throw new Error(error.message || 'Error deleting video')
  }
} 