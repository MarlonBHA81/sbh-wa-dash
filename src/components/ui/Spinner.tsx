interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-surface-2 border-t-primary ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
