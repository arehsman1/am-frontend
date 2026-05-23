-- =========================================================
-- WALLETS
-- =========================================================
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- WALLET TRANSACTIONS
-- =========================================================
CREATE TYPE public.txn_kind AS ENUM ('topup','unlock','boost','refund','bonus');

CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind public.txn_kind NOT NULL,
  amount integer NOT NULL,           -- positive = credit, negative = debit
  balance_after integer NOT NULL,
  reference text,                    -- e.g. profile_id, boost_id, paystack ref
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_wallet_txn_user ON public.wallet_transactions(user_id, created_at DESC);

-- =========================================================
-- PROFILE UNLOCKS  (₦400 to view a member's photo)
-- =========================================================
CREATE TABLE public.profile_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL,
  target_id uuid NOT NULL,
  amount integer NOT NULL DEFAULT 400,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viewer_id, target_id)
);

ALTER TABLE public.profile_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewers see their unlocks"
  ON public.profile_unlocks FOR SELECT
  USING (auth.uid() = viewer_id);

CREATE INDEX idx_unlocks_viewer ON public.profile_unlocks(viewer_id);

-- =========================================================
-- BOOSTS
-- =========================================================
CREATE TYPE public.boost_package AS ENUM ('starter','pro','elite');

CREATE TABLE public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package public.boost_package NOT NULL,
  amount integer NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

-- Owner can read their own; everyone can read currently-active boosts (for ranking).
CREATE POLICY "Owner views own boosts"
  ON public.boosts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Active boosts are public"
  ON public.boosts FOR SELECT
  USING (expires_at > now());

CREATE INDEX idx_boosts_active ON public.boosts(user_id, expires_at);

-- =========================================================
-- AUTO-PROVISION WALLET ON SIGNUP
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Backfill wallets for existing users
INSERT INTO public.wallets (user_id, balance)
SELECT user_id, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- =========================================================
-- SECURE FUNCTION: unlock_profile (₦400)
-- =========================================================
CREATE OR REPLACE FUNCTION public.unlock_profile(_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cost integer := 400;
  bal integer;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF uid = _target THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_unlock_self');
  END IF;

  -- already unlocked?
  IF EXISTS (SELECT 1 FROM public.profile_unlocks WHERE viewer_id = uid AND target_id = _target) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  -- lock wallet row
  SELECT balance INTO bal FROM public.wallets WHERE user_id = uid FOR UPDATE;
  IF bal IS NULL THEN
    INSERT INTO public.wallets(user_id, balance) VALUES (uid, 0);
    bal := 0;
  END IF;
  IF bal < cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance', 'balance', bal);
  END IF;

  UPDATE public.wallets SET balance = balance - cost WHERE user_id = uid;
  INSERT INTO public.profile_unlocks (viewer_id, target_id, amount) VALUES (uid, _target, cost);
  INSERT INTO public.wallet_transactions (user_id, kind, amount, balance_after, reference, note)
  VALUES (uid, 'unlock', -cost, bal - cost, _target::text, 'Profile unlock');

  RETURN jsonb_build_object('ok', true, 'balance', bal - cost);
END;
$$;

-- =========================================================
-- SECURE FUNCTION: activate_boost
-- =========================================================
CREATE OR REPLACE FUNCTION public.activate_boost(_package public.boost_package)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cost integer;
  duration interval;
  bal integer;
  new_id uuid;
  exp timestamptz;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
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

-- =========================================================
-- SECURE FUNCTION: dev top-up (stubbed Paystack)
-- =========================================================
CREATE OR REPLACE FUNCTION public.dev_topup(_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  bal integer;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF _amount <= 0 OR _amount > 100000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;
  SELECT balance INTO bal FROM public.wallets WHERE user_id = uid FOR UPDATE;
  IF bal IS NULL THEN
    INSERT INTO public.wallets(user_id, balance) VALUES (uid, _amount);
    bal := 0;
  ELSE
    UPDATE public.wallets SET balance = balance + _amount WHERE user_id = uid;
  END IF;
  INSERT INTO public.wallet_transactions (user_id, kind, amount, balance_after, note)
  VALUES (uid, 'topup', _amount, bal + _amount, 'Test top-up (Paystack stub)');
  RETURN jsonb_build_object('ok', true, 'balance', bal + _amount);
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.boosts;