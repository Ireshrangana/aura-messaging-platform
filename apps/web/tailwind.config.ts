import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aura: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8accff",
          400: "#4fafff",
          500: "#1d90ff",
          600: "#0c70db",
          700: "#0f59ad",
          800: "#124b8d",
          900: "#153f73",
          950: "#0d2548"
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(9, 17, 33, 0.10)",
        soft: "0 8px 24px rgba(9, 17, 33, 0.08)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;

