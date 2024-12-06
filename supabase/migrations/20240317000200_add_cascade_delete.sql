-- First, clean up any orphaned records
DELETE FROM comments
WHERE video_id NOT IN (SELECT id FROM videos);

DELETE FROM video_thumbnails
WHERE video_id NOT IN (SELECT id FROM videos);

DELETE FROM video_views
WHERE video_id NOT IN (SELECT id FROM videos);

-- Add cascade delete constraints to all related tables
ALTER TABLE video_thumbnails
  DROP CONSTRAINT IF EXISTS video_thumbnails_video_id_fkey,
  ADD CONSTRAINT video_thumbnails_video_id_fkey
    FOREIGN KEY (video_id)
    REFERENCES videos(id)
    ON DELETE CASCADE;

ALTER TABLE video_views
  DROP CONSTRAINT IF EXISTS video_views_video_id_fkey,
  ADD CONSTRAINT video_views_video_id_fkey
    FOREIGN KEY (video_id)
    REFERENCES videos(id)
    ON DELETE CASCADE;

ALTER TABLE comments
  DROP CONSTRAINT IF EXISTS comments_video_id_fkey,
  ADD CONSTRAINT comments_video_id_fkey
    FOREIGN KEY (video_id)
    REFERENCES videos(id)
    ON DELETE CASCADE; 