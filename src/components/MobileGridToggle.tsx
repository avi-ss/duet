import { Grid2X2, Rows2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

type MobileGridToggleProps = {
  compact: boolean
  onToggle: () => void
}

export function MobileGridToggle({ compact, onToggle }: MobileGridToggleProps) {
  const { t } = useLanguage()
  const label = compact ? t('view.comfortable') : t('view.compact')

  return (
    <button
      aria-label={label}
      aria-pressed={compact}
      className="mobile-grid-toggle icon-button"
      onClick={onToggle}
      title={label}
      type="button"
    >
      {compact ? <Rows2 size={18} /> : <Grid2X2 size={18} />}
    </button>
  )
}
