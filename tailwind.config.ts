import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070d",
        surface: "#0d1324",
        panel: "#10192e",
        glass: "rgba(255, 255, 255, 0.08)",
        line: "rgba(255, 255, 255, 0.12)",
        muted: "#8f9bb3",
        arcblue: "#2f8cff",
        arcpurple: "#8b5cf6",
        gain: "#39d98a",
        loss: "#ff5470"
      },
      boxShadow: {
        glow: "0 24px 90px rgba(47, 140, 255, 0.22)",
        soft: "0 18px 55px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
