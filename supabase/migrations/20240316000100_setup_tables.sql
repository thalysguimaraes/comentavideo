-- Drop existing policies
drop policy if exists "Enable read access for all users" on videos;
drop policy if exists "Enable insert access for authenticated users" on videos;
drop policy if exists "Enable update access for users based on user_id" on videos;
drop policy if exists "Enable delete access for users based on user_id" on videos;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Individual user upload access" on storage.objects;
drop policy if exists "Individual user update access" on storage.objects;
drop policy if exists "Individual user delete access" on storage.objects;

-- Drop and recreate the videos table
drop table if exists public.videos;

create table public.videos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    description text,
    url text not null,
    thumbnail_url text,
    processing_status text not null default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
    user_id text not null,
    status text not null default 'draft' check (status in ('draft', 'published'))
);

-- Enable RLS
alter table public.videos enable row level security;

-- Create policies
create policy "Enable read access for all users"
    on videos for select
    using (status = 'published' OR user_id = auth.uid()::text);

create policy "Enable insert access for authenticated users"
    on videos for insert
    with check (auth.uid()::text = user_id);

create policy "Enable update access for users based on user_id"
    on videos for update
    using (auth.uid()::text = user_id);

create policy "Enable delete access for users based on user_id"
    on videos for delete
    using (auth.uid()::text = user_id);

-- Storage setup
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public Access"
    on storage.objects for select
    using ( bucket_id = 'videos' );

create policy "Individual user upload access"
    on storage.objects for insert
    with check ( bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Individual user update access"
    on storage.objects for update
    using ( bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Individual user delete access"
    on storage.objects for delete
    using ( bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Grant permissions
grant usage on schema storage to service_role;
grant all on storage.objects to service_role;
grant all on storage.buckets to service_role;

-- Add after the videos table creation

-- Create processing queue table
create table if not exists public.video_processing_queue (
    id uuid default gen_random_uuid() primary key,
    video_id uuid references public.videos(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    error text
);

-- Enable RLS on the queue
alter table public.video_processing_queue enable row level security;

-- Create policy for the queue
create policy "Users can view their own processing queue"
    on video_processing_queue for select
    using (
        video_id in (
            select id from videos where user_id = auth.uid()::text
        )
    ); 