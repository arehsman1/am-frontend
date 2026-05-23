# Amorematch Frontend

Amorematch is a React/Vite matchmaking app backed by Supabase. This repo is now frontend-focused.

Supabase owns auth, database, storage, realtime updates, and row-level security. Sensitive server work should live in a separate backend repo/service, for example on Render.

## Frontend Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required frontend environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_WALLET_API_BASE_URL=https://your-backend.onrender.com
```

Only put public-safe values in frontend env variables. Anything starting with `VITE_` is exposed to the browser.

## External Backend

Host the backend separately, for example on Render, and point this frontend to that API URL.

Private backend environment variables belong in Render, not in this frontend repo:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_CALLBACK_URL=https://your-frontend-domain.com/wallet
FRONTEND_URL=https://your-frontend-domain.com
```

Expected backend endpoints:

- `GET /health`
- `POST /api/wallet/initialize`
- `GET /api/wallet/verify?reference=<paystack-reference>`

## Backend Rules

- Verify the Supabase JWT on every protected request.
- Derive `user_id` and `email` server-side from the verified token.
- Never trust frontend-submitted identity, role, wallet balance, or payment status.
- Use the Supabase service role only on the backend.
- Keep Paystack secrets only on the backend.

## Supabase

Keep `supabase/migrations` in this repo unless you later decide the backend repo should own all database changes.
