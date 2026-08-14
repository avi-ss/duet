import { type PropsWithChildren, type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

type ModalProps = PropsWithChildren<{
  title: ReactNode
  description?: string
  eyebrow?: string
  headerAction?: ReactNode
  onClose: () => void
}>

export function Modal({ title, description, eyebrow, headerAction, onClose, children }: ModalProps) {
  const { t } = useLanguage()
  const [isClosing, setIsClosing] = useState(false)
  const requestClose = () => setIsClosing(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
    }
  })

  return createPortal(
    <div className={`modal-backdrop ${isClosing ? 'is-closing' : ''}`} onMouseDown={requestClose}>
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className="modal-card"
        onAnimationEnd={(event) => {
          if (isClosing && event.currentTarget === event.target) onClose()
        }}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{eyebrow ?? t('modal.eyebrow')}</p>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <div className="modal-header-actions">
            {headerAction}
            <button
              aria-label={t('common.close')}
              className="icon-button"
              onClick={requestClose}
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  )
}
