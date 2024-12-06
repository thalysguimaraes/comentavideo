-- Create a function to check if a file exists in storage
create or replace function storage_file_exists(bucket text, path text) returns boolean as $$
declare
    result boolean;
begin
    execute format(
        'select exists(select 1 from storage.objects where bucket_id = %L and name = %L)',
        bucket,
        path
    ) into result;
    return result;
end;
$$ language plpgsql;

-- Create a function to move files in storage
create or replace function move_video_files() returns void as $$
declare
    video_record record;
    source_video_path text;
    source_thumb_path text;
    target_video_path text;
    target_thumb_path text;
begin
    -- Get all videos with old path pattern
    for video_record in 
        select 
            id,
            url,
            thumbnail_url,
            regexp_replace(
                url,
                '^https?://[^/]+/storage/v1/object/public/videos/([^/]+)/[^/]+$',
                '\1'
            ) as user_id,
            regexp_replace(
                url,
                '^.*/([^/]+)$',
                '\1'
            ) as filename
        from videos 
        where url not like '%/videos/%'
        and url like '%/storage/v1/object/public/videos/%'
    loop
        -- Construct paths
        source_video_path := format('%s/%s', video_record.user_id, video_record.filename);
        source_thumb_path := format('%s/%s', video_record.user_id, regexp_replace(video_record.filename, '\..*$', '_0.jpg'));
        target_video_path := format('%s/videos/%s', video_record.user_id, video_record.filename);
        target_thumb_path := format('%s/videos/%s', video_record.user_id, regexp_replace(video_record.filename, '\..*$', '_0.jpg'));

        -- Log the planned move operation
        raise notice 'Planning move for record %:', video_record.id;
        raise notice '  Video: % -> %', source_video_path, target_video_path;
        raise notice '  Thumb: % -> %', source_thumb_path, target_thumb_path;

        -- Check if source files exist
        if not storage_file_exists('videos', source_video_path) then
            raise warning 'Source video file not found: %', source_video_path;
            continue;
        end if;

        if not storage_file_exists('videos', source_thumb_path) then
            raise warning 'Source thumbnail file not found: %', source_thumb_path;
            continue;
        end if;

        -- Check if target files already exist
        if storage_file_exists('videos', target_video_path) then
            raise warning 'Target video file already exists: %', target_video_path;
            continue;
        end if;

        if storage_file_exists('videos', target_thumb_path) then
            raise warning 'Target thumbnail file already exists: %', target_thumb_path;
            continue;
        end if;

        begin
            -- Move video file
            execute format(
                'select storage.move(''videos'', %L, ''videos'', %L)',
                source_video_path,
                target_video_path
            );
            
            -- Move thumbnail file
            execute format(
                'select storage.move(''videos'', %L, ''videos'', %L)',
                source_thumb_path,
                target_thumb_path
            );

            raise notice 'Successfully moved files for record %', video_record.id;
        exception when others then
            raise warning 'Error moving files for record %: %', video_record.id, sqlerrm;
            continue;
        end;
    end loop;
end;
$$ language plpgsql;

-- Show current state before changes
select 'Before changes:' as status;
select 
    id,
    url,
    thumbnail_url,
    processing_status
from videos
order by created_at desc;

-- First, move the files in storage
select move_video_files();

-- Then, handle videos with the old path pattern (user_id/...)
update videos
set 
url = regexp_replace(
    url,
    '^(https?://[^/]+/storage/v1/object/public/videos/)([^/]+)/([^/]+)(\..*?)$',
    '\1\2/videos/\3\4'
),
thumbnail_url = regexp_replace(
    url,
    '^(https?://[^/]+/storage/v1/object/public/videos/)([^/]+)/([^/]+)(\..*?)$',
    '\1\2/videos/\3_0.jpg'
)
where url not like '%/videos/%'
and url like '%/storage/v1/object/public/videos/%'
and exists (
    select 1 from storage.objects 
    where bucket_id = 'videos' 
    and name = regexp_replace(
        url,
        '^https?://[^/]+/storage/v1/object/public/videos/(.+)$',
        '\1'
    )
);

-- Drop the helper functions
drop function if exists move_video_files();
drop function if exists storage_file_exists(text, text);

-- Show final state
select 'After changes:' as status;
select 
    id,
    url,
    thumbnail_url,
    processing_status
from videos
order by created_at desc; 