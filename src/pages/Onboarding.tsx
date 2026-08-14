import { type FormEvent, useState } from 'react'
import { ArrowRight, HeartHandshake, LoaderCircle, TicketCheck } from 'lucide-react'
import { Brand } from '../components/Brand'
import { useCouple } from '../contexts/CoupleContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

type Mode = 'create' | 'join'

export function Onboarding() {
  const { refresh } = useCouple()
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result =
        mode === 'create'
          ? await supabase.rpc('create_couple', { couple_name: name.trim() })
          : await supabase.rpc('join_couple', { code: code.trim().toUpperCase() })

      if (result.error) throw result.error
      await refresh()
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setIsSubmitting(false)
    }
  }

  return (
    <main className="onboarding-page">
      <Brand />
      <section className="onboarding-card">
        <div className="onboarding-icon"><HeartHandshake size={28} /></div>
        <p className="eyebrow">Empecemos</p>
        <h1>Cread vuestro espacio</h1>
        <p>Solo tenéis que hacerlo una vez. Después, todo lo que guardéis aparecerá para ambos.</p>

        <div className="segmented-control">
          <button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')} type="button">Crear espacio</button>
          <button className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')} type="button">Tengo un código</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'create' ? (
            <label>
              <span>Nombre de vuestro espacio</span>
              <input autoFocus maxLength={60} onChange={(event) => setName(event.target.value)} placeholder="Alba & Nico" required value={name} />
              <small>Podréis cambiarlo en ajustes.</small>
            </label>
          ) : (
            <label>
              <span>Código de invitación</span>
              <input autoFocus className="code-input" maxLength={10} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="DUET1234" required value={code} />
              <small>Pídeselo a la persona que creó el espacio.</small>
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="spin" size={18} /> : mode === 'create' ? <HeartHandshake size={18} /> : <TicketCheck size={18} />}
            {mode === 'create' ? 'Crear nuestro espacio' : 'Unirme al espacio'}
            {!isSubmitting && <ArrowRight size={17} />}
          </button>
        </form>
      </section>
    </main>
  )
}
