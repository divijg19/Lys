/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
  ],
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
  ],
};
