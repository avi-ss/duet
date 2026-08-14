import {
  Heart,
  Home,
  Link2,
  LogOut,
  Settings,
  StickyNote,
  WandSparkles,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { getInitials } from '../lib/format'
import { Brand } from './Brand'

const navigation = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/deseos', label: 'Deseos', icon: WandSparkles },
  { to: '/notas', label: 'Notas', icon: StickyNote },
  { to: '/enlaces', label: 'Enlaces', icon: Link2 },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const { couple } = useCouple()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />

        <div className="couple-badge">
          <span><Heart size={14} fill="currentColor" /></span>
          <div>
            <small>Vuestro espacio</small>
            <strong>{couple?.name}</strong>
          </div>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink end={end} key={to} to={to}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink className="settings-link" to="/ajustes">
            <Settings size={18} /> Ajustes
          </NavLink>
          <div className="user-chip">
            <span className="avatar">{getInitials(user?.email)}</span>
            <div>
              <strong>{user?.email?.split('@')[0]}</strong>
              <small>{user?.email}</small>
            </div>
            <button
              aria-label="Cerrar sesión"
              className="icon-button small"
              onClick={() => void signOut()}
              type="button"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-header">
          <Brand />
          <NavLink aria-label="Ajustes" className="icon-button" to="/ajustes">
            <Settings size={20} />
          </NavLink>
        </div>
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Navegación móvil">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink end={end} key={to} to={to}>
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
