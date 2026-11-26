/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0C4F7A',
          blue: '#0284C7',
          light: '#38BDF8',
          bg: '#111215',
          card: '#1A1C20',
        }
      }
    },
  },
  plugins: [],
}
