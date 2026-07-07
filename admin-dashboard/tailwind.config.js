/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9f6f5',
          100: '#f1e9e7',
          200: '#e5d7d3',
          300: '#d1bcb6',
          400: '#b89a91',
          500: '#a37e73',
          600: '#8d6e63',
          700: '#73574d',
          800: '#604941',
          900: '#503f38',
        }
      }
    },
  },
  plugins: [],
}
