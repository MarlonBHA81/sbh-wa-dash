import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/Spinner'

interface ProtectedRouteProps {
  requiredRole: 'team' | 'stakeholder'
  children: React.ReactNode
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  // Team role can access both views; stakeholder only their own
  const canAccess = role === 'team' || role === requiredRole
  if (!canAccess) return <Navigate to="/" replace />

  return <>{children}</>
}
