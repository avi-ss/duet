import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { useAuth } from './contexts/AuthContext'
import { CoupleProvider, useCouple } from './contexts/CoupleContext'
import { Collection } from './pages/Collection'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Settings } from './pages/Settings'

function CoupleGate() {
  const { couple, isLoading, error } = useCouple()

  if (isLoading) return <LoadingScreen />
  if (error) {
    return (
      <main className="fatal-error">
        <p className="eyebrow">No hemos podido entrar</p>
        <h1>Algo no ha ido bien</h1>
        <p>{error}</p>
        <button className="button button-primary" onClick={() => window.location.reload()} type="button">Volver a intentar</button>
      </main>
    )
  }
  if (!couple) return <Onboarding />
  return <AppShell />
}

function ProtectedApp() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate replace to="/login" />

  return (
    <CoupleProvider>
      <CoupleGate />
    </CoupleProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Login />} path="/login" />
      <Route element={<ProtectedApp />} path="/">
        <Route index element={<Dashboard />} />
        <Route element={<Collection type="wishlist" />} path="deseos" />
        <Route element={<Collection type="note" />} path="notas" />
        <Route element={<Collection type="link" />} path="enlaces" />
        <Route element={<Settings />} path="ajustes" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
