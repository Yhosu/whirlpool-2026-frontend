/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whirlpool: {
          yellow: '#FDC32B',
          'yellow-light': '#FFD95E',
          'yellow-dark': '#F0A81C',
          blue: '#004B87',
          'blue-dark': '#003366',
          'blue-light': '#0066B3',
        },
        dismac: {
          red: '#E31B23',
          'red-dark': '#B8141B',
        },
        brand: {
          cream: '#FFFBF0',
          'cream-dark': '#F8F1DE',
          carbon: '#101010',
          dark: '#1E1E1E',
          surface: '#262626',
          border: '#333333',
        }
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        script: ['Pacifico', 'cursive'],
        sans: ['Manrope', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 25s linear infinite',
        'spin-reverse': 'spin-reverse 30s linear infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-3px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(3px, 0, 0)' },
        }
      },
      boxShadow: {
        'glow-yellow': '0 0 35px -5px rgba(253, 195, 43, 0.4)',
        'glow-white': '0 0 25px rgba(255, 255, 255, 0.3)',
        '3d-badge': '0 10px 0 #c7860c, 0 15px 25px rgba(0,0,0,0.3)',
        'chassis': '0 25px 60px -15px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -4px 8px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
