-- Supabase Storage buckets for El Atomo Inox admin media.
-- Applied to project ydxqsvcckiywttvlldua on 2026-07-07.
-- Bucket limits were tightened on 2026-07-07 after adding server-side compression:
-- - Images are stored only as WebP, max 1MB.
-- - Videos are stored only as WebM, max 10MB.
--
-- DB columns keep storing public URLs:
-- - catalog_product_photos.image_src -> catalog-product-images
-- - business_branches.facade_image_src -> branch-images
-- - business_work_result_images.image_src -> work-result-images
-- - business_work_process_videos.video_src and business_work_result_videos.video_src -> work-videos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'catalog-product-images',
    'catalog-product-images',
    true,
    1048576,
    array['image/webp']::text[]
  ),
  (
    'branch-images',
    'branch-images',
    true,
    1048576,
    array['image/webp']::text[]
  ),
  (
    'work-result-images',
    'work-result-images',
    true,
    1048576,
    array['image/webp']::text[]
  ),
  (
    'work-videos',
    'work-videos',
    true,
    10485760,
    array['video/webm']::text[]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'buckets'
      and policyname = 'Public can read El Atomo managed buckets'
  ) then
    create policy "Public can read El Atomo managed buckets"
    on storage.buckets for select
    to anon, authenticated
    using (id in ('catalog-product-images', 'branch-images', 'work-result-images', 'work-videos'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'buckets'
      and policyname = 'Admins can manage El Atomo managed buckets'
  ) then
    create policy "Admins can manage El Atomo managed buckets"
    on storage.buckets for all
    to authenticated
    using (
      id in ('catalog-product-images', 'branch-images', 'work-result-images', 'work-videos')
      and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
    )
    with check (
      id in ('catalog-product-images', 'branch-images', 'work-result-images', 'work-videos')
      and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read El Atomo managed assets'
  ) then
    create policy "Public can read El Atomo managed assets"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id in ('catalog-product-images', 'branch-images', 'work-result-images', 'work-videos'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins can manage El Atomo managed assets'
  ) then
    create policy "Admins can manage El Atomo managed assets"
    on storage.objects for all
    to authenticated
    using (
      bucket_id in ('catalog-product-images', 'branch-images', 'work-result-images', 'work-videos')
      and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
    )
    with check (
      bucket_id in ('catalog-product-images', 'branch-images', 'work-result-images', 'work-videos')
      and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
    );
  end if;
end $$;
