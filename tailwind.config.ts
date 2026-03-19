import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui HSL CSS variable tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // GitPM design tokens
        navy: {
          DEFAULT: "#0D1B2A",
          mid: "#152238",
          light: "#1E3150",
        },
        "dark-surface": "#1B2838",
        teal: {
          DEFAULT: "#0A7558",
          light: "#0F9B72",
          bg: "#0A75581a",
        },
        purple: {
          DEFAULT: "#6C5CE7",
          light: "#8B7EF0",
          bg: "#6C5CE71a",
        },
        forest: {
          DEFAULT: "#2D6A4F",
          bg: "#2D6A4F1a",
        },
        surface: {
          light: "#EDECEA",
          card: "#FFFFFF",
        },
        "page-bg": "#F5F3EE",
        "gitpm-border": "#C8C5BE",
        "gitpm-border-light": "#DDD9D3",
        "text-primary": "#0D1B2A",
        "text-secondary": "#555B6E",
        "text-muted": "#8A8F9C",
        "text-inverse": "#E8ECF0",
        "text-inverse-muted": "#9BA8B9",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        // Legacy aliases kept for backward compatibility
        display: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderWidth: {
        "0.5": "0.5px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
