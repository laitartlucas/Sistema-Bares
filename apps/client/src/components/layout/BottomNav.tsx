import { NavLink } from 'react-router-dom'
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/',        icon: Home,          label: 'Cardápio' },
  { to: '/cart',    icon: ShoppingCart,  label: 'Carrinho',  badge: true },
  { to: '/orders',  icon: ClipboardList, label: 'Pedidos' },
  { to: '/profile', icon: User,          label: 'Perfil' },
]

export function BottomNav() {
  const { itemCount } = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-brand-100/70 pb-safe">
      <div className="flex justify-around max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex flex-col items-center gap-1 pt-2.5 pb-1 px-3 min-w-0 flex-1 transition-colors duration-150',
                isActive ? 'text-pizza-red' : 'text-pizza-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'relative flex items-center justify-center w-12 h-9 rounded-2xl transition-all duration-200',
                    isActive ? 'bg-brand-flame text-white shadow-brand' : 'group-active:bg-brand-50',
                  )}
                >
                  <Icon size={21} strokeWidth={isActive ? 2.6 : 2} />
                  {badge && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-pizza-cheese text-pizza-dark text-[10px] font-extrabold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none ring-2 ring-pizza-cream">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span className={cn('text-[10px] leading-none', isActive ? 'font-extrabold' : 'font-semibold')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
