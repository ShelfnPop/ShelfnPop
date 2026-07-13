alter table public.profiles
  add column if not exists collector_mode text not null default 'casual';

alter table public.profiles
  drop constraint if exists profiles_collector_mode_check;

alter table public.profiles
  add constraint profiles_collector_mode_check
  check (collector_mode in ('casual', 'avid', 'reseller'));
