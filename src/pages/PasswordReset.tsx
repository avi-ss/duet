import { type FormEvent, useState } from 'react'
import { CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react'
import { Brand } from '../components/Brand'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function PasswordReset() {
  const { completePasswordRecovery } = useAuth()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const returnToLogin = () => {
    completePasswordRecovery()
    window.location.hash = '#/login'
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    if (password !== confirmation) {
      setError(t('settings.passwordMismatch'))
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="password-page">
      <Brand />
      <section className="password-card">
        <span className="setup-icon">
          {success ? <CheckCircle2 size={25} /> : <KeyRound size={25} />}
        </span>
        {success ? (
          <>
            <p className="eyebrow">{t('reset.ready')}</p>
            <h1>{t('reset.updatedTitle')}</h1>
            <p>{t('reset.updatedDescription')}</p>
            <button className="button button-primary" onClick={completePasswordRecovery} type="button">
              {t('reset.enter')}
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">{t('auth.recoverAccess')}</p>
            <h1>{t('reset.title')}</h1>
            <p>{t('reset.description')}</p>
            <form onSubmit={handleSubmit}>
              <label>
                <span>{t('settings.newPassword')}</span>
                <input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
              </label>
              <label>
                <span>{t('settings.repeatPassword')}</span>
                <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="button button-primary" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="spin" size={17} />}
                {t('reset.save')}
              </button>
              <button className="auth-switch" onClick={returnToLogin} type="button">
                {t('auth.backToLogin')}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
