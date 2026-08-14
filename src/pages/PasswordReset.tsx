import { type FormEvent, useState } from 'react'
import { CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react'
import { Brand } from '../components/Brand'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function PasswordReset() {
  const { completePasswordRecovery } = useAuth()
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
      setError('Las contraseñas no coinciden.')
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
            <p className="eyebrow">Todo listo</p>
            <h1>Contraseña actualizada</h1>
            <p>Ya puedes seguir usando Duet con tu nueva contraseña.</p>
            <button className="button button-primary" onClick={completePasswordRecovery} type="button">
              Entrar en Duet
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">Recuperar acceso</p>
            <h1>Elige una contraseña nueva</h1>
            <p>Utiliza al menos ocho caracteres y no reutilices otra contraseña.</p>
            <form onSubmit={handleSubmit}>
              <label>
                <span>Nueva contraseña</span>
                <input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
              </label>
              <label>
                <span>Repite la contraseña</span>
                <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="button button-primary" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="spin" size={17} />}
                Guardar contraseña
              </button>
              <button className="auth-switch" onClick={returnToLogin} type="button">
                Volver al inicio de sesión
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
