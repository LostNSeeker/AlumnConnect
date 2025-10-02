import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const hideHeaderFooter = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Header />}
      <main className="flex-1">{children}</main>
      {!hideHeaderFooter && <Footer />}
    </div>
  )
}
