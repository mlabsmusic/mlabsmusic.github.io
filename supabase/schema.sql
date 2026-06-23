-- MLABS Recordpool community schema for Supabase.
-- This models:
-- 1) one official "0_MASTER LIBRARY"
-- 2) one personal library per DJ profile
-- 3) submission / review / merge flow into master

create extension if not exists "pgcrypto";

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text not null default 'New DJ',
  slug text not null unique,
  avatar_url text,
  bio text,
  city text,
  instagram_url text,
  soundcloud_url text,
  website_url text,
  is_owner boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.libraries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  kind text not null check (kind in ('master', 'personal')),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  slug text not null,
  drive_folder_id text,
  source_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  artist text,
  version text,
  genre text,
  bpm integer,
  musical_key text,
  duration_seconds integer,
  cover_url text,
  drive_file_id text not null,
  drive_view_url text,
  drive_preview_url text,
  drive_download_url text,
  file_ext text,
  file_size_bytes bigint,
  source_path text,
  visibility text not null default 'private' check (visibility in ('private', 'community', 'master')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.master_requests (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'changes_requested')),
  message text,
  review_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.master_library_tracks (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  approved_from_request_id uuid references public.master_requests(id) on delete set null,
  approved_by uuid not null references public.profiles(id) on delete restrict,
  folder_id uuid references public.folders(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (library_id, track_id)
);

create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.master_requests(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.library_snapshots (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  label text,
  source_kind text not null default 'local_agent' check (source_kind in ('local_agent', 'browser_demo', 'drive_import')),
  root_path text,
  file_count integer not null default 0,
  total_bytes bigint not null default 0,
  based_on_snapshot_id uuid references public.library_snapshots(id) on delete set null,
  snapshot_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.library_change_sets (
  id uuid primary key default gen_random_uuid(),
  library_id uuid not null references public.libraries(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  reviewed_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  review_notes text,
  target_kind text not null default 'library' check (target_kind in ('library', 'master')),
  status text not null default 'draft' check (status in ('draft', 'open', 'merged', 'rejected')),
  from_snapshot_id uuid references public.library_snapshots(id) on delete set null,
  to_snapshot_id uuid references public.library_snapshots(id) on delete set null,
  merged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.library_changes (
  id uuid primary key default gen_random_uuid(),
  change_set_id uuid not null references public.library_change_sets(id) on delete cascade,
  entity_type text not null check (entity_type in ('track', 'folder', 'library')),
  change_type text not null check (change_type in ('added', 'removed', 'updated', 'moved', 'renamed')),
  entity_key text not null,
  before_json jsonb,
  after_json jsonb,
  selected_for_master boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists libraries_one_master_idx
on public.libraries (kind)
where kind = 'master';

create unique index if not exists libraries_one_personal_per_profile_idx
on public.libraries (profile_id)
where kind = 'personal';

create unique index if not exists folders_unique_name_per_parent_idx
on public.folders (
  library_id,
  coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid),
  slug
);

create unique index if not exists master_requests_one_pending_per_track_idx
on public.master_requests (track_id)
where status = 'pending';

create index if not exists folders_library_idx on public.folders (library_id);
create index if not exists folders_parent_idx on public.folders (parent_id);
create index if not exists tracks_library_idx on public.tracks (library_id);
create index if not exists tracks_folder_idx on public.tracks (folder_id);
create index if not exists tracks_owner_profile_idx on public.tracks (owner_profile_id);
create index if not exists tracks_drive_file_idx on public.tracks (drive_file_id);
create index if not exists master_requests_submitted_by_idx on public.master_requests (submitted_by);
create index if not exists master_requests_status_idx on public.master_requests (status);
create index if not exists request_comments_request_idx on public.request_comments (request_id);
create index if not exists library_snapshots_library_idx on public.library_snapshots (library_id, created_at desc);
create index if not exists library_change_sets_library_idx on public.library_change_sets (library_id, created_at desc);
create index if not exists library_change_sets_status_idx on public.library_change_sets (status);
create index if not exists library_changes_change_set_idx on public.library_changes (change_set_id);

alter table public.libraries
  add column if not exists current_working_snapshot_id uuid references public.library_snapshots(id) on delete set null;

alter table public.libraries
  add column if not exists current_published_snapshot_id uuid references public.library_snapshots(id) on delete set null;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and is_owner = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_owner();
$$;

create or replace function public.ensure_master_library()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.libraries (name, slug, kind, is_public)
  values ('0_MASTER LIBRARY', '0-master-library', 'master', true)
  on conflict do nothing;
end;
$$;

create or replace function public.create_personal_library_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.libraries (profile_id, name, slug, kind, is_public)
  values (
    new.id,
    coalesce(nullif(new.display_name, ''), 'DJ') || ' Library',
    public.slugify(coalesce(nullif(new.slug, ''), 'dj-' || left(new.id::text, 8))) || '-library',
    'personal',
    false
  )
  on conflict do nothing;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_name text;
  derived_slug text;
begin
  derived_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'DJ'
  );

  derived_slug := public.slugify(derived_name) || '-' || left(new.id::text, 8);

  insert into public.profiles (
    id,
    email,
    display_name,
    slug,
    role,
    is_owner
  )
  values (
    new.id,
    new.email,
    derived_name,
    derived_slug,
    case when lower(coalesce(new.email, '')) = 'marquesedition@gmail.com' then 'admin' else 'user' end,
    lower(coalesce(new.email, '')) = 'marquesedition@gmail.com'
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (
  id,
  email,
  display_name,
  slug,
  role,
  is_owner,
  created_at,
  updated_at
)
select
  users.id,
  users.email,
  coalesce(
    nullif(trim(users.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(users.raw_user_meta_data->>'full_name'), ''),
    split_part(coalesce(users.email, ''), '@', 1),
    'DJ'
  ),
  public.slugify(
    coalesce(
      nullif(trim(users.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(users.raw_user_meta_data->>'full_name'), ''),
      split_part(coalesce(users.email, ''), '@', 1),
      'DJ'
    )
  ) || '-' || left(users.id::text, 8),
  case when lower(coalesce(users.email, '')) = 'marquesedition@gmail.com' then 'admin' else 'user' end,
  lower(coalesce(users.email, '')) = 'marquesedition@gmail.com',
  users.created_at,
  now()
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

select public.ensure_master_library();

insert into public.libraries (profile_id, name, slug, kind, is_public)
select
  profiles.id,
  coalesce(nullif(profiles.display_name, ''), 'DJ') || ' Library',
  public.slugify(coalesce(nullif(profiles.slug, ''), 'dj-' || left(profiles.id::text, 8))) || '-library',
  'personal',
  false
from public.profiles
where not exists (
  select 1
  from public.libraries
  where libraries.profile_id = profiles.id
    and libraries.kind = 'personal'
);

drop trigger if exists create_personal_library_on_profile on public.profiles;
create trigger create_personal_library_on_profile
  after insert on public.profiles
  for each row execute procedure public.create_personal_library_for_profile();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

drop trigger if exists libraries_touch_updated_at on public.libraries;
create trigger libraries_touch_updated_at
  before update on public.libraries
  for each row execute procedure public.touch_updated_at();

drop trigger if exists folders_touch_updated_at on public.folders;
create trigger folders_touch_updated_at
  before update on public.folders
  for each row execute procedure public.touch_updated_at();

drop trigger if exists tracks_touch_updated_at on public.tracks;
create trigger tracks_touch_updated_at
  before update on public.tracks
  for each row execute procedure public.touch_updated_at();

drop trigger if exists master_requests_touch_updated_at on public.master_requests;
create trigger master_requests_touch_updated_at
  before update on public.master_requests
  for each row execute procedure public.touch_updated_at();

drop trigger if exists library_change_sets_touch_updated_at on public.library_change_sets;
create trigger library_change_sets_touch_updated_at
  before update on public.library_change_sets
  for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.libraries enable row level security;
alter table public.folders enable row level security;
alter table public.tracks enable row level security;
alter table public.master_requests enable row level security;
alter table public.master_library_tracks enable row level security;
alter table public.request_comments enable row level security;
alter table public.library_snapshots enable row level security;
alter table public.library_change_sets enable row level security;
alter table public.library_changes enable row level security;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update own profile or owner can update all" on public.profiles;
create policy "Users can update own profile or owner can update all"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id or public.is_owner())
with check ((select auth.uid()) = id or public.is_owner());

drop policy if exists "Users can view own and master libraries or owner can view all" on public.libraries;
create policy "Users can view own and master libraries or owner can view all"
on public.libraries for select
to authenticated
using (
  kind = 'master'
  or profile_id = (select auth.uid())
  or public.is_owner()
);

drop policy if exists "Users can create own personal library or owner can create any" on public.libraries;
create policy "Users can create own personal library or owner can create any"
on public.libraries for insert
to authenticated
with check (
  (kind = 'personal' and profile_id = (select auth.uid()))
  or public.is_owner()
);

drop policy if exists "Users can update own personal library or owner can manage all libraries" on public.libraries;
create policy "Users can update own personal library or owner can manage all libraries"
on public.libraries for update
to authenticated
using (
  (kind = 'personal' and profile_id = (select auth.uid()))
  or public.is_owner()
)
with check (
  (kind = 'personal' and profile_id = (select auth.uid()))
  or public.is_owner()
);

drop policy if exists "Owner can delete libraries" on public.libraries;
create policy "Owner can delete libraries"
on public.libraries for delete
to authenticated
using (public.is_owner());

drop policy if exists "Users can view folders in accessible libraries" on public.folders;
create policy "Users can view folders in accessible libraries"
on public.folders for select
to authenticated
using (
  exists (
    select 1
    from public.libraries
    where libraries.id = folders.library_id
      and (
        libraries.kind = 'master'
        or libraries.profile_id = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can manage folders in own library or owner can manage all" on public.folders;
create policy "Users can manage folders in own library or owner can manage all"
on public.folders for all
to authenticated
using (
  exists (
    select 1
    from public.libraries
    where libraries.id = folders.library_id
      and (
        (libraries.kind = 'personal' and libraries.profile_id = (select auth.uid()))
        or public.is_owner()
      )
  )
)
with check (
  exists (
    select 1
    from public.libraries
    where libraries.id = folders.library_id
      and (
        (libraries.kind = 'personal' and libraries.profile_id = (select auth.uid()))
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can view tracks in accessible libraries" on public.tracks;
create policy "Users can view tracks in accessible libraries"
on public.tracks for select
to authenticated
using (
  exists (
    select 1
    from public.libraries
    where libraries.id = tracks.library_id
      and (
        libraries.kind = 'master'
        or libraries.profile_id = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can insert tracks into own library or owner can insert anywhere" on public.tracks;
create policy "Users can insert tracks into own library or owner can insert anywhere"
on public.tracks for insert
to authenticated
with check (
  (
    owner_profile_id = (select auth.uid())
    and exists (
      select 1
      from public.libraries
      where libraries.id = tracks.library_id
        and libraries.kind = 'personal'
        and libraries.profile_id = (select auth.uid())
    )
  )
  or public.is_owner()
);

drop policy if exists "Users can update own tracks or owner can update all" on public.tracks;
create policy "Users can update own tracks or owner can update all"
on public.tracks for update
to authenticated
using (owner_profile_id = (select auth.uid()) or public.is_owner())
with check (owner_profile_id = (select auth.uid()) or public.is_owner());

drop policy if exists "Users can delete own tracks or owner can delete all" on public.tracks;
create policy "Users can delete own tracks or owner can delete all"
on public.tracks for delete
to authenticated
using (owner_profile_id = (select auth.uid()) or public.is_owner());

drop policy if exists "Users can view own requests or owner can view all" on public.master_requests;
create policy "Users can view own requests or owner can view all"
on public.master_requests for select
to authenticated
using (submitted_by = (select auth.uid()) or public.is_owner());

drop policy if exists "Users can create requests for own tracks or owner can create any" on public.master_requests;
create policy "Users can create requests for own tracks or owner can create any"
on public.master_requests for insert
to authenticated
with check (
  (
    submitted_by = (select auth.uid())
    and exists (
      select 1
      from public.tracks
      where tracks.id = master_requests.track_id
        and tracks.owner_profile_id = (select auth.uid())
    )
  )
  or public.is_owner()
);

drop policy if exists "Owner can review requests" on public.master_requests;
create policy "Owner can review requests"
on public.master_requests for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Users can view visible master entries or owner can view all" on public.master_library_tracks;
create policy "Users can view visible master entries or owner can view all"
on public.master_library_tracks for select
to authenticated
using (
  exists (
    select 1
    from public.libraries
    where libraries.id = master_library_tracks.library_id
      and libraries.kind = 'master'
  )
  or public.is_owner()
);

drop policy if exists "Owner can manage master entries" on public.master_library_tracks;
create policy "Owner can manage master entries"
on public.master_library_tracks for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Users can view comments on own requests or owner can view all" on public.request_comments;
create policy "Users can view comments on own requests or owner can view all"
on public.request_comments for select
to authenticated
using (
  exists (
    select 1
    from public.master_requests
    where master_requests.id = request_comments.request_id
      and (
        master_requests.submitted_by = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can comment on own requests and owner can comment on all" on public.request_comments;
create policy "Users can comment on own requests and owner can comment on all"
on public.request_comments for insert
to authenticated
with check (
  author_profile_id = (select auth.uid())
  and exists (
    select 1
    from public.master_requests
    where master_requests.id = request_comments.request_id
      and (
        master_requests.submitted_by = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can view snapshots in accessible libraries" on public.library_snapshots;
create policy "Users can view snapshots in accessible libraries"
on public.library_snapshots for select
to authenticated
using (
  exists (
    select 1
    from public.libraries
    where libraries.id = library_snapshots.library_id
      and (
        libraries.kind = 'master'
        or libraries.profile_id = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can create snapshots in own library or owner can create any" on public.library_snapshots;
create policy "Users can create snapshots in own library or owner can create any"
on public.library_snapshots for insert
to authenticated
with check (
  (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.libraries
      where libraries.id = library_snapshots.library_id
        and libraries.kind = 'personal'
        and libraries.profile_id = (select auth.uid())
    )
  )
  or public.is_owner()
);

drop policy if exists "Users can view change sets in accessible libraries" on public.library_change_sets;
create policy "Users can view change sets in accessible libraries"
on public.library_change_sets for select
to authenticated
using (
  exists (
    select 1
    from public.libraries
    where libraries.id = library_change_sets.library_id
      and (
        libraries.kind = 'master'
        or libraries.profile_id = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can create change sets in own library or owner can create any" on public.library_change_sets;
create policy "Users can create change sets in own library or owner can create any"
on public.library_change_sets for insert
to authenticated
with check (
  (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.libraries
      where libraries.id = library_change_sets.library_id
        and libraries.kind = 'personal'
        and libraries.profile_id = (select auth.uid())
    )
  )
  or public.is_owner()
);

drop policy if exists "Users can update own change sets or owner can review all" on public.library_change_sets;
create policy "Users can update own change sets or owner can review all"
on public.library_change_sets for update
to authenticated
using (created_by = (select auth.uid()) or public.is_owner())
with check (created_by = (select auth.uid()) or public.is_owner());

drop policy if exists "Users can view changes in accessible change sets" on public.library_changes;
create policy "Users can view changes in accessible change sets"
on public.library_changes for select
to authenticated
using (
  exists (
    select 1
    from public.library_change_sets
    join public.libraries on libraries.id = library_change_sets.library_id
    where library_change_sets.id = library_changes.change_set_id
      and (
        libraries.kind = 'master'
        or libraries.profile_id = (select auth.uid())
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can create changes in own change sets or owner can create any" on public.library_changes;
create policy "Users can create changes in own change sets or owner can create any"
on public.library_changes for insert
to authenticated
with check (
  exists (
    select 1
    from public.library_change_sets
    join public.libraries on libraries.id = library_change_sets.library_id
    where library_change_sets.id = library_changes.change_set_id
      and (
        (library_change_sets.created_by = (select auth.uid()) and libraries.profile_id = (select auth.uid()))
        or public.is_owner()
      )
  )
);

drop policy if exists "Users can update changes in own change sets or owner can update any" on public.library_changes;
create policy "Users can update changes in own change sets or owner can update any"
on public.library_changes for update
to authenticated
using (
  exists (
    select 1
    from public.library_change_sets
    where library_change_sets.id = library_changes.change_set_id
      and (
        library_change_sets.created_by = (select auth.uid())
        or public.is_owner()
      )
  )
)
with check (
  exists (
    select 1
    from public.library_change_sets
    where library_change_sets.id = library_changes.change_set_id
      and (
        library_change_sets.created_by = (select auth.uid())
        or public.is_owner()
      )
  )
);
