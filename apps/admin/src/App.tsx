import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ToastProvider } from './hooks/useToast'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { KDSPage } from './pages/KDSPage'
import { MenuPage } from './pages/MenuPage'
import { ConfigPage } from './pages/ConfigPage'
import { ReportPage } from './pages/ReportPage'
import { WhatsAppPage } from './pages/WhatsAppPage'
import { ManualOrderPage } from './pages/ManualOrderPage'
import { FullPageSpinner } from './components/ui/Spinner'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<KDSPage />} />
        <Route path="menu"          element={<MenuPage />} />
        <Route path="relatorio"     element={<ReportPage />} />
        <Route path="config"        element={<ConfigPage />} />
        <Route path="whatsapp"      element={<WhatsAppPage />} />
        <Route path="pedido-manual" element={<ManualOrderPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
