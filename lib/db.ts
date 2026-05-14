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
`;
