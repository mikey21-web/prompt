/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.tsx",
    "./options.tsx",
    "./contents/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#131316",
        "surface-hover": "#1a1a1f",
        muted: "#5c5c66",
        secondary: "#9b9ba3",
      },
    },
  },
  plugins: [],
};
