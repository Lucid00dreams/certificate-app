-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  unique_id text not null unique,
  file_path text,          -- path inside the storage bucket, e.g. "2026/abc123.pdf"
  status text not null default 'pending' check (status in ('pending', 'downloaded')),
  upload_date timestamptz not null default now(),
  downloaded_at timestamptz
);

create index if not exists participants_unique_id_idx on public.participants (unique_id);
create index if not exists participants_email_idx on public.participants (lower(email));

alter table public.participants enable row level security;

-- No public policies are defined on purpose: the anon key has zero
-- direct access to this table. All reads/writes happen through the
-- server route handlers using the service-role key, which bypasses
-- RLS. This keeps participant lookup logic (matching BOTH unique_id
-- AND email) enforced in application code rather than relying on a
-- policy that would otherwise need to accept arbitrary client input.

-- Storage bucket for certificate PDFs. Create this once, either here
-- or via Dashboard > Storage > New bucket ("certificates", private).
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

-- Storage RLS: no public policies either — signed URLs (issued by the
-- server with the service-role key) are the only way in or out.
