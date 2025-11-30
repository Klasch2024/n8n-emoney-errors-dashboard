import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#212121",
          secondary: "#2A2A2A",
          tertiary: "#333333",
        },
        accent: {
          neon: "#E67514",
          "neon-hover": "#FF8C2E",
          "neon-muted": "#D66510",
        },
        text: {
          primary: "#F5F5F5",
          secondary: "#BEBEBE",
          tertiary: "#8A8A8A",
        },
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
export default config;

