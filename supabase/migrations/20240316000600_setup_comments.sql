-- Drop existing policies if they exist
do $$ 
begin
    begin
        drop policy if exists "Enable read access for all users" on comments;
    exception when others then
        null;
    end;
    
    begin
        drop policy if exists "Enable insert access for authenticated users" on comments;
    exception when others then
        null;
    end;
    
    begin
        drop policy if exists "Enable delete access for users based on author" on comments;
    exception when others then
        null;
    end;
end $$;

-- Drop existing function if it exists
drop function if exists set_author_name(text);

-- Create comments table if it doesn't exist
create table if not exists public.comments (
    id uuid default gen_random_uuid() primary key,
    video_id uuid references public.videos(id) on delete cascade,
    content text not null,
    timestamp integer not null,
    author_name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table if exists public.comments enable row level security;

-- Create policies
create policy "Enable read access for all users"
    on comments for select
    using (
        video_id in (
            select id from videos where status = 'published'
        )
    );

create policy "Enable insert access for authenticated users"
    on comments for insert
    with check (
        video_id in (
            select id from videos where status = 'published'
        )
    );

create policy "Enable delete access for users based on author"
    on comments for delete
    using (true); 