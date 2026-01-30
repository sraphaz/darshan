import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        void: "#050506",
        "deep-night": "#0B0C10",
        mist: "#F5F5F7",
        "moon-grey": "#B8B8C0",
      },
    },
  },
  plugins: [],
};

export default config;
