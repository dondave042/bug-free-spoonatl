-- Run this migration in Supabase for an existing installation where booking
-- creation reports that the bookings.address column is missing.
alter table public.bookings
  add column if not exists address text;

notify pgrst, 'reload schema';