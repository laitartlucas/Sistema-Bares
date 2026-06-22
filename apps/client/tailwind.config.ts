import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FEF7EE',
          100: '#FDECD8',
          200: '#FAD5B0',
          300: '#F7B87E',
          400: '#F2904A',
          500: '#EE6F27',
          600: '#DF541D',
          700: '#B93F19',
          800: '#93321B',
          900: '#772B19',
          950: '#41130B',
        },
        pizza: {
          red:    '#C0392B',
          tomato: '#E74C3C',
          crust:  '#D4A574',
          cream:  '#FEF7EE',
          dark:   '#1C0F0A',
          muted:  '#7B5E52',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C0392B' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                  to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(0.8)' },       to: { opacity: '1', transform: 'scale(1)' } },
      },
      boxShadow: {
        'soft':   '0 2px 15px -3px rgba(0,0,0,.07), 0 10px 20px -2px rgba(0,0,0,.04)',
        'card':   '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'brand':  '0 4px 14px 0 rgba(192,57,43,.39)',
        'brand-lg': '0 8px 30px rgba(192,57,43,.35)',
      },
    },
  },
  plugins: [],
} satisfies Config
