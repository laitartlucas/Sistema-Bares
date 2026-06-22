import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pizza: {
          red:   '#C0392B',
          dark:  '#0F172A',
          panel: '#1E293B',
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
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
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
        pulseAlert: { '0%,100%': { boxShadow: '0 0 0 0 rgba(192,57,43,0.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(192,57,43,0)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
