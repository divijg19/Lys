/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/index.html",
  ],

  darkMode: ["class", '[data-theme="dark"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        accent: "var(--color-accent)",
        theme: {
          light: {
            bg: "#ffffff",
            fg: "#0f172a",
          },
          dark: {
            bg: "#0f172a",
            fg: "#f1f5f9",
          },
          cyberpunk: {
            bg: "#0a0a23",
            fg: "#f8f8f2",
            accent: "#ff00cc",
          },
          ethereal: {
            bg: "#f0f9ff",
            fg: "#4b5563",
            accent: "#a78bfa",
          },
          "horizon-blaze": {
            bg: "#ffedd5",
            fg: "#7c2d12",
            accent: "#fb923c",
          },
          "neo-mirage": {
            bg: "#e0f2f1",
            fg: "#1e3a8a",
            accent: "#60a5fa",
          },
          "high-contrast": {
            bg: "#000000",
            fg: "#ffffff",
            accent: "#ffff00",
          },
          "reduced-motion": {
            bg: "#f0f0f0",
            fg: "#1a1a1a",
            accent: "#808080",
          },
        },
      },

      backgroundImage: {
        "pattern-stripes": "repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)",
      },

      animation: {
        float: "float 10s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        subtleFade: "subtleFade 30s ease-in-out infinite",
        "reduced-fade": "reducedFade 1s ease-out",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        subtleFade: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.95" },
        },
        reducedFade: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    plugin(({ addVariant }) => {
      addVariant("motion-safe", "@media (prefers-reduced-motion: no-preference)");
      addVariant("motion-reduce", "@media (prefers-reduced-motion: reduce)");
    }),
  ],
};
