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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-safe">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-3 px-4 min-w-0 flex-1 transition-colors duration-150 relative',
                isActive ? 'text-pizza-red' : 'text-pizza-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {badge && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-pizza-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold leading-none">{label}</span>
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-pizza-red" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
