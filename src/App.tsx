import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LoginPage } from './pages/Login'
import { TeamDashboard } from './pages/TeamDashboard'
import { StakeholderDashboard } from './pages/StakeholderDashboard'
import { Spinner } from './components/ui/Spinner'

function RoleRedirect() {
  const { session, role, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (role === 'stakeholder') return <Navigate to="/stakeholder" replace />
  return <Navigate to="/team" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/team"
        element={
          <ProtectedRoute requiredRole="team">
            <TeamDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stakeholder"
        element={
          <ProtectedRoute requiredRole="stakeholder">
            <StakeholderDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
