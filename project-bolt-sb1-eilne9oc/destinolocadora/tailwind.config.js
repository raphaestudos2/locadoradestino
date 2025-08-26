/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yellow: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f1b800',
          500: '#f1b800',
          600: '#f1b800',
          700: '#f3bd00',
          800: '#f6c40f',
          900: '#f8c901',
        }
      }
    },
  },
  plugins: [],
};