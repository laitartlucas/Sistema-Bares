import React from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
  hideNav?: boolean
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-dvh bg-pizza-cream">
      <main className={hideNav ? 'min-h-dvh' : 'main-content'}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
