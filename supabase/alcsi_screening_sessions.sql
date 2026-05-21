create extension if not exists pgcrypto;

create table if not exists public.alcsi_screening_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references auth.users (id) on delete cascade,
  patient_name text not null,
  patient_phone text,
  patient_age integer not null,
  patient_sex text not null,
  smoking_history text not null,
  cigarettes_per_day numeric not null default 0,
  years_smoked numeric not null default 0,
  quit_years numeric not null default 0,
  pack_years numeric not null default 0,
  notes text,
  referral_plan jsonb not null default '[]'::jsonb,
  draft_message text,
  outreach_verified boolean not null default false,
  outreach_verified_at timestamptz,
  authorization_signed boolean not null default false,
  authorization_signer_name text,
  authorization_relationship text,
  authorization_signed_at timestamptz,
  authorization_phi_description text,
  authorization_discloser text,
  authorization_recipient text,
  authorization_expires_at timestamptz,
  authorization_revocation_instructions text,
  authorization_signature_data_url text,
  follow_up_due_at timestamptz,
  follow_up_last_drafted_at timestamptz,
  completion_status text not null default 'draft',
  completed_screenings_count integer not null default 0,
  total_selected_screenings integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.alcsi_screening_sessions
  add column if not exists authorization_phi_description text,
  add column if not exists authorization_discloser text,
  add column if not exists authorization_recipient text,
  add column if not exists authorization_expires_at timestamptz,
  add column if not exists authorization_revocation_instructions text,
  add column if not exists authorization_signature_data_url text;

alter table public.alcsi_screening_sessions enable row level security;

drop policy if exists "alcsi staff read own sessions" on public.alcsi_screening_sessions;
create policy "alcsi staff read own sessions"
on public.alcsi_screening_sessions
for select
using (auth.uid() = staff_user_id);

drop policy if exists "alcsi staff insert own sessions" on public.alcsi_screening_sessions;
create policy "alcsi staff insert own sessions"
on public.alcsi_screening_sessions
for insert
with check (auth.uid() = staff_user_id);

drop policy if exists "alcsi staff update own sessions" on public.alcsi_screening_sessions;
create policy "alcsi staff update own sessions"
on public.alcsi_screening_sessions
for update
using (auth.uid() = staff_user_id)
with check (auth.uid() = staff_user_id);
