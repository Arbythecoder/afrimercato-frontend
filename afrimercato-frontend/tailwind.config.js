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
        // Afrimercato brand colors - Fresh Grocery Theme
        'afri-green': {
          DEFAULT: '#00B207',      // Primary green - buttons, CTAs
          dark: '#2C742F',         // Dark green - hover states
          light: '#84D187',        // Light green - accents
          pale: '#EDF2EE',         // Pale sage - backgrounds
        },
        'afri-yellow': {
          DEFAULT: '#FFD480',      // Golden yellow - accents
          light: '#FFF4E0',        // Light yellow - backgrounds
          dark: '#FF8A00',         // Orange - badges, alerts
        },
        'afri-gray': {
          50: '#F4F6F6',           // Product cards background
          100: '#E8ECEB',
          200: '#D1D9D7',
          300: '#B0BDB9',
          400: '#8A9A94',
          500: '#6B7C76',
          600: '#546660',
          700: '#3F4E49',
          800: '#2B3632',
          900: '#1A1A1A',          // Dark text
        },
      },
      backgroundColor: {
        'primary': '#EDF2EE',      // Main background
        'card': '#FFFFFF',         // Card background
      },
    },
  },
  plugins: [],
}
