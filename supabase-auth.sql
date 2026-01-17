-- Supabase Auth integration helpers

-- Create users row automatically on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, phone_number, full_name, preferred_language)
  values (new.id, coalesce(new.phone, ''), coalesce(new.raw_user_meta_data->>'full_name','User'), 'hi')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Ensure RLS policies are appropriate
alter table public.users enable row level security;
-- Policies already defined in supabase-schema.sql assume auth.uid() = users.id
