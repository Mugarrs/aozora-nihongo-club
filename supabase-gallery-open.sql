-- AOZORA: public photo bucket + open upload guarded by a share code.
-- Run in Supabase SQL Editor (project aozora). Safe to run more than once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aozora-gallery', 'aozora-gallery', true, 1572864, array['image/jpeg'])
on conflict (id) do update set
  public = true,
  file_size_limit = 1572864,
  allowed_mime_types = array['image/jpeg'];

alter table public.gallery enable row level security;
drop policy if exists g_read on public.gallery;
drop policy if exists aozora_gallery_public_read on public.gallery;
drop policy if exists aozora_gallery_code_insert on public.gallery;
drop policy if exists aozora_gallery_admin_insert on public.gallery;
drop policy if exists g_insert on public.gallery;
drop policy if exists aozora_gallery_admin_delete on public.gallery;
drop policy if exists g_delete on public.gallery;

create policy aozora_gallery_public_read on public.gallery
  for select to anon, authenticated using (true);

-- Anyone holding the share code can add a gallery row.
create policy aozora_gallery_code_insert on public.gallery
  for insert to anon, authenticated
  with check (current_setting('request.headers', true)::json->>'x-aozora-code' = 'AOSORA-UP-2026');

drop policy if exists aozora_gallery_upload on storage.objects;
drop policy if exists aozora_gallery_public_upload on storage.objects;
drop policy if exists aozora_gallery_admin_upload on storage.objects;

create policy aozora_gallery_upload on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'aozora-gallery'
    and (request.headers->>'x-aozora-code') = 'AOSORA-UP-2026'
    and lower(storage.extension(name)) in ('jpg', 'jpeg')
  );

drop policy if exists aozora_gallery_public_delete on storage.objects;
drop policy if exists aozora_gallery_code_delete on storage.objects;
create policy aozora_gallery_code_delete on storage.objects
  for delete to anon, authenticated
  using (
    bucket_id = 'aozora-gallery'
    and (request.headers->>'x-aozora-code') = 'AOSORA-UP-2026'
  );
