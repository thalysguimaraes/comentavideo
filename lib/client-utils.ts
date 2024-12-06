export async function generateQuickThumbnail(file: File): Promise<Blob> {
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      canvas.width = 640  // Fixed size for quick thumbnail
      canvas.height = 360
      video.currentTime = Math.min(1, video.duration)
      
      video.onseeked = () => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to generate thumbnail'))
          },
          'image/jpeg',
          0.7
        )
      }
    }
    
    video.onerror = () => reject(new Error('Failed to load video'))
    video.src = URL.createObjectURL(file)
  })
} 