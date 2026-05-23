
-- 1. Profiles: tighten SELECT + hide WhatsApp column from direct reads
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, user_id, display_name, gender, age, location, interests, bio,
  profile_image_url, onboarded, is_verified, occupation, religion,
  genotype, blood_group, number_of_kids, marital_status, created_at, updated_at
) ON public.profiles TO authenticated;

-- Secure RPC: WhatsApp only visible to owner or matched user
CREATE OR REPLACE FUNCTION public.get_whatsapp(_target uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  wa  text;
BEGIN
  IF uid IS NULL THEN RETURN NULL; END IF;
  IF uid = _target OR EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user_a = uid AND user_b = _target)
       OR (user_b = uid AND user_a = _target)
  ) THEN
    SELECT whatsapp INTO wa FROM public.profiles WHERE user_id = _target;
    RETURN wa;
  END IF;
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_whatsapp(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_whatsapp(uuid) TO authenticated;

-- 2. Remove dev wallet top-up function (payment bypass)
DROP FUNCTION IF EXISTS public.dev_topup(integer);

-- 3. Boosts: no longer world-readable
DROP POLICY IF EXISTS "Active boosts are public" ON public.boosts;
CREATE POLICY "Authenticated view active boosts"
  ON public.boosts FOR SELECT TO authenticated
  USING (expires_at > now());

-- 4. Requests: drop oversharing location-based SELECT branch
DROP POLICY IF EXISTS "Sender or recipient can view requests" ON public.requests;
CREATE POLICY "Sender or recipient view requests"
  ON public.requests FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 5. Revoke anonymous EXECUTE on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.unlock_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlock_profile(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.activate_boost(boost_package) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_boost(boost_package) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.send_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_request(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
