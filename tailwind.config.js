/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        studio: {
          dark: '#171614',
          panel: '#201F1D',
          border: '#2E2D2A',
          subtle: '#2A2926',
          light: '#FBFBF9',
          lightPanel: '#FFFFFF',
          lightBorder: '#E6E5E1',
          accent: '#E28C65',
          accentHover: '#EA9A75',
          green: '#3ECF8E',
          red: '#F87171',
          yellow: '#F5A623',
          blue: '#58A6FF',
        }
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

