-- 1) Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role helper (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Self-read; admin manage
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can grant roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can revoke roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) Reports table
CREATE TYPE public.report_target AS ENUM ('user', 'request', 'profile');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type public.report_target NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  auto_flag boolean NOT NULL DEFAULT false,
  status public.report_status NOT NULL DEFAULT 'open',
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_target ON public.reports(target_type, target_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators view all reports"
  ON public.reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (reporter_id IS NULL OR auth.uid() = reporter_id));

CREATE POLICY "Moderators update reports"
  ON public.reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Auto-flagging of suspicious request messages
CREATE OR REPLACE FUNCTION public.scan_request_safety()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg text := lower(coalesce(NEW.message, ''));
  flagged_reason text := NULL;
BEGIN
  IF length(msg) = 0 THEN RETURN NEW; END IF;

  -- Crypto wallet patterns (BTC / ETH-style addresses)
  IF msg ~ '(0x[a-f0-9]{40})' OR msg ~ '\b(bc1|[13])[a-z0-9]{25,39}\b' THEN
    flagged_reason := 'Possible crypto wallet address';
  ELSIF msg ~ 'bit\.ly|tinyurl\.com|t\.me/|telegra\.ph|wa\.link' THEN
    flagged_reason := 'Suspicious shortened or off-platform link';
  ELSIF msg ~ 'guaranteed roi|double your money|forex signal|investment opportunity|usdt|binary option|mmm|ponzi' THEN
    flagged_reason := 'Possible scam / ponzi keyword';
  ELSIF msg ~ 'crypto|bitcoin|ethereum' AND msg ~ 'invest|profit|trade|signal' THEN
    flagged_reason := 'Crypto-investment solicitation';
  END IF;

  IF flagged_reason IS NOT NULL THEN
    INSERT INTO public.reports (reporter_id, target_type, target_id, reason, details, auto_flag)
    VALUES (NULL, 'request', NEW.id, flagged_reason, left(NEW.message, 500), true);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_scan_request_safety
  AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.scan_request_safety();

-- 4) Wire existing notification + status triggers (was missing on the requests table)
-- handle_new_request and handle_request_status_change already exist as functions
DROP TRIGGER IF EXISTS trg_handle_new_request ON public.requests;
CREATE TRIGGER trg_handle_new_request
  AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_request();

DROP TRIGGER IF EXISTS trg_handle_request_status_change ON public.requests;
CREATE TRIGGER trg_handle_request_status_change
  AFTER UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_request_status_change();

-- Wallet auto-provisioning trigger (function existed, trigger didn't)
DROP TRIGGER IF EXISTS trg_handle_new_user_wallet ON auth.users;
CREATE TRIGGER trg_handle_new_user_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Profile auto-creation trigger (function existed, trigger didn't)
DROP TRIGGER IF EXISTS trg_handle_new_user ON auth.users;
CREATE TRIGGER trg_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers for profiles and wallets if missing
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();