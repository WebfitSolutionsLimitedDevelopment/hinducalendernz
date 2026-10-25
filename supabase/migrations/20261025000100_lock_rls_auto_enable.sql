
-- Supabase-created helper should not be callable from the public API.
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
