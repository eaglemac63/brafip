import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/sanity/**/*.{ts,tsx}",
    "./src/emails/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      fontFamily: {
        serif: ["var(--font-eb-garamond)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Tokens BraFip — ajuste conforme o brand book
        brand: {
          DEFAULT: "hsl(210 40% 24%)", // azul-petróleo escuro
          accent: "hsl(38 80% 52%)",   // dourado/âmbar
          muted: "hsl(210 20% 92%)",
        },
        // shadcn/ui tokens
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(210 40% 24%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(210 40% 12%)",
        primary: {
          DEFAULT: "hsl(210 40% 24%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(210 20% 92%)",
          foreground: "hsl(210 40% 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(210 20% 96%)",
          foreground: "hsl(210 20% 40%)",
        },
        accent: {
          DEFAULT: "hsl(210 20% 92%)",
          foreground: "hsl(210 40% 20%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(210 40% 12%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
