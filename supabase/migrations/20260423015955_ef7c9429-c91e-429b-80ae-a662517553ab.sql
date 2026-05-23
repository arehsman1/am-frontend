-- 1) Rename intent enum values (preserves existing rows)
ALTER TYPE public.request_intent RENAME VALUE 'casual' TO 'situationship';
ALTER TYPE public.request_intent RENAME VALUE 'networking' TO 'ovn_st';

-- 2) Add conditional profile fields (all nullable; app enforces requirement for serious/marriage)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS genotype text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS number_of_kids integer,
  ADD COLUMN IF NOT EXISTS marital_status text;

-- 3) Shorten default request expiry to 12 hours
ALTER TABLE public.requests
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '12 hours');

-- 4) send_request RPC with 12h cooldown / dedupe
CREATE OR REPLACE FUNCTION public.send_request(p_receiver uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF uid = p_receiver THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_request_self');
  END IF;

  -- Block resend while a non-expired request to the same recipient exists
  IF EXISTS (
    SELECT 1 FROM public.requests
    WHERE sender_id = uid
      AND recipient_id = p_receiver
      AND status = 'new'
      AND expires_at > now()
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_pending');
  END IF;

  INSERT INTO public.requests (sender_id, recipient_id, kind, intent, expires_at)
  VALUES (uid, p_receiver, 'user', 'serious', now() + interval '12 hours')
  RETURNING id INTO new_id;

  RETURN jsonb_build_object('ok', true, 'request_id', new_id);
END;
$$;

-- 5) Female-only guard on activate_boost
CREATE OR REPLACE FUNCTION public.activate_boost(_package boost_package)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  cost integer;
  duration interval;
  bal integer;
  new_id uuid;
  exp timestamptz;
  g public.user_gender;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT gender INTO g FROM public.profiles WHERE user_id = uid;
  IF g IS DISTINCT FROM 'female' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_allowed');
  END IF;

  CASE _package
    WHEN 'starter' THEN cost := 1000; duration := interval '24 hours';
    WHEN 'pro'     THEN cost := 2500; duration := interval '3 days';
    WHEN 'elite'   THEN cost := 6000; duration := interval '7 days';
  END CASE;

  SELECT balance INTO bal FROM public.wallets WHERE user_id = uid FOR UPDATE;
  IF bal IS NULL THEN
    INSERT INTO public.wallets(user_id, balance) VALUES (uid, 0);
    bal := 0;
  END IF;
  IF bal < cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance', 'balance', bal);
  END IF;

  exp := now() + duration;
  UPDATE public.wallets SET balance = balance - cost WHERE user_id = uid;
  INSERT INTO public.boosts (user_id, package, amount, expires_at)
  VALUES (uid, _package, cost, exp) RETURNING id INTO new_id;
  INSERT INTO public.wallet_transactions (user_id, kind, amount, balance_after, reference, note)
  VALUES (uid, 'boost', -cost, bal - cost, new_id::text, 'Boost: ' || _package);

  RETURN jsonb_build_object('ok', true, 'balance', bal - cost, 'boost_id', new_id, 'expires_at', exp);
END;
$$;