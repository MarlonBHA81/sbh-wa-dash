import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

interface ResetDataModalProps {
  open: boolean
  onClose: () => void
}

export function ResetDataModal({ open, onClose }: ResetDataModalProps) {
  const { session } = useAuth()
  const [resetSupabase, setResetSupabase] = useState(false)
  const [resetBrevo, setResetBrevo] = useState(false)
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSubmit = (resetSupabase || resetBrevo) && confirm === 'RESET' && pin.length >= 1 && !loading

  const handleReset = async () => {
    if (!canSubmit || !session) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    const messages: string[] = []

    try {
      if (resetSupabase) {
        const { error: rpcErr } = await supabase.rpc('admin_reset_data', {
          pin,
          target: 'supabase',
        }) as { data: unknown; error: { message: string } | null }
        if (rpcErr) throw new Error(rpcErr.message)
        messages.push('Supabase data cleared')
      }

      if (resetBrevo) {
        const { error: fnErr } = await supabase.functions.invoke('reset-brevo', {
          body: { pin },
        })
        if (fnErr) throw new Error(
          fnErr.message.includes('Failed to send') || fnErr.message.includes('not found')
            ? 'Brevo Edge Function not deployed yet — see setup instructions below.'
            : fnErr.message
        )
        messages.push('Brevo contacts deleted')
      }

      setSuccess(messages.join(' · '))
      setPin('')
      setConfirm('')
      setResetSupabase(false)
      setResetBrevo(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setPin('')
    setConfirm('')
    setResetSupabase(false)
    setResetBrevo(false)
    setError(null)
    setSuccess(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-rose-600 px-6 py-4">
          <h2 className="font-heading font-semibold text-lg text-white">Reset dashboard data</h2>
          <p className="font-body text-sm text-white/80 mt-0.5">This cannot be undone. Select what to delete.</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <p className="font-heading font-semibold text-xs text-charcoal/50 uppercase tracking-wide">Delete from</p>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-surface-2 cursor-pointer hover:bg-surface/40 transition-colors">
              <input
                type="checkbox"
                checked={resetSupabase}
                onChange={e => setResetSupabase(e.target.checked)}
                className="mt-0.5 accent-rose-600"
              />
              <div>
                <p className="font-body text-sm font-medium text-charcoal">Supabase</p>
                <p className="font-body text-xs text-charcoal/50">All conversations and events rows</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-surface-2 cursor-pointer hover:bg-surface/40 transition-colors">
              <input
                type="checkbox"
                checked={resetBrevo}
                onChange={e => setResetBrevo(e.target.checked)}
                className="mt-0.5 accent-rose-600"
              />
              <div>
                <p className="font-body text-sm font-medium text-charcoal">Brevo</p>
                <p className="font-body text-xs text-charcoal/50">All contacts in your Brevo account</p>
              </div>
            </label>
          </div>

          <div>
            <label className="block font-heading font-semibold text-xs text-charcoal/50 uppercase tracking-wide mb-1.5">
              Admin PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN"
              autoComplete="off"
              className="w-full border border-surface-2 rounded-xl px-3 py-2.5 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-heading font-semibold text-xs text-charcoal/50 uppercase tracking-wide mb-1.5">
              Type <span className="text-rose-600">RESET</span> to confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="RESET"
              autoComplete="off"
              className="w-full border border-surface-2 rounded-xl px-3 py-2.5 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <p className="font-body text-xs text-rose-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="font-body text-xs text-green-700">✓ {success}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-surface-2 font-body text-sm text-charcoal hover:bg-surface/50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={!canSubmit}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-body text-sm font-medium hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting…' : 'Delete selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
