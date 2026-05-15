# ARC ONE

ARC ONE is a premium mobile-first crypto finance super app for Arc Testnet. It combines embedded wallet onboarding, live RPC balance sync, payments, merchant invoices, profile settings, and an action-preparing finance copilot.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS with shadcn-style local primitives
- Framer Motion
- Wagmi + Viem
- Zustand-ready app structure
- Arc Testnet chain config and RPC integration
- Embedded wallet creation with encrypted local key storage
- Real Arc Testnet RPC balance and native transfer paths
- Honest swap architecture that disables execution until a verified router is configured
- Placeholder API routes for usernames and merchant invoices

## Arc Testnet

The app is configured for:

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- Native currency: `USDC`

See [lib/arc.ts](./lib/arc.ts) for the chain config and mock Arc SDK integration boundary.

## Product Surface

- Home dashboard starts empty, syncs real wallet balance, and records activity only from user actions
- Payments hub validates balance and recipient, signs with embedded or external wallets, and surfaces tx hashes
- Trade hub previews route constraints and refuses to fake swaps without a configured router
- AI assistant reads wallet context, balances, invoices, and activity, then opens confirmation-first flows
- Profile settings open functional panels for username, security, wallets, notifications, theme, referrals, and support
- Merchant invoice builder generates local invoice records and payment links

## API Routes

- `GET /api/usernames?username=alex`
- `POST /api/usernames`
- `GET /api/merchant/invoices`
- `POST /api/merchant/invoices`

The current backend is persistence-ready. `lib/db.ts` includes Supabase/PostgreSQL environment detection and starter schemas for usernames, invoices, activities, and user preferences.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill in production values when available.
