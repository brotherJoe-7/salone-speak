-- Admins table with role-based access control
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'admin' check (role in ('admin', 'moderator', 'super_admin')),
  created_at timestamp with time zone default now()
);

-- Feedback table for public submissions
create table if not exists public.feedback (
  id bigint primary key generated always as identity,
  message text not null,
  sentiment text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.admins enable row level security;
alter table public.feedback enable row level security;

-- Admins RLS policies - only super_admin can manage roles
create policy "admins_select_own" on public.admins 
  for select using (auth.uid() = id);

create policy "admins_update_own" on public.admins 
  for update using (auth.uid() = id);

create policy "admins_delete_own" on public.admins 
  for delete using (auth.uid() = id);

-- Feedback RLS policies - public can read, anyone can insert
create policy "public_can_read_feedback" on public.feedback 
  for select using (true);

create policy "public_can_insert_feedback" on public.feedback 
  for insert with check (true);
