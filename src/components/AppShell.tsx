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
import { useLanguage } from '../contexts/LanguageContext'
import { Brand } from './Brand'
import { ProfileAvatar } from './ProfileAvatar'
import { QuickAddMenu } from './QuickAddMenu'

export function AppShell() {
  const { user, signOut } = useAuth()
  const { avatarUrls, couple, membership } = useCouple()
  const { t } = useLanguage()
  const navigation = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/wishlist', label: t('nav.wishlist'), icon: WandSparkles },
    { to: '/notes', label: t('nav.notes'), icon: StickyNote },
    { to: '/links', label: t('nav.links'), icon: Link2 },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />

        <div className="couple-badge">
          <span><Heart size={14} fill="currentColor" /></span>
          <div>
          <small>{t('space.label')}</small>
            <strong>{couple?.name}</strong>
          </div>
        </div>

        <nav className="main-nav" aria-label={t('nav.mainLabel')}>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink end={end} key={to} to={to}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink className="settings-link" to="/settings">
            <Settings size={18} /> {t('nav.settings')}
          </NavLink>
          <div className="user-chip">
            <ProfileAvatar
              member={membership}
              name={user?.email}
              size={34}
              url={membership ? avatarUrls[membership.user_id] : undefined}
            />
            <div>
              <strong>{membership?.display_name ?? user?.email?.split('@')[0]}</strong>
              <small>{user?.email}</small>
            </div>
            <button
              aria-label={t('nav.signOut')}
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
          <NavLink aria-label={t('nav.settings')} className="icon-button" to="/settings">
            <Settings size={20} />
          </NavLink>
        </div>
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label={t('nav.mobileLabel')}>
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink end={end} key={to} to={to}>
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
        <QuickAddMenu />
      </nav>
    </div>
  )
}
