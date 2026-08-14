import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingScreen } from './components/LoadingScreen'
import { useAuth } from './contexts/AuthContext'
import { CoupleProvider, useCouple } from './contexts/CoupleContext'
import { useLanguage } from './contexts/LanguageContext'
import { Collection } from './pages/Collection'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { PasswordReset } from './pages/PasswordReset'
import { Settings } from './pages/Settings'

function CoupleGate() {
  const { couple, isLoading, error } = useCouple()
  const { t } = useLanguage()

  if (isLoading) return <LoadingScreen />
  if (error) {
    return (
      <main className="fatal-error">
        <p className="eyebrow">{t('error.noAccess')}</p>
        <h1>{t('error.genericTitle')}</h1>
        <p>{error}</p>
        <button className="button button-primary" onClick={() => window.location.reload()} type="button">{t('common.retry')}</button>
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
  const { isPasswordRecovery } = useAuth()

  if (isPasswordRecovery) return <PasswordReset />

  return (
    <Routes>
      <Route element={<Login />} path="/login" />
      <Route element={<ProtectedApp />} path="/">
        <Route index element={<Dashboard />} />
        <Route element={<Collection type="wishlist" />} path="wishlist" />
        <Route element={<Collection type="note" />} path="notes" />
        <Route element={<Collection type="link" />} path="links" />
        <Route element={<Settings />} path="settings" />
      </Route>
      <Route element={<Navigate replace to="/wishlist" />} path="/deseos" />
      <Route element={<Navigate replace to="/notes" />} path="/notas" />
      <Route element={<Navigate replace to="/links" />} path="/enlaces" />
      <Route element={<Navigate replace to="/settings" />} path="/ajustes" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
