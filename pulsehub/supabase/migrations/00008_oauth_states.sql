-- OAuth state tokens for secure connect flow
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform    text NOT NULL,
  state_token text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON public.oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user ON public.oauth_states(user_id);

-- Auto-cleanup expired states (run periodically)
-- DELETE FROM public.oauth_states WHERE expires_at < NOW();
