import React, { useEffect } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 bg-charcoal/20 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="sticky top-0 bg-white border-b border-surface-2 px-6 py-4 flex items-center gap-3">
          {title && (
            <h2 className="font-heading font-semibold text-charcoal flex-1">{title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto text-charcoal/40 hover:text-charcoal transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </>
  )
}
