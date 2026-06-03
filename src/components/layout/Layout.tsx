import React from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 max-w-screen-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
