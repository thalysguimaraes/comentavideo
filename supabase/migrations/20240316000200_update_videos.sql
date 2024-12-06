-- Update existing videos to completed status if they're stuck in processing
UPDATE videos
SET 
  processing_status = 'completed',
  thumbnail_url = CASE 
    WHEN url LIKE '%/storage/v1/object/public/videos/%' THEN 
      regexp_replace(
        url,
        '/storage/v1/object/public/videos/([^/]+)$',
        '/storage/v1/object/public/videos/thumbnails/\1_0.jpg'
      )
    ELSE url || '_0.jpg'
  END
WHERE (processing_status = 'pending' OR processing_status = 'processing')
AND thumbnail_url IS NULL; 