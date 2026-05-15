"use client";

import { ThemeMode } from "@/lib/app-store";

export function applyTheme(mode: ThemeMode) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "system" ? systemDark : mode === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}
