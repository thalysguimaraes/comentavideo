-- Drop video_views table and related functions
drop function if exists increment_view_count(uuid, text);
drop table if exists public.video_views;
 