import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-heading font-medium rounded-full transition-colors ' +
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-primary text-white hover:bg-tertiary ' +
      'active:bg-transparent active:border active:border-primary active:text-primary',
    outline:
      'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white',
  }

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
