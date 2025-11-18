create table if not exists public.user_form_defaults (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);

alter table public.user_form_defaults enable row level security;

do $$ begin
  create policy user_defaults_select on public.user_form_defaults for select using (auth.uid() = user_id);
exception when others then null; end $$;
do $$ begin
  create policy user_defaults_upsert on public.user_form_defaults for insert with check (auth.uid() = user_id);
exception when others then null; end $$;
do $$ begin
  create policy user_defaults_update on public.user_form_defaults for update using (auth.uid() = user_id);
exception when others then null; end $$;



