export type DatabaseMode = "mock" | "supabase" | "postgres";

export function getDatabaseMode(): DatabaseMode {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }

  if (process.env.POSTGRES_URL) {
    return "postgres";
  }

  return "mock";
}

export const usernameSchema = `
create table if not exists usernames (
  username text primary key,
  wallet_address text not null unique,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id text primary key,
  merchant_wallet text not null,
  amount text not null,
  token text not null,
  settlement_token text not null,
  expiry text not null,
  status text not null default 'open',
  payment_link text not null,
  created_at timestamptz default now()
);

create table if not exists activities (
  id text primary key,
  wallet_address text not null,
  type text not null,
  title text not null,
  detail text not null,
  tx_hash text,
  status text not null,
  created_at timestamptz default now()
);

create table if not exists user_preferences (
  wallet_address text primary key,
  preferences jsonb not null,
  updated_at timestamptz default now()
);
`;
