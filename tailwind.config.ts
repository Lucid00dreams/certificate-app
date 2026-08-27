import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: "#F8FAFC",
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#0F172A",
          soft: "#334155",
          faint: "#64748B",
        },
        brass: {
          DEFAULT: "#D4AF37",
          dark: "#B8860B",
          soft: "#F59E0B",
          50: "#FFFBEB",
        },
        seal: {
          DEFAULT: "#BE123C",
          50: "#FFF1F2",
        },
        ok: {
          DEFAULT: "#059669",
          50: "#ECFDF5",
        },
        warn: {
          DEFAULT: "#D97706",
          50: "#FFFBEB",
        },
        line: "#E2E8F0",
        "line-soft": "#F1F5F9",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
        "card-lg": "0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        glow: "0 0 30px -5px rgba(212, 175, 55, 0.3)",
        "glow-lg": "0 0 50px -10px rgba(212, 175, 55, 0.4)",
      },
      keyframes: {
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.5) rotate(-12deg)" },
          "60%": { opacity: "1", transform: "scale(0.95) rotate(3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
      },
      animation: {
        "stamp-in": "stamp-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-up": "fade-up 0.5s ease-out forwards",
        shimmer: "shimmer 2s infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
