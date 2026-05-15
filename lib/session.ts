"use client";

const AUTH_STORAGE_KEY = "arc-one-auth-session";

export type LocalAuthSession = {
  mode: "embedded" | "external";
  address: `0x${string}`;
  unlockedAt: string;
};

export function saveLocalAuthSession(session: LocalAuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function readLocalAuthSession(): LocalAuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as LocalAuthSession;
  } catch {
    return null;
  }
}

export function clearLocalAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
