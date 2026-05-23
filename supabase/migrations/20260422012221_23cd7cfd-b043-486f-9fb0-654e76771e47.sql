
-- ENUMS
CREATE TYPE public.request_kind AS ENUM ('user', 'location');
CREATE TYPE public.request_status AS ENUM ('new', 'accepted', 'declined', 'expired');
CREATE TYPE public.request_intent AS ENUM ('serious', 'casual', 'friendship', 'networking', 'marriage');
CREATE TYPE public.notification_type AS ENUM ('request_new', 'request_accepted', 'request_declined', 'match', 'location_alert');

-- REQUESTS
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid,
  kind public.request_kind NOT NULL DEFAULT 'user',
  intent public.request_intent NOT NULL DEFAULT 'serious',
  message text,
  status public.request_status NOT NULL DEFAULT 'new',
  location_label text,
  location_lat double precision,
  location_lng double precision,
  location_radius_km integer DEFAULT 25,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  CONSTRAINT requests_kind_target_chk CHECK (
    (kind = 'user' AND recipient_id IS NOT NULL) OR
    (kind = 'location' AND location_label IS NOT NULL)
  ),
  CONSTRAINT requests_no_self CHECK (sender_id <> recipient_id OR recipient_id IS NULL)
);

CREATE INDEX idx_requests_recipient ON public.requests(recipient_id) WHERE recipient_id IS NOT NULL;
CREATE INDEX idx_requests_sender ON public.requests(sender_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_location ON public.requests(location_label) WHERE kind = 'location';

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender or recipient can view requests"
  ON public.requests FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = recipient_id
    OR (
      kind = 'location' AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.location IS NOT NULL
          AND lower(p.location) = lower(requests.location_label)
      )
    )
  );

CREATE POLICY "Users create their own requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipient can update status"
  ON public.requests FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id)
);

CREATE INDEX idx_matches_user_a ON public.matches(user_a);
CREATE INDEX idx_matches_user_b ON public.matches(user_b);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matched users can view their matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  related_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRIGGER: on new request, notify recipient (user kind) or nearby users (location kind)
CREATE OR REPLACE FUNCTION public.handle_new_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
BEGIN
  SELECT COALESCE(display_name, 'Someone') INTO sender_name
  FROM public.profiles WHERE user_id = NEW.sender_id;

  IF NEW.kind = 'user' AND NEW.recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES (
      NEW.recipient_id,
      'request_new',
      'New connection request',
      sender_name || ' sent you a request.',
      NEW.id
    );
  ELSIF NEW.kind = 'location' THEN
    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    SELECT p.user_id, 'location_alert', 'Nearby connection request',
           sender_name || ' is looking to connect in ' || NEW.location_label || '.',
           NEW.id
    FROM public.profiles p
    WHERE p.user_id <> NEW.sender_id
      AND p.location IS NOT NULL
      AND lower(p.location) = lower(NEW.location_label);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_request_insert_notify
  AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_request();

-- TRIGGER: on accept, create match + notify sender; on decline, notify sender
CREATE OR REPLACE FUNCTION public.handle_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_name text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(display_name, 'They') INTO recipient_name
  FROM public.profiles WHERE user_id = NEW.recipient_id;

  IF NEW.status = 'accepted' AND NEW.recipient_id IS NOT NULL THEN
    INSERT INTO public.matches (request_id, user_a, user_b)
    VALUES (NEW.id, NEW.sender_id, NEW.recipient_id)
    ON CONFLICT (request_id) DO NOTHING;

    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES (NEW.sender_id, 'request_accepted', 'Request accepted',
            recipient_name || ' accepted your request.', NEW.id);

    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES (NEW.sender_id, 'match', 'It''s a match!',
            'You matched with ' || recipient_name || '.', NEW.id);
  ELSIF NEW.status = 'declined' THEN
    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES (NEW.sender_id, 'request_declined', 'Request declined',
            'Your request was declined.', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_request_status_change
  AFTER UPDATE OF status ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_request_status_change();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
