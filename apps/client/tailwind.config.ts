import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vermelho "apetitoso" — base da identidade Solange Delivery
        brand: {
          50:  '#FDEBE9',
          100: '#FBD7D3',
          200: '#F4B0A9',
          300: '#EC8880',
          400: '#E85E52',
          500: '#E2382A',
          600: '#C92B1E',
          700: '#A81F15',
          800: '#8A1810',
          900: '#6E140D',
          950: '#3F0805',
        },
        // Tokens semânticos usados em todo o app
        pizza: {
          red:    '#E2382A', // vermelho principal (CTAs, preços, links)
          tomato: '#FF6A3D', // laranja-tomate para realces
          crust:  '#E8A65A', // dourado de borda assada
          cheese: '#FFC72C', // amarelo (destaques, CTAs secundários)
          honey:  '#FFF3D6', // fundo de badge amarelo
          label:  '#9A6B00', // texto sobre badge amarelo
          basil:  '#2FA869', // verde ("aberto agora")
          cream:  '#FBF5EA', // fundo creme (página)
          dark:   '#16110C', // marrom quase-preto (headers/hero/cards escuros)
          dark2:  '#221A12', // superfície escura secundária
          ink:    '#2A231B', // texto do corpo
          sand:   '#CFC4B4', // texto claro sobre fundo escuro
          line:   '#F1E7D6', // bordas de cards claros
          border: '#E8DCC8', // bordas de inputs / tracejados
          muted:  '#8A7F70', // texto secundário
        },
      },
      fontFamily: {
        // Display expressivo para títulos e wordmark
        display: ['"Lilita One"', 'system-ui', 'cursive'],
        serif: ['"Lilita One"', 'Georgia', 'cursive'],
        sans: ['"Karla"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Gradiente vermelho da marca (CTAs primários)
        'brand-flame': 'linear-gradient(135deg, #E2382A 0%, #C92B1E 100%)',
        'brand-flame-soft': 'linear-gradient(135deg, #FDEBE9 0%, #FFF3D6 100%)',
        'cheese-glow': 'radial-gradient(120% 120% at 0% 0%, #FFC72C 0%, #E2382A 100%)',
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
        'soft':     '0 2px 15px -3px rgba(22,17,12,.08), 0 10px 24px -2px rgba(22,17,12,.05)',
        'card':     '0 1px 3px rgba(22,17,12,.05), 0 6px 16px -6px rgba(22,17,12,.08)',
        'card-lg':  '0 8px 30px -8px rgba(22,17,12,.16)',
        'brand':    '0 8px 20px -4px rgba(226,56,42,.35)',
        'brand-lg': '0 14px 34px -8px rgba(226,56,42,.40)',
        'cheese':   '0 8px 22px -6px rgba(255,199,44,.50)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
