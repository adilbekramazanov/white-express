import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          500: "#4f6ef7",
          600: "#3b5bdb",
          700: "#2f4ac0",
        },
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(0,0,0,0.06)",
        card: "0 4px 24px 0 rgba(0,0,0,0.08)",
        modal: "0 20px 60px 0 rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
