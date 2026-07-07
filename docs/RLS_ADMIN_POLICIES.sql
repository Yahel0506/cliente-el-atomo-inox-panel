-- Starter SQL. Revisar nombres reales de roles/claims antes de aplicar.
-- Supabase: mantener RLS en tablas expuestas y no usar user_metadata para permisos.

alter table public.business_contact_info enable row level security;
alter table public.business_branches enable row level security;
alter table public.business_work_process_videos enable row level security;
alter table public.business_work_result_videos enable row level security;
alter table public.business_work_result_images enable row level security;
alter table public.catalog_categories enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_product_photos enable row level security;
alter table public.catalog_product_recommended_uses enable row level security;
alter table public.catalog_product_branches enable row level security;

-- Public web reads: only active parent records. Child tables are readable because
-- active products are filtered by the web before rendering.
create policy "Public can read active contact"
on public.business_contact_info for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active branches"
on public.business_branches for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active work process videos"
on public.business_work_process_videos for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active work result videos"
on public.business_work_result_videos for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active work result images"
on public.business_work_result_images for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active categories"
on public.catalog_categories for select
to anon, authenticated
using (is_active = true);

create policy "Public can read active products"
on public.catalog_products for select
to anon, authenticated
using (is_active = true);

create policy "Public can read product photos"
on public.catalog_product_photos for select
to anon, authenticated
using (true);

create policy "Public can read recommended uses"
on public.catalog_product_recommended_uses for select
to anon, authenticated
using (true);

create policy "Public can read product branches"
on public.catalog_product_branches for select
to anon, authenticated
using (true);

-- Admin writes. Uses app_metadata.role from JWT; token refresh required after role changes.
-- For stricter guarantees, replace this with a protected admin_users table/RPC.
create policy "Admins can manage contact"
on public.business_contact_info for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage branches"
on public.business_branches for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage catalog products"
on public.catalog_products for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage process videos"
on public.business_work_process_videos for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage result videos"
on public.business_work_result_videos for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage result images"
on public.business_work_result_images for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage categories"
on public.catalog_categories for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage product photos"
on public.catalog_product_photos for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage recommended uses"
on public.catalog_product_recommended_uses for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can manage product branches"
on public.catalog_product_branches for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
