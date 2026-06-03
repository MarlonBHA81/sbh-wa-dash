import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:         '#4e8a88',
        'primary-hover': '#447b78',
        secondary:       '#683f59',
        tertiary:        '#5d7868',
        charcoal:        '#484851',
        'charcoal-dark': '#3a3a43',
        surface:         '#e0dedd',
        'surface-2':     '#d3cfce',
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body:    ['Avenir', '"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
