## Setup (Supabase + Gemini only)

This project now uses only Supabase (DB + Auth) and Gemini (AI). Firebase and Clerk were removed.

### Environment variables

Create `.env.local` at the project root and set:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Phone OTP is handled by Supabase Auth (configure SMS provider in Supabase Dashboard)
```

Notes:
- Gemini has a generous free tier; create an API key at makersuite.google.com or Google AI Studio.
- Phone OTP via Supabase requires an SMS provider (e.g., Twilio trial works for free dev/testing). In local dev, you can also inspect OTP via Supabase Auth logs.
- Bank account linking is intentionally left empty as requested; wire it later after KYC.

### Install and run

```pwsh
npm install
npm run dev
```

### RAG with Gemini
- Embeddings: `text-embedding-004` (768 dims) are padded to 1536 to match the existing `vector(1536)` column in `circulars`.
- Generation: `gemini-1.5-flash` for fast, low-cost answers.

### Free alternatives provided
- KYC: `/api/kyc/verify` hashes IDs, dedupes across users, and records status as pending/manual review. No paid KYC API used.
- Fraud check: `/api/fraud/check` uses velocity/amount/beneficiary-age heuristics from your own data only.
- Credit score: `/api/credit/calculate` computes a soft score using transactions, non-financial events, KYC, and account age.

### Supabase configuration steps
1) Create a Supabase project and get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2) In SQL Editor, run `supabase-schema.sql`, then `supabase-functions.sql`, then `supabase-auth.sql`.
3) Enable Auth -> Providers -> Phone. Configure an SMS provider (Twilio/MessageBird). For free dev, Twilio trial works.
4) (Optional) Turn on pgvector extension if not already (our schema already includes `CREATE EXTENSION vector`).
5) In Authentication -> Policies, ensure email confirmation is disabled for phone-only flow if desired.
6) Add your environment variables to `.env.local`.

### How to sign in with phone OTP
- Visit `/sign-in`, enter your phone with country code (`+91…`), click Send OTP, then enter the code.
- After sign-in, the header shows Sign out. User id flows into components as `user?.id`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
