import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

type BrandProps = {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  const { t } = useLanguage()

  return (
    <Link className="brand" to="/" aria-label={t('nav.goHome')}>
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      {!compact && <span className="brand-name">duet</span>}
    </Link>
  )
}
