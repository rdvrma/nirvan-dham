import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        emerald: {
          50:  "#f0faf4",
          100: "#dcf4e7",
          200: "#bbe9d2",
          300: "#8ed7b6",
          400: "#5cbf95",
          500: "#38a476",
          600: "#27835e",
          700: "#1e6649",
          800: "#184f39",
          900: "#0f3225",
          950: "#0a1f14",
        },
        gold: {
          50:  "#fffdf0",
          100: "#fff8d4",
          200: "#ffeea0",
          300: "#ffe066",
          400: "#ffd03d",
          500: "#f5b800",
          600: "#d49400",
          700: "#a86d00",
          800: "#7a4e00",
          900: "#4e3200",
        },
        ivory: {
          50:  "#fefef9",
          100: "#fdfbf0",
          200: "#faf5dc",
          300: "#f5edbe",
          400: "#ede098",
          500: "#e0ce6e",
          600: "#c8ae44",
          700: "#a08a28",
          800: "#78651a",
          900: "#50430f",
        },
        // Brand Specifics
        dham: {
          bg:       "#080f0a",      // deep forest near-black
          surface:  "#0d1f10",      // card backgrounds
          mist:     "#122418",      // section alt bg
          border:   "#1e3d22",      // subtle borders
          glow:     "#2a6640",      // accent glow
          emerald:  "#1a5c35",      // primary brand emerald
          sage:     "#3d8a58",      // lighter emerald
          gold:     "#d4a843",      // warm gold
          goldhov:  "#e8c060",      // gold hover
          ivory:    "#f5edd8",      // warm cream text
          ivoryDim: "#c4b89a",      // dimmed cream
          text:     "#e8e0cc",      // body text
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        hindi: ["var(--font-hind)", "Noto Sans Devanagari", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "1.05" }],
        "display-xl":  ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.08" }],
        "display-lg":  ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.1" }],
        "display-md":  ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.15" }],
        "display-sm":  ["clamp(1.5rem, 2.5vw, 2rem)", { lineHeight: "1.2" }],
      },
      spacing: {
        section: "clamp(4rem, 8vw, 8rem)",
        "section-sm": "clamp(2rem, 4vw, 4rem)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "sacred-grid":
          "linear-gradient(rgba(212,168,67,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "sacred-grid": "60px 60px",
      },
      animation: {
        "float":           "float 6s ease-in-out infinite",
        "float-delayed":   "float 6s ease-in-out 2s infinite",
        "glow-pulse":      "glowPulse 4s ease-in-out infinite",
        "shimmer":         "shimmer 3s ease-in-out infinite",
        "sacred-spin":     "sacredSpin 30s linear infinite",
        "sacred-spin-rev": "sacredSpinRev 20s linear infinite",
        "fade-in-up":      "fadeInUp 0.8s ease forwards",
        "fade-in":         "fadeIn 0.6s ease forwards",
        "scale-in":        "scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "border-flow":     "borderFlow 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":      { opacity: "1",   transform: "scale(1.05)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        sacredSpin: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        sacredSpinRev: {
          from: { transform: "rotate(360deg)" },
          to:   { transform: "rotate(0deg)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        borderFlow: {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      boxShadow: {
        "gold-glow": "0 0 30px rgba(212, 168, 67, 0.25)",
        "gold-glow-lg": "0 0 60px rgba(212, 168, 67, 0.3)",
        "emerald-glow": "0 0 40px rgba(42, 102, 64, 0.4)",
        "inner-glow": "inset 0 0 30px rgba(212, 168, 67, 0.05)",
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.5), 0 0 24px rgba(212, 168, 67, 0.15)",
      },
      dropShadow: {
        gold: "0 0 20px rgba(212, 168, 67, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
