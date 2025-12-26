/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shen: {
          gold: '#FFD700',
          darkGold: '#DAA520',
          red: '#DC143C',
          green: '#0B6623',
          black: '#0A0A0A',
          frost: 'rgba(240, 248, 255, 0.1)'
        }
      },
      fontFamily: {
        brand: ['Orbitron', 'sans-serif'],
        santa: ['"Mountains of Christmas"', 'cursive'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'snow-fall': 'snowfall 10s linear infinite',
      },
      keyframes: {
        snowfall: {
          '0%': { transform: 'translateY(-10vh) translateX(0)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) translateX(100px)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}