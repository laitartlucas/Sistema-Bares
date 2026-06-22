import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { SocketProvider } from './contexts/SocketContext'
import { ToastProvider } from './hooks/useToast'
import { Spinner } from './components/ui/Spinner'

import LoginPage          from './pages/LoginPage'
import HomePage           from './pages/HomePage'
import BuildPizzaPage     from './pages/BuildPizzaPage'
import CartPage           from './pages/CartPage'
import CheckoutPage       from './pages/CheckoutPage'
import OrderTrackingPage  from './pages/OrderTrackingPage'
import OrderHistoryPage   from './pages/OrderHistoryPage'
import ProfilePage        from './pages/ProfilePage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-pizza-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl animate-spin-slow">🍕</span>
          <Spinner size="sm" />
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-pizza-cream">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl animate-spin-slow">🍕</span>
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/pizza/build" element={<RequireAuth><BuildPizzaPage /></RequireAuth>} />
      <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
      <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
      <Route path="/orders" element={<RequireAuth><OrderHistoryPage /></RequireAuth>} />
      <Route path="/orders/:id" element={<RequireAuth><OrderTrackingPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
