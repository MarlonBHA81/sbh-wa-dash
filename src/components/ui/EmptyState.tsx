interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No data yet',
  description = 'Data will appear here once available.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-3">
        <span className="text-charcoal/30 text-lg font-heading">—</span>
      </div>
      <p className="font-heading font-semibold text-charcoal/50 text-sm">{title}</p>
      {description && (
        <p className="font-body text-xs text-charcoal/35 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  )
}
