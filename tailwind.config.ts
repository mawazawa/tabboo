import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)",
            opacity: "0.98",
            filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.3))",
          },
          "25%": {
            transform: "translateY(-3px) translateX(1.5px) rotate(0.3deg)",
            opacity: "1",
            filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.4))",
          },
          "50%": {
            transform: "translateY(-4px) translateX(-1px) rotate(-0.2deg)",
            opacity: "0.99",
            filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.35))",
          },
          "75%": {
            transform: "translateY(-2px) translateX(1px) rotate(0.15deg)",
            opacity: "1",
            filter: "drop-shadow(0 0 11px hsl(var(--primary) / 0.38))",
          },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "bounce-subtle": {
          "0%, 100%": { 
            transform: "translateY(0) scale(1)",
            filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.6))"
          },
          "50%": { 
            transform: "translateY(-5px) scale(1.1)",
            filter: "drop-shadow(0 0 16px hsl(var(--accent) / 0.8))"
          },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 120s cubic-bezier(0.4, 0.0, 0.2, 1) infinite",
        "gradient-flow": "gradient-flow 3s ease infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
      },
      backgroundSize: {
        "size-200": "200% 200%",
      },
      dropShadow: {
        "glow": [
          "0 0 20px hsl(var(--primary) / 0.5)",
          "0 0 40px hsl(var(--accent) / 0.3)"
        ],
      },
      boxShadow: {
        "glow": "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--accent) / 0.3)",
        "glow-intense": "0 0 40px hsl(var(--primary) / 0.7), 0 0 80px hsl(var(--accent) / 0.5), 0 0 120px hsl(var(--primary) / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
