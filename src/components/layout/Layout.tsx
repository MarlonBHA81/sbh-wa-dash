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
      <footer className="border-t border-surface-2 py-4 px-6 text-center">
        <p className="font-body text-xs text-charcoal/40">
          Built by{' '}
          <a
            href="https://storyadvantage.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            Story Advantage Marketing Agency
          </a>
        </p>
      </footer>
    </div>
  )
}
