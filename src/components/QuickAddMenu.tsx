import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  Link2,
  Plus,
  StickyNote,
  WandSparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const options = [
  {
    to: '/deseos?crear=1',
    label: 'Un deseo',
    description: 'Algo que os haga ilusión',
    icon: WandSparkles,
    className: 'wish',
  },
  {
    to: '/notas?crear=1',
    label: 'Una nota',
    description: 'Una idea o recordatorio',
    icon: StickyNote,
    className: 'note',
  },
  {
    to: '/enlaces?crear=1',
    label: 'Un enlace',
    description: 'Un sitio que guardar',
    icon: Link2,
    className: 'link',
  },
]

export function QuickAddMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className={`quick-add ${open ? 'open' : ''}`} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="button button-primary quick-add-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Plus size={19} />
        <span>Añadir algo</span>
        <ChevronDown className="quick-add-chevron" size={15} />
      </button>

      {open && (
        <div aria-label="Qué quieres añadir" className="quick-add-menu" role="menu">
          <p>¿Qué queréis guardar?</p>
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
      )}
    </div>
  )
}
