/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #1E40AF)',
          secondary: 'var(--brand-secondary, #F59E0B)',
        }
      }
    },
  },
  plugins: [],
}
