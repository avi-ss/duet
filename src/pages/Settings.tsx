import { type FormEvent, useState } from 'react'
import { Check, Copy, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'

export function Settings() {
  const { user, signOut } = useAuth()
  const { couple, membership, refresh } = useCouple()
  const [name, setName] = useState(couple?.name ?? '')
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const saveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !couple) return
    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('couples')
        .update({ name: name.trim() })
        .eq('id', couple.id)
      if (error) throw error
      await refresh()
      setMessage('Nombre actualizado.')
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const copyCode = async () => {
    if (!couple) return
    await navigator.clipboard.writeText(couple.invite_code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Vuestro Duet</p>
          <h1>Ajustes</h1>
          <p>La información del espacio y de tu cuenta.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>Espacio compartido</h2><p>El nombre que veréis al entrar.</p></div>
          </div>
          <form onSubmit={saveName}>
            <label>
              <span>Nombre</span>
              <input disabled={membership?.role !== 'owner'} maxLength={60} onChange={(event) => setName(event.target.value)} required value={name} />
              {membership?.role !== 'owner' && <small>Solo quien creó el espacio puede cambiar este nombre.</small>}
            </label>
            {message && <p className="settings-message">{message}</p>}
            <button className="button button-secondary" disabled={isSaving || membership?.role !== 'owner'}>
              <Save size={16} /> Guardar cambios
            </button>
          </form>
        </section>

        <section className="settings-card invite-card">
          <div className="settings-card-heading">
            <span><ShieldCheck size={20} /></span>
            <div><h2>Invita a tu pareja</h2><p>Comparte este código una sola vez.</p></div>
          </div>
          <div className="invite-code">
            <strong>{couple?.invite_code}</strong>
            <button aria-label="Copiar código" className="icon-button" onClick={() => void copyCode()} type="button">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="muted-copy">Quien use el código podrá ver y editar el contenido compartido.</p>
        </section>

        <section className="settings-card account-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>Tu cuenta</h2><p>{user?.email}</p></div>
          </div>
          <div className="account-meta">
            <span>Rol</span><strong>{membership?.role === 'owner' ? 'Creador/a' : 'Miembro'}</strong>
          </div>
          <button className="button button-ghost danger-text" onClick={() => void signOut()} type="button">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  )
}
