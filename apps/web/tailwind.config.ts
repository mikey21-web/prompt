import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Taste skill: ban Inter, use Geist
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      colors: {
        // Impeccable: tinted neutrals, never pure black/white
        zinc: {
          950: "#0a0a0f",
        },
      },
      transitionTimingFunction: {
        // Emil Kowalski custom easing curves
        "out-expo": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-expo": "cubic-bezier(0.77, 0, 0.175, 1)",
        "drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.23, 1, 0.32, 1) backwards",
        "blob": "blob 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
