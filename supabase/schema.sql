-- MLabs Music apps/auth schema for Supabase.
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  category text,
  launch_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_apps (
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, app_id)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
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

insert into public.profiles (id, email, full_name, created_at, updated_at)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'full_name', ''),
  users.created_at,
  now()
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

alter table public.profiles enable row level security;
alter table public.apps enable row level security;
alter table public.user_apps enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read active apps" on public.apps;
create policy "Authenticated users can read active apps"
on public.apps for select
to authenticated
using (active = true or public.is_admin());

drop policy if exists "Admins can manage apps" on public.apps;
create policy "Admins can manage apps"
on public.apps for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read their enabled apps" on public.user_apps;
create policy "Users can read their enabled apps"
on public.user_apps for select
to authenticated
using ((user_id = auth.uid() and enabled = true) or public.is_admin());

drop policy if exists "Admins can manage user apps" on public.user_apps;
create policy "Admins can manage user apps"
on public.user_apps for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.apps (name, slug, description, icon, category, launch_url)
values
  ('Folder to iTunes', 'folder-to-itunes', 'Crea playlists de Apple Music desde carpetas locales y automatiza bibliotecas de trabajo.', 'FT', 'Biblioteca', '/app/'),
  ('AI Session Generator', 'ai-session-generator', 'Genera ideas de sesiones, estructuras y propuestas musicales asistidas por IA.', 'AI', 'Creatividad', '#'),
  ('Test Runner', 'test-runner', 'Verifica flujos, diagnosticos y pruebas de herramientas internas.', 'TR', 'QA', '#'),
  ('Diagnostics', 'diagnostics', 'Revisa estado tecnico, permisos y senales de configuracion de MTools.', 'DX', 'Sistema', '#')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    icon = excluded.icon,
    category = excluded.category,
    launch_url = excluded.launch_url,
    updated_at = now();

-- After your first admin account exists, promote it manually:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
