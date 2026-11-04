-- W1 SALES — RUN ONLY ON A SEPARATE COMMERCIAL SUPABASE PROJECT.
-- Never run against LexisPredict's production database.
-- Frontend uses the public anon/publishable key; no client can read leads.
begin;
create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (
    char_length(email) between 5 and 240
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  message text not null default '' check (char_length(message) <= 700),
  need text not null check (need in ('juridico','crm','automacao','dados')),
  company_size text not null check (company_size in ('individual','pequena','media','grande')),
  product_id text not null check (product_id in ('lexis','crm','automation','analytics')),
  consent boolean not null check (consent = true),
  source text not null default 'w1_sales_portal' check (source = 'w1_sales_portal'),
  status text not null default 'novo' check (status in ('novo','em_contato','qualificado','proposta','ganho','perdido')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  internal_notes text not null default ''
);
create index if not exists sales_leads_created_at_idx on public.sales_leads(created_at desc);
create index if not exists sales_leads_status_idx on public.sales_leads(status,created_at desc);
alter table public.sales_leads enable row level security;
revoke all on table public.sales_leads from anon, authenticated;
-- Never permit SELECT, UPDATE or DELETE from the browser.
grant usage on schema public to anon;
grant insert (name,email,message,need,company_size,product_id,consent,source)
  on table public.sales_leads to anon;
drop policy if exists "w1_sales_public_opt_in" on public.sales_leads;
create policy "w1_sales_public_opt_in" on public.sales_leads
  for insert to anon with check (
    consent is true and source='w1_sales_portal' and status='novo'
    and internal_notes=''
    and (need,product_id) in (
      ('juridico','lexis'),('crm','crm'),
      ('automacao','automation'),('dados','analytics')
    )
  );
comment on table public.sales_leads is
  'Independent W1 Capital commercial opt-in leads. Do not merge with LexisPredict legal case data. Public browser has INSERT only.';
commit;
