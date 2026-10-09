/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#070a13',
          850: '#0b1120',
          800: '#0f172a',
          750: '#15213b',
          700: '#1e293b',
          600: '#334155',
          border: '#1f2e4d',
          accent: '#06b6d4',
          neon: '#22d3ee',
          danger: '#f43f5e',
          warning: '#f59e0b',
          success: '#10b981',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'cyber-card': '0 4px 20px -2px rgba(2, 6, 23, 0.7), 0 0 0 1px rgba(38, 56, 89, 0.45)',
        'cyber-glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'cyber-glow-red': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'cyber-glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
