-- V1 security hardening recommendation.
-- RLS currently protects rows, but anon should not have broad table privileges.
-- Apply after confirming no public unauthenticated screens need direct Data API reads.

revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;

-- Keep authenticated access governed by table RLS policies and security-invoker views.
grant usage on schema public to authenticated;
