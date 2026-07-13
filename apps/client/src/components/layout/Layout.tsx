import React from 'react'
import { TopNav } from './TopNav'

interface LayoutProps {
  children: React.ReactNode
  /** Oculta o rodapé — usado em telas com barra de ação fixa embaixo */
  hideNav?: boolean
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-pizza-cream">
      <TopNav />
      <main className="flex-1 w-full">{children}</main>
      {!hideNav && (
        <footer className="bg-pizza-dark text-pizza-muted py-5 px-4 text-center text-[13px]">
          Solange Delivery · 54 99672-7602 · 54 99960-6907
        </footer>
      )}
    </div>
  )
}
