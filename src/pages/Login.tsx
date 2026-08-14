import { type FormEvent, useState } from 'react'
import { Heart, LoaderCircle, LockKeyhole, Sparkles } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function Login() {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <LoadingScreen />
  if (user) return <Navigate replace to="/" />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    setIsSubmitting(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setIsSubmitting(false)
    }
  }

  const handleRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    setIsSubmitting(true)
    setError(null)
    try {
      const redirectTo = new URL(
        import.meta.env.BASE_URL,
        window.location.origin,
      ).toString()
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      )
      if (recoveryError) throw recoveryError
      setRecoverySent(true)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleRecovery = () => {
    setIsRecovering((current) => !current)
    setError(null)
    setRecoverySent(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="story-orb orb-one" />
        <div className="story-orb orb-two" />
        <Brand />

        <div className="story-copy">
          <span className="story-kicker"><Sparkles size={15} /> {t('auth.kicker')}</span>
          <h1>{t('auth.storyTitle')}<br /><em>{t('auth.storyHighlight')}</em></h1>
          <p>{t('auth.storyDescription')}</p>
        </div>

        <div className="story-cards" aria-hidden="true">
          <article className="floating-card card-note">
            <span>{t('auth.sampleNoteLabel')}</span>
            <p>{t('auth.sampleNote')}</p>
          </article>
          <article className="floating-card card-wish">
            <Heart fill="currentColor" size={18} />
            <div><span>{t('auth.sampleWishLabel')}</span><strong>{t('auth.sampleWish')}</strong></div>
          </article>
        </div>

        <p className="story-footer">{t('auth.footer')}</p>
      </section>

      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-auth-brand"><Brand /></div>
          <span className="auth-icon"><LockKeyhole size={22} /></span>
          <p className="eyebrow">{isRecovering ? t('auth.recoverAccess') : t('auth.welcome')}</p>
          <h2>{isRecovering ? t('auth.recoverTitle') : t('auth.enterTitle')}</h2>
          <p className="auth-subtitle">
            {isRecovering
              ? t('auth.recoverDescription')
              : t('auth.enterDescription')}
          </p>

          <form onSubmit={isRecovering ? handleRecovery : handleSubmit}>
            <label>
              <span>{t('auth.email')}</span>
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="vosotros@ejemplo.com" required type="email" value={email} />
            </label>

            {!isRecovering && (
              <label>
                <span>{t('auth.password')}</span>
                <input autoComplete="current-password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" required type="password" value={password} />
              </label>
            )}

            {error && <p className="form-error">{error}</p>}
            {recoverySent && <p className="form-success">{t('auth.recoverySent')}</p>}

            <button className="button button-primary auth-submit" disabled={isSubmitting || recoverySent}>
              {isSubmitting && <LoaderCircle className="spin" size={18} />}
              {isRecovering ? t('auth.sendLink') : t('auth.enter')}
            </button>
            <button className="auth-switch" onClick={toggleRecovery} type="button">
              {isRecovering ? t('auth.backToLogin') : t('auth.forgotPassword')}
            </button>
          </form>

          <p className="privacy-note"><LockKeyhole size={13} /> {t('auth.privacy')}</p>
        </div>
      </section>
    </main>
  )
}
