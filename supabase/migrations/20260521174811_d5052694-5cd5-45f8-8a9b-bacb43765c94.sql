
-- 1. Make bucket private
update storage.buckets set public = false where id = 'profile-images';

-- 2. Replace broad SELECT policy with owner-only
drop policy if exists "Profile images listing for authenticated users" on storage.objects;

create policy "Owner reads own profile image"
on storage.objects for select
to authenticated
using (
  bucket_id = 'profile-images'
  and (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Backfill profile_image_url: strip everything up to and including '/profile-images/'
update public.profiles
set profile_image_url = regexp_replace(profile_image_url, '^.*/profile-images/', '')
where profile_image_url is not null
  and profile_image_url like '%/profile-images/%';

-- 4. Helper RPC: returns the storage path only when caller is allowed
create or replace function public.get_profile_image_path(_target uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  path text;
begin
  if uid is null then return null; end if;

  select profile_image_url into path from public.profiles where user_id = _target;
  if path is null then return null; end if;

  if uid = _target
     or exists (select 1 from public.profile_unlocks where viewer_id = uid and target_id = _target)
     or exists (
       select 1 from public.matches
       where (user_a = uid and user_b = _target) or (user_b = uid and user_a = _target)
     )
  then
    return path;
  end if;

  return null;
end;
$$;

revoke execute on function public.get_profile_image_path(uuid) from public, anon;
grant execute on function public.get_profile_image_path(uuid) to authenticated;
