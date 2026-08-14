import { Database, ExternalLink, KeyRound, TerminalSquare } from 'lucide-react'
import { Brand } from '../components/Brand'
import { useLanguage } from '../contexts/LanguageContext'

export function SetupRequired() {
  const { t } = useLanguage()

  return (
    <main className="setup-page">
      <Brand />
      <section className="setup-card">
        <span className="setup-icon"><Database size={24} /></span>
        <p className="eyebrow">{t('setup.eyebrow')}</p>
        <h1>{t('setup.title')}</h1>
        <p>{t('setup.description')}</p>
        <ol className="setup-steps">
          <li>
            <span><Database size={18} /></span>
            <div><strong>{t('setup.projectTitle')}</strong><p>{t('setup.projectDescription')}</p></div>
          </li>
          <li>
            <span><KeyRound size={18} /></span>
            <div><strong>{t('setup.keysTitle')}</strong><p>{t('setup.keysDescription')}</p></div>
          </li>
          <li>
            <span><TerminalSquare size={18} /></span>
            <div><strong>{t('setup.startTitle')}</strong><p>{t('setup.startDescription')}</p></div>
          </li>
        </ol>
        <a className="button button-primary" href="https://supabase.com/dashboard" rel="noreferrer" target="_blank">
          {t('setup.open')} <ExternalLink size={16} />
        </a>
      </section>
    </main>
  )
}
