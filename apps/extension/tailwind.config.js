/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./popup.tsx",
    "./options.tsx",
    "./contents/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
