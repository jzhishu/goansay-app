import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#F8F8F5",
        paper: "#FCFCFA",
        ink: "#1D1D1F",
        secondary: "#6E6E73",
        tertiary: "#AEAEB2",
        sage: "#9AA08F",
        olive: "#6E7460",
        success: "#C9B89A",
      },
      fontFamily: {
        sans: ["Instrument Sans", "Avenir Next", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      keyframes: {
        cardIn: {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        lvlIn: {
          "0%": { opacity: "0", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
      animation: {
        cardIn: "cardIn .26s ease-out",
        lvlIn: "lvlIn .4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
