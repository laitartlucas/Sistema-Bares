import { NavLink, useNavigate } from 'react-router-dom'
import { UtensilsCrossed, ShoppingCart, ClipboardList, User } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { cn } from '../../utils/cn'
import { Logo } from './Logo'

const navItems = [
  { to: '/',        icon: UtensilsCrossed, label: 'Cardápio' },
  { to: '/cart',    icon: ShoppingCart,    label: 'Carrinho', badge: true },
  { to: '/orders',  icon: ClipboardList,   label: 'Pedidos' },
  { to: '/profile', icon: User,            label: 'Perfil' },
]

export function TopNav() {
  const { itemCount } = useCart()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 bg-pizza-dark text-pizza-cream pt-safe">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        <button onClick={() => navigate('/')} className="press-effect shrink-0">
          <Logo size={40} wordmark="sm" className="hidden sm:flex" />
          <Logo size={40} showWordmark={false} className="flex sm:hidden" />
        </button>

        <nav className="flex items-center gap-1 ml-auto min-w-0">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-bold transition-colors press-effect',
                  isActive
                    ? 'bg-pizza-cheese text-pizza-dark'
                    : 'text-pizza-sand hover:text-pizza-cream hover:bg-white/5',
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:inline">{label}</span>
              {badge && itemCount > 0 && (
                <span className="inline-flex items-center justify-center bg-pizza-red text-white rounded-full text-[11px] font-extrabold min-w-[18px] h-[18px] px-1 leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <span className="hidden lg:inline-flex items-center gap-1.5 whitespace-nowrap bg-[#173A22] text-[#6FDD8B] rounded-full text-xs font-bold px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6FDD8B] animate-pulse" />
          Aberto agora
        </span>
      </div>
    </header>
  )
}
