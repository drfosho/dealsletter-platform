-- Deal Scout configuration per user
create table if not exists scout_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  enabled boolean default true,
  strategy text default 'BRRRR',
  target_metros text[] default array[]::text[],
  max_purchase_price integer,
  min_deal_score numeric default 7.0,
  min_cap_rate numeric,
  min_coc numeric,
  max_rehab_budget integer,
  min_arv_margin numeric,
  property_types text[] default array['SFR'],
  max_days_on_market integer default 30,
  min_beds integer,
  min_baths numeric,
  zip_codes text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deal Scout results/alerts
create table if not exists scout_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  address text not null,
  city text,
  state text,
  metro text,
  strategy text,
  deal_score numeric,
  cap_rate numeric,
  coc numeric,
  purchase_price integer,
  arv integer,
  rehab_estimate integer,
  monthly_cash_flow integer,
  days_on_market integer,
  property_type text,
  beds integer,
  baths numeric,
  sqft integer,
  signal text,
  ai_summary text,
  listing_url text,
  is_read boolean default false,
  is_saved boolean default false,
  run_date timestamptz default now(),
  analysis_id uuid references analyzed_properties(id),
  created_at timestamptz default now()
);

-- Index for fast unread count
create index if not exists scout_results_user_unread
  on scout_results(user_id, is_read) where is_read = false;
