/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#13ec80',
        'primary-dim': 'rgba(19,236,128,0.2)',
        'bg-dark': '#102219',
        'bg-darker': '#0a110d',
        'surface-dark': '#161b18',
        'surface-panel': '#1a2e24',
        'surface-canvas': '#0c1a13',
        'border-dark': '#234836',
        'border-subtle': '#1f3d2d',
        'track-bg': '#234836',
        'waveform': '#2a5544',
      },
      fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        neon: '0 0 15px rgba(19,236,128,0.3)',
        'neon-lg': '0 0 30px rgba(19,236,128,0.4)',
        glow: '0 0 40px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
