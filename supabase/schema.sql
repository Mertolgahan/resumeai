-- ResumeAI Database Schema
-- Run this in the Supabase SQL Editor to set up tables and Row Level Security

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  email text not null,
  full_name text,
  plan text default 'free' check (plan in ('free', 'pro', 'lifetime')),
  resumes_generated integer default 0,
  stripe_customer_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Resumes table
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  input_data jsonb not null,
  generated_content jsonb not null,
  cover_letter text,
  template text default 'modern',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Subscriptions table (Stripe integration)
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_price_id text not null,
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create indexes
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_stripe_customer_id on public.profiles(stripe_customer_id);
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_resumes_created_at on public.resumes(created_at desc);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Resumes policies
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_resumes_updated_at
  before update on public.resumes
  for each row execute procedure public.update_updated_at();

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();