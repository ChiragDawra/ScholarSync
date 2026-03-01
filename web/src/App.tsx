import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Exams from './pages/Exams'
import Assignments from './pages/Assignments'
import Pomodoro from './pages/Pomodoro'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import GpaPredictor from './pages/GpaPredictor'
import AiCoach from './pages/AiCoach'
import Settings from './pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, needsOnboarding } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg-base)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--color-bg-raised)',
            borderTopColor: 'var(--color-brand)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>Loading...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />
  if (needsOnboarding) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, loading, needsOnboarding } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg-base)',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--color-bg-raised)',
            borderTopColor: 'var(--color-brand)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>Loading ScholarSync...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to={needsOnboarding ? '/onboarding' : '/dashboard'} replace /> : <Landing />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={needsOnboarding ? '/onboarding' : '/dashboard'} replace /> : <Login />}
      />
      <Route
        path="/onboarding"
        element={
          !isAuthenticated ? <Navigate to="/" replace /> :
            !needsOnboarding ? <Navigate to="/dashboard" replace /> :
              <Onboarding />
        }
      />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute><AppLayout><Exams /></AppLayout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><AppLayout><Assignments /></AppLayout></ProtectedRoute>} />
      <Route path="/pomodoro" element={<ProtectedRoute><AppLayout><Pomodoro /></AppLayout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      <Route path="/gpa" element={<ProtectedRoute><AppLayout><GpaPredictor /></AppLayout></ProtectedRoute>} />
      <Route path="/ai-coach" element={<ProtectedRoute><AppLayout><AiCoach /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--color-bg-raised)',
                color: 'var(--color-text-primary)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-lg)',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
