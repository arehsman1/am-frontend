
-- 1) Remove broad boost visibility; owners still see their own via existing policy
DROP POLICY IF EXISTS "Authenticated view active boosts" ON public.boosts;

-- 2) Add a non-sensitive boolean so the UI can know whether a photo exists
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_profile_image boolean
  GENERATED ALWAYS AS (profile_image_url IS NOT NULL) STORED;

-- 3) Hide sensitive columns from direct table reads.
-- whatsapp must only be accessible via get_whatsapp() RPC (match-gated).
-- profile_image_url is a storage path that must only be reachable via
-- the get-profile-image edge function (which enforces unlock/match).
REVOKE SELECT (whatsapp, profile_image_url) ON public.profiles FROM anon, authenticated;
