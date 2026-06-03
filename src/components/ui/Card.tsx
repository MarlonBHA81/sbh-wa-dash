import React from 'react'

interface CardProps {
  title?: string
  className?: string
  children: React.ReactNode
}

export function Card({ title, className = '', children }: CardProps) {
  return (
    <div className={`bg-surface rounded-2xl p-6 border border-surface-2 ${className}`}>
      {title && (
        <h3 className="font-heading font-semibold text-charcoal text-base mb-4">{title}</h3>
      )}
      {children}
    </div>
  )
}
