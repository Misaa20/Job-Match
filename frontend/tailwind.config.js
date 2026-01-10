/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Mauve/Plum
        primary: {
          50: '#f8f6f7',
          100: '#f0ebec',
          200: '#e0d5d8',
          300: '#c9b8bc',
          400: '#ae949a',
          500: '#846267',
          600: '#745862',
          700: '#614a52',
          800: '#523f46',
          900: '#47383d',
        },
        // Accent - Dusty Rose
        accent: {
          50: '#fdf5f6',
          100: '#fbeaec',
          200: '#f7d5da',
          300: '#f0b5bc',
          400: '#d89a9e',
          500: '#c37d92',
          600: '#ab6378',
          700: '#8f4f61',
          800: '#774452',
          900: '#663c48',
        },
        // Neutral warm tones
        warm: {
          50: '#fdfcfb',
          100: '#f9f6f4',
          200: '#f2ebe7',
          300: '#e0c1b3',
          400: '#d4a999',
          500: '#c49080',
          600: '#b07868',
          700: '#936356',
          800: '#7a5349',
          900: '#66463f',
        },
        // Sage - Muted green-gray
        sage: {
          50: '#f6f7f6',
          100: '#eceeed',
          200: '#d8dbd7',
          300: '#bcc1b8',
          400: '#aeb4a9',
          500: '#8a9284',
          600: '#717a6c',
          700: '#5c6358',
          800: '#4d5249',
          900: '#42463f',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
