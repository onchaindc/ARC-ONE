# ARC ONE

ARC ONE is a premium mobile-first crypto finance super app concept for Arc Testnet. It combines portfolio, payments, merchant checkout, swap flows, username payments, and an AI finance copilot in a polished Next.js App Router codebase.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS with shadcn-style local primitives
- Framer Motion
- Wagmi + Viem
- Zustand-ready app structure
- Arc Testnet chain config and RPC integration
- Mock Arc SDK boundary for swaps, sends, and merchant payments
- Placeholder API routes for usernames and merchant invoices

## Arc Testnet

The app is configured for:

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- Native currency: `USDC`

See [lib/arc.ts](./lib/arc.ts) for the chain config and mock Arc SDK integration boundary.

## Product Surface

- Home dashboard with portfolio balance, quick actions, assets, activity feed, market snapshot, banners, and trust indicators
- Payments hub with send, request, QR, merchant checkout, split bill, and subscriptions
- Trade hub with swap widget, live quote mock, route preview, watchlist, and advanced coming-soon features
- AI assistant that recommends finance actions but requires user confirmation before transactions
- Profile, username registry, wallet/security settings, referrals, support, and theme controls
- Merchant mini-dashboard with links, invoices, QR checkout, history, and settlement state

## API Routes

- `GET /api/usernames?username=alex`
- `POST /api/usernames`
- `GET /api/merchant/invoices`
- `POST /api/merchant/invoices`

The current backend is intentionally mock-first. `lib/db.ts` includes Supabase/PostgreSQL environment detection and a starter username table schema for production wiring.

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
