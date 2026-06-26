import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vermelho vivo "apetitoso" — base da identidade Dom Luigi
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
        // Tokens semânticos usados em todo o app
        pizza: {
          red:    '#EA1D2C', // vermelho vivo principal
          tomato: '#FF5436', // laranja-tomate para gradientes/realces
          crust:  '#E8A65A', // dourado de borda assada
          cheese: '#FFC53D', // amarelo queijo / energia
          basil:  '#2FA869', // verde manjericão (frescor / "aberto")
          cream:  '#FFF7F2', // fundo creme quente
          dark:   '#1A1012', // quase-preto quente (texto)
          muted:  '#8A6F69', // cinza quente (texto secundário)
        },
      },
      fontFamily: {
        // Display expressivo e moderno para títulos
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        // Wordmark / toques elegantes
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Gradiente quente da marca (vermelho → tomate)
        'brand-flame': 'linear-gradient(135deg, #EA1D2C 0%, #FF5436 60%, #FF7A3C 100%)',
        'brand-flame-soft': 'linear-gradient(135deg, #FFE0DE 0%, #FFF1F1 100%)',
        'cheese-glow': 'radial-gradient(120% 120% at 0% 0%, #FFC53D 0%, #FF5436 55%, #EA1D2C 100%)',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)',
        'bounce-in':  'bounceIn 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'shimmer':    'shimmer 1.6s infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                                to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:{ from: { opacity: '0', transform: 'translateY(-12px)' },to: { opacity: '1', transform: 'translateY(0)' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(0.8)' },       to: { opacity: '1', transform: 'scale(1)' } },
        float:    { '0%,100%': { transform: 'translateY(0) rotate(-3deg)' }, '50%': { transform: 'translateY(-10px) rotate(3deg)' } },
        shimmer:  { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      boxShadow: {
        'soft':     '0 2px 15px -3px rgba(26,16,18,.08), 0 10px 24px -2px rgba(26,16,18,.05)',
        'card':     '0 1px 3px rgba(26,16,18,.06), 0 6px 16px -6px rgba(26,16,18,.10)',
        'card-lg':  '0 8px 30px -8px rgba(26,16,18,.18)',
        'brand':    '0 8px 22px -6px rgba(234,29,44,.45)',
        'brand-lg': '0 14px 38px -8px rgba(234,29,44,.42)',
        'cheese':   '0 8px 22px -6px rgba(255,180,32,.5)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
