/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-date-range/dist/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        // Afrimercato brand colors - Organic Green & Yellow
        'afri-green': {
          DEFAULT: '#4A7C2C',
          dark: '#2D5016',
          light: '#6B9F3E',
        },
        'afri-yellow': {
          DEFAULT: '#F4B400',
          light: '#FFCD29',
          dark: '#D49A00',
        },
      },
    },
  },
  plugins: [],
}
