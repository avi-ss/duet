import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { isSupabaseConfigured } from './lib/supabase'
import { SetupRequired } from './pages/SetupRequired'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        {isSupabaseConfigured ? (
          <AuthProvider>
            <App />
          </AuthProvider>
        ) : (
          <SetupRequired />
        )}
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
)
