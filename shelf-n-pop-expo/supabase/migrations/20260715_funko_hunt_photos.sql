insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hunt-photos',
  'hunt-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.funko_hunt_photos (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.funko_hunts(id) on delete cascade,
  stop_id uuid references public.funko_hunt_stops(id) on delete set null,
  find_id uuid references public.funko_hunt_finds(id) on delete set null,
  uploaded_by_user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  storage_bucket text not null default 'hunt-photos',
  storage_path text not null unique,
  caption text,
  photo_type text not null default 'memory' check (photo_type in ('memory', 'find', 'stop')),
  created_at timestamptz not null default now()
);

alter table public.funko_hunt_photos enable row level security;

grant select, insert, update, delete on public.funko_hunt_photos to authenticated;

create index if not exists funko_hunt_photos_hunt_created_idx
  on public.funko_hunt_photos (hunt_id, created_at desc);

drop policy if exists "Members can view hunt photos" on public.funko_hunt_photos;
create policy "Members can view hunt photos"
  on public.funko_hunt_photos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_photos.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Members can add hunt photos" on public.funko_hunt_photos;
create policy "Members can add hunt photos"
  on public.funko_hunt_photos
  for insert
  to authenticated
  with check (
    uploaded_by_user_id = (select auth.uid())
    and storage_bucket = 'hunt-photos'
    and exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_photos.hunt_id
        and (
          h.user_id = (select auth.uid())
          or (
            h.shared_shelf_id is not null
            and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Uploaders or owners can update hunt photos" on public.funko_hunt_photos;
create policy "Uploaders or owners can update hunt photos"
  on public.funko_hunt_photos
  for update
  to authenticated
  using (
    uploaded_by_user_id = (select auth.uid())
    or exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_photos.hunt_id
        and h.user_id = (select auth.uid())
    )
  )
  with check (
    uploaded_by_user_id = (select auth.uid())
    or exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_photos.hunt_id
        and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "Uploaders or owners can delete hunt photos" on public.funko_hunt_photos;
create policy "Uploaders or owners can delete hunt photos"
  on public.funko_hunt_photos
  for delete
  to authenticated
  using (
    uploaded_by_user_id = (select auth.uid())
    or exists (
      select 1
      from public.funko_hunts h
      where h.id = funko_hunt_photos.hunt_id
        and h.user_id = (select auth.uid())
    )
  );

drop policy if exists "Hunt photo uploaders can add files" on storage.objects;
create policy "Hunt photo uploaders can add files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'hunt-photos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "Members can view hunt photo files" on storage.objects;
create policy "Members can view hunt photo files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'hunt-photos'
    and (
      split_part(name, '/', 1) = (select auth.uid())::text
      or exists (
        select 1
        from public.funko_hunt_photos p
        join public.funko_hunts h on h.id = p.hunt_id
        where p.storage_path = storage.objects.name
          and (
            h.user_id = (select auth.uid())
            or (
              h.shared_shelf_id is not null
              and private.is_shared_shelf_member(h.shared_shelf_id, (select auth.uid()))
            )
          )
      )
    )
  );

drop policy if exists "Hunt photo uploaders can update files" on storage.objects;
create policy "Hunt photo uploaders can update files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'hunt-photos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'hunt-photos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "Hunt photo uploaders can delete files" on storage.objects;
create policy "Hunt photo uploaders can delete files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'hunt-photos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
