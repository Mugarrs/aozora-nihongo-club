-- AOZORA: public gallery storage, with admin-only uploads.
-- Run in Supabase SQL Editor after supabase-schema.sql has created public.gallery.
-- Public image URLs are readable by everyone. Only listed Supabase users can upload/delete.

begin;

create table if not exists public.gallery_upload_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.gallery_upload_admins enable row level security;
revoke all on table public.gallery_upload_admins from anon, authenticated;
grant select on table public.gallery_upload_admins to authenticated;

drop policy if exists aozora_gallery_admins_self_read on public.gallery_upload_admins;
create policy aozora_gallery_admins_self_read on public.gallery_upload_admins
  for select to authenticated using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aozora-gallery', 'aozora-gallery', true, 1048576, array['image/jpeg'])
on conflict (id) do update set
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = array['image/jpeg'];

-- Replace old public gallery write policies from the original schema.
alter table public.gallery enable row level security;
drop policy if exists g_read on public.gallery;
drop policy if exists g_insert on public.gallery;
drop policy if exists g_delete on public.gallery;
drop policy if exists aozora_gallery_public_read on public.gallery;
drop policy if exists aozora_gallery_admin_insert on public.gallery;
drop policy if exists aozora_gallery_admin_delete on public.gallery;
create policy aozora_gallery_public_read on public.gallery
  for select to anon, authenticated using (true);
create policy aozora_gallery_admin_insert on public.gallery
  for insert to authenticated with check (
    exists (select 1 from public.gallery_upload_admins where user_id = (select auth.uid()))
  );
create policy aozora_gallery_admin_delete on public.gallery
  for delete to authenticated using (
    exists (select 1 from public.gallery_upload_admins where user_id = (select auth.uid()))
  );

drop policy if exists aozora_gallery_public_upload on storage.objects;
drop policy if exists aozora_gallery_admin_upload on storage.objects;
drop policy if exists aozora_gallery_admin_delete on storage.objects;
drop policy if exists aozora_gallery_admin_read on storage.objects;
create policy aozora_gallery_admin_upload on storage.objects
  for insert to authenticated with check (
    bucket_id = 'aozora-gallery'
    and exists (select 1 from public.gallery_upload_admins where user_id = (select auth.uid()))
  );
create policy aozora_gallery_admin_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'aozora-gallery'
    and exists (select 1 from public.gallery_upload_admins where user_id = (select auth.uid()))
  );
create policy aozora_gallery_admin_read on storage.objects
  for select to authenticated using (
    bucket_id = 'aozora-gallery'
    and exists (select 1 from public.gallery_upload_admins where user_id = (select auth.uid()))
  );

commit;

-- After inviting the admin in Authentication > Users, add their UUID:
-- insert into public.gallery_upload_admins (user_id)
-- values ('PASTE_ADMIN_USER_UUID_HERE');
