import { NavLink } from 'react-router-dom'
import { LayoutGrid, UtensilsCrossed, Settings, BarChart2, LogOut, Wifi, WifiOff, MessageCircle, ClipboardList } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'

const links = [
  { to: '/',              icon: LayoutGrid,      label: 'Pedidos' },
  { to: '/pedido-manual', icon: ClipboardList,   label: 'Ped. Manual' },
  { to: '/menu',          icon: UtensilsCrossed, label: 'Cardápio' },
  { to: '/relatorio',     icon: BarChart2,       label: 'Relatório' },
  { to: '/whatsapp',      icon: MessageCircle,   label: 'WhatsApp' },
  { to: '/config',        icon: Settings,        label: 'Config.' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()

  return (
    <aside className="w-16 lg:w-56 bg-pizza-dark flex flex-col h-screen shrink-0 transition-all duration-300 border-r border-white/5">
      <div className="px-3 py-5 lg:px-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 bg-brand-flame rounded-2xl flex items-center justify-center shrink-0 shadow-brand">
          <span className="text-white font-display font-extrabold text-base">DL</span>
        </div>
        <div className="hidden lg:block overflow-hidden">
          <p className="text-white font-serif italic text-base truncate leading-tight">Dom Luigi</p>
          <p className="text-slate-400 text-[11px] font-medium truncate leading-tight">Painel Admin</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `sidebar-item flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-flame text-white shadow-brand'
                  : 'text-slate-400 hover:bg-white/10 hover:text-slate-100'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-2 lg:px-3 pb-4 space-y-2">
        <div className="flex items-center gap-2 px-2.5 py-2">
          {connected
            ? <Wifi size={14} className="text-emerald-400 shrink-0" />
            : <WifiOff size={14} className="text-red-400 shrink-0 animate-pulse" />}
          <span className="hidden lg:block text-xs text-slate-500">{connected ? 'Online' : 'Desconectado'}</span>
        </div>

        {user && (
          <div className="hidden lg:block px-2.5 py-1">
            <p className="text-xs text-slate-400 truncate">{user.nome}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block">Sair</span>
        </button>
      </div>
    </aside>
  )
}
