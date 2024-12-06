-- Drop existing policies if they exist
do $$ 
begin
    begin
        drop policy if exists "Users can view any video thumbnail" on video_thumbnails;
    exception when others then
        null;
    end;
    
    begin
        drop policy if exists "Users can create thumbnails for their own videos" on video_thumbnails;
    exception when others then
        null;
    end;
    
    begin
        drop policy if exists "Users can update thumbnails for their own videos" on video_thumbnails;
    exception when others then
        null;
    end;
    
    begin
        drop policy if exists "Users can delete thumbnails for their own videos" on video_thumbnails;
    exception when others then
        null;
    end;
end $$;

-- Create a table to store video thumbnails at different timestamps
create table if not exists public.video_thumbnails (
    id uuid default gen_random_uuid() primary key,
    video_id uuid references public.videos(id) on delete cascade,
    timestamp integer not null,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(video_id, timestamp)
);

-- Enable RLS
alter table if exists public.video_thumbnails enable row level security;

-- Create policies
create policy "Users can view any video thumbnail"
    on video_thumbnails for select
    using (true);

create policy "Users can create thumbnails for their own videos"
    on video_thumbnails for insert
    with check (
        video_id in (
            select id from videos where user_id = auth.uid()::text
        )
    );

create policy "Users can update thumbnails for their own videos"
    on video_thumbnails for update
    using (
        video_id in (
            select id from videos where user_id = auth.uid()::text
        )
    );

create policy "Users can delete thumbnails for their own videos"
    on video_thumbnails for delete
    using (
        video_id in (
            select id from videos where user_id = auth.uid()::text
        )
    );

-- Drop existing function if it exists
drop function if exists get_nearest_thumbnail(uuid, integer);

-- Create function to get nearest thumbnail
create or replace function get_nearest_thumbnail(video_id uuid, target_timestamp integer)
returns text
language plpgsql
as $$
declare
    nearest_url text;
begin
    select url
    into nearest_url
    from video_thumbnails
    where video_thumbnails.video_id = get_nearest_thumbnail.video_id
    order by abs(timestamp - target_timestamp)
    limit 1;

    return nearest_url;
end;
$$; 