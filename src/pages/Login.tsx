import { type FormEvent, useState } from 'react'
import { Heart, LoaderCircle, LockKeyhole, Sparkles } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function Login() {
  const { user, isLoading } = useAuth()
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
          <span className="story-kicker"><Sparkles size={15} /> Solo para vosotros</span>
          <h1>Todo lo vuestro,<br /><em>en un mismo lugar.</em></h1>
          <p>Ideas, detalles, planes y pequeñas cosas que merece la pena guardar.</p>
        </div>

        <div className="story-cards" aria-hidden="true">
          <article className="floating-card card-note">
            <span>NOTA PARA LOS DOS</span>
            <p>Reservar nuestro sitio favorito para el viernes ✦</p>
          </article>
          <article className="floating-card card-wish">
            <Heart fill="currentColor" size={18} />
            <div><span>PRÓXIMA ESCAPADA</span><strong>Una casa frente al mar</strong></div>
          </article>
        </div>

        <p className="story-footer">Nuestro rincón, a nuestra manera.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-box">
          <div className="mobile-auth-brand"><Brand /></div>
          <span className="auth-icon"><LockKeyhole size={22} /></span>
          <p className="eyebrow">{isRecovering ? 'Recuperar acceso' : 'Bienvenidos de nuevo'}</p>
          <h2>{isRecovering ? 'Recupera tu contraseña' : 'Entrad en vuestro espacio'}</h2>
          <p className="auth-subtitle">
            {isRecovering
              ? 'Te enviaremos un enlace para elegir una contraseña nueva.'
              : 'Un lugar privado para todo lo que compartís.'}
          </p>

          <form onSubmit={isRecovering ? handleRecovery : handleSubmit}>
            <label>
              <span>Email</span>
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="vosotros@ejemplo.com" required type="email" value={email} />
            </label>

            {!isRecovering && (
              <label>
                <span>Contraseña</span>
                <input autoComplete="current-password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" required type="password" value={password} />
              </label>
            )}

            {error && <p className="form-error">{error}</p>}
            {recoverySent && <p className="form-success">Revisa tu correo. El enlace puede tardar unos minutos.</p>}

            <button className="button button-primary auth-submit" disabled={isSubmitting || recoverySent}>
              {isSubmitting && <LoaderCircle className="spin" size={18} />}
              {isRecovering ? 'Enviar enlace' : 'Entrar en Duet'}
            </button>
            <button className="auth-switch" onClick={toggleRecovery} type="button">
              {isRecovering ? 'Volver al inicio de sesión' : 'He olvidado mi contraseña'}
            </button>
          </form>

          <p className="privacy-note"><LockKeyhole size={13} /> Vuestros datos están protegidos y son privados.</p>
        </div>
      </section>
    </main>
  )
}
