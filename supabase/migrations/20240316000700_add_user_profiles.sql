-- Create user_profiles table if it doesn't exist
create table if not exists public.user_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id text unique not null,
    username text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table if exists public.user_profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
    on user_profiles for select
    using (true);

create policy "Users can insert their own profile"
    on user_profiles for insert
    with check (auth.uid()::text = user_id);

create policy "Users can update own profile"
    on user_profiles for update
    using (auth.uid()::text = user_id);

-- Create trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
    before update on user_profiles
    for each row
    execute function update_updated_at_column(); 