-- Profiles
create table if not exists public.profiles (
  id uuid primary key default auth.uid(),
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default now(),
  subscription_status text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  free_pack_used boolean default false
);

-- Generations
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  target_job_title text,
  company_name text,
  plan text,
  cv_content text,
  cover_letter_content text,
  message_content text,
  created_at timestamp with time zone default now()
);

-- RLS (simple defaults)
alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
create policy "generations_select_own" on public.generations for select using (auth.uid() = user_id);
create policy "generations_insert_own" on public.generations for insert with check (auth.uid() = user_id);



