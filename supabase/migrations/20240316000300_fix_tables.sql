    -- Add missing columns if they don't exist
    alter table if exists public.videos 
    add column if not exists processing_status text default 'pending',
    add column if not exists status text default 'draft';

    -- Update column constraints
    do $$ 
    begin
    -- Drop existing constraints if they exist
    begin
        alter table public.videos drop constraint if exists processing_status_check;
    exception when others then
        null;
    end;
    
    begin
        alter table public.videos drop constraint if exists status_check;
    exception when others then
        null;
    end;
    end $$;

    alter table if exists public.videos 
    alter column processing_status set not null,
    alter column status set not null;

    -- Add constraints
    alter table public.videos 
    add constraint processing_status_check 
        check (processing_status in ('pending', 'processing', 'completed', 'failed')),
    add constraint status_check 
        check (status in ('draft', 'published'));

    -- Update existing videos
    update videos
    set 
    processing_status = 'completed',
    thumbnail_url = regexp_replace(
        url,
        '^(https?://[^/]+/storage/v1/object/public/videos/)([^/]+)$',
        '\1thumbnails/\2_0.jpg'
    )
    where (processing_status = 'pending' OR processing_status = 'processing')
    and thumbnail_url IS NULL;

    -- Create processing queue table if needed
    create table if not exists public.video_processing_queue (
        id uuid default gen_random_uuid() primary key,
        video_id uuid references public.videos(id) on delete cascade,
        status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
        error text
    );

    -- Enable RLS on the queue if not already enabled
    alter table if exists public.video_processing_queue enable row level security;

    -- Handle policy creation
    do $$ 
    begin
    -- Drop existing policy if it exists
    begin
        drop policy if exists "Users can view their own processing queue" on video_processing_queue;
    exception when others then
        null;
    end;
    end $$;

    -- Create queue policy
    create policy "Users can view their own processing queue"
        on video_processing_queue for select
        using (
            video_id in (
                select id from videos where user_id = auth.uid()::text
            )
        ); 