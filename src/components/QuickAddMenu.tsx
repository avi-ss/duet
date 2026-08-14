import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  Link2,
  Plus,
  StickyNote,
  WandSparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export function QuickAddMenu() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const options = [
    { to: '/wishlist?create=1', label: t('quickAdd.wish'), description: t('quickAdd.wishDescription'), icon: WandSparkles, className: 'wish' },
    { to: '/notes?create=1', label: t('quickAdd.note'), description: t('quickAdd.noteDescription'), icon: StickyNote, className: 'note' },
    { to: '/links?create=1', label: t('quickAdd.link'), description: t('quickAdd.linkDescription'), icon: Link2, className: 'link' },
  ]

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.classList.add('quick-add-open')
    return () => document.body.classList.remove('quick-add-open')
  }, [open])

  return (
    <div className={`quick-add ${open ? 'open' : ''}`} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="button button-primary quick-add-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Plus className="quick-add-plus" size={19} />
        <span>{t('quickAdd.button')}</span>
        <ChevronDown className="quick-add-chevron" size={15} />
      </button>

      {open && (
        <>
          <button aria-label={t('common.close')} className="quick-add-backdrop" onClick={() => setOpen(false)} type="button" />
          <div aria-label={t('quickAdd.label')} className="quick-add-menu" role="menu">
            <p>{t('quickAdd.question')}</p>
            {options.map(({ to, label, description, icon: Icon, className }) => (
              <Link key={to} onClick={() => setOpen(false)} role="menuitem" to={to}>
                <span className={`quick-add-option-icon ${className}`}>
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
