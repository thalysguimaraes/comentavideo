import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

async function getFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg({ log: true })
    await ffmpeg.load()
  }
  return ffmpeg
}

export async function generateThumbnailAtTime(videoUrl: string, timestamp: number): Promise<Blob> {
  const ffmpeg = await getFFmpeg()

  // Download the video file
  const videoData = await fetchFile(videoUrl)
  ffmpeg.writeFile('input.mp4', videoData)

  // Generate thumbnail at specific timestamp
  await ffmpeg.exec([
    '-ss', timestamp.toString(),
    '-i', 'input.mp4',
    '-vframes', '1',
    '-vf', 'scale=320:-1',
    '-f', 'image2',
    'output.jpg'
  ])

  // Read the result
  const data = await ffmpeg.readFile('output.jpg')

  // Clean up
  await ffmpeg.deleteFile('input.mp4')
  await ffmpeg.deleteFile('output.jpg')

  return new Blob([data], { type: 'image/jpeg' })
}

export async function generateThumbnails(
  videoUrl: string,
  videoId: string,
  timestamps: number[],
  onProgress?: (current: number, total: number) => void
): Promise<{ timestamp: number, blob: Blob }[]> {
  const thumbnails: { timestamp: number, blob: Blob }[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i]
    const blob = await generateThumbnailAtTime(videoUrl, timestamp)
    thumbnails.push({ timestamp, blob })
    onProgress?.(i + 1, timestamps.length)
  }

  return thumbnails
} 