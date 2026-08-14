import { useLanguage } from '../contexts/LanguageContext'

export function LoadingScreen() {
  const { t } = useLanguage()

  return (
    <div className="loading-screen" role="status">
      <div className="loading-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
