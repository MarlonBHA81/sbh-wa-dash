import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { SBHLogo } from '../components/ui/SBHLogo'

export function LoginPage() {
  const { signIn, session, role, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && session) {
      navigate(role === 'stakeholder' ? '/stakeholder' : '/team', { replace: true })
    }
  }, [session, role, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const err = await signIn(email, password)
    if (err) {
      setError(err)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-surface-2 bg-white font-body text-sm text-charcoal ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <SBHLogo variant="color" className="h-12 w-auto" />
          <p className="font-body text-sm text-charcoal/40 mt-3">There when you need us.</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl p-8 border border-surface-2">
          <h1 className="font-heading font-semibold text-charcoal text-lg mb-6 text-center">
            Analytics Dashboard
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm text-charcoal/70 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-body text-sm text-charcoal/70 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 font-body" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" className="border-t-white" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
