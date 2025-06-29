/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'spenser': ['Spenser', 'sans-serif'],
      },
      colors: {
        'ncad-black': '#1A1A1A',
        'ncad-dark-gray': '#2C2C2C',
        'ncad-light-gray': '#404040',
        'ncad-light-gray-darker': '#353535',
        'ncad-white': '#ffffff',
        'ncad-text-gray': '#B0B0B0',
        'ncad-green': '#52489C',
        'ncad-error': '#FF4444',
        'ncad-error-darker': '#CC3333',
      },
    },
  },
  plugins: [],
}