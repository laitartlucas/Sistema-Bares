import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#FFF1F1',
          100: '#FFDEDF',
          200: '#FFC2C4',
          300: '#FF9398',
          400: '#FB5A62',
          500: '#EA1D2C',
          600: '#D10F20',
          700: '#AF0B1A',
          800: '#900E1A',
          900: '#76111B',
          950: '#41040A',
        },
        pizza: {
          red:   '#EA1D2C',
          dark:  '#0B1120',
          panel: '#151C2C',
          muted: '#64748B',
        },
        kds: {
          recebido:  '#3B82F6',
          preparo:   '#F59E0B',
          entrega:   '#10B981',
          entregue:  '#94A3B8',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'brand-flame': 'linear-gradient(135deg, #EA1D2C 0%, #FF5436 100%)',
      },
      boxShadow: {
        'brand': '0 8px 22px -6px rgba(234,29,44,.5)',
      },
      animation: {
        'slide-in':    'slideIn 0.25s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
        'bounce-in':   'bounceIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-alert': 'pulseAlert 1s cubic-bezier(0.4,0,0.6,1) 3',
      },
      keyframes: {
        slideIn:    { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        bounceIn:   { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseAlert: { '0%,100%': { boxShadow: '0 0 0 0 rgba(234,29,44,0.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(234,29,44,0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
