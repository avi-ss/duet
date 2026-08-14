import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  Copy,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from 'lucide-react'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import {
  type AccentColor,
  type ThemeMode,
  useTheme,
} from '../contexts/ThemeContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { ProfileColor } from '../types/database'

const profileColors: Array<{ id: ProfileColor; label: string }> = [
  { id: 'coral', label: 'Coral' },
  { id: 'sage', label: 'Salvia' },
  { id: 'blue', label: 'Océano' },
  { id: 'plum', label: 'Ciruela' },
  { id: 'amber', label: 'Ámbar' },
  { id: 'rose', label: 'Rosa' },
]

const themeModes: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
]

const accentColors: Array<{ id: AccentColor; label: string }> = [
  { id: 'coral', label: 'Coral' },
  { id: 'ocean', label: 'Océano' },
  { id: 'forest', label: 'Bosque' },
  { id: 'plum', label: 'Ciruela' },
  { id: 'amber', label: 'Ámbar' },
]

export function Settings() {
  const { user, signOut } = useAuth()
  const { avatarUrls, couple, members, membership, refresh } = useCouple()
  const { accent, mode, setAccent, setMode } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [spaceName, setSpaceName] = useState(couple?.name ?? '')
  const [greetingName, setGreetingName] = useState(
    membership?.display_name ?? user?.email?.split('@')[0] ?? '',
  )
  const [profileColor, setProfileColor] = useState<ProfileColor>(
    membership?.profile_color ?? 'coral',
  )
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSavingSpace, setIsSavingSpace] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [spaceMessage, setSpaceMessage] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const otherMemberColor = members.find(
    (member) => member.user_id !== user?.id,
  )?.profile_color

  useEffect(() => {
    setSpaceName(couple?.name ?? '')
  }, [couple?.name])

  useEffect(() => {
    setGreetingName(
      membership?.display_name ?? user?.email?.split('@')[0] ?? '',
    )
    setProfileColor(membership?.profile_color ?? 'coral')
  }, [membership, user?.email])

  const saveSpaceName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !couple) return
    setIsSavingSpace(true)
    setSpaceMessage(null)
    try {
      const { error } = await supabase
        .from('couples')
        .update({ name: spaceName.trim() })
        .eq('id', couple.id)
      if (error) throw error
      await refresh()
      setSpaceMessage('Nombre actualizado.')
    } catch (error) {
      setSpaceMessage(getErrorMessage(error))
    } finally {
      setIsSavingSpace(false)
    }
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !user) return
    setIsSavingProfile(true)
    setProfileMessage(null)
    try {
      const { error } = await supabase
        .from('couple_members')
        .update({
          display_name: greetingName.trim(),
          profile_color: profileColor,
        })
        .eq('user_id', user.id)
      if (error) throw error
      await refresh()
      setProfileMessage('Perfil actualizado.')
    } catch (error) {
      setProfileMessage(getErrorMessage(error))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !supabase || !user) return
    setProfileMessage(null)

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfileMessage('Usa una imagen JPG, PNG o WebP.')
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage('La imagen no puede superar 2 MB.')
      event.target.value = ''
      return
    }

    setIsUploading(true)
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
    const avatarPath = `${user.id}/avatar-${Date.now()}.${extension}`
    const previousAvatarPath = membership?.avatar_path
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        })
      if (uploadError) throw uploadError

      const { error: profileError } = await supabase
        .from('couple_members')
        .update({ avatar_path: avatarPath })
        .eq('user_id', user.id)
      if (profileError) throw profileError
      if (previousAvatarPath) {
        await supabase.storage.from('avatars').remove([previousAvatarPath])
      }
      await refresh()
      setProfileMessage('Foto actualizada.')
    } catch (error) {
      setProfileMessage(getErrorMessage(error))
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const removeAvatar = async () => {
    if (!supabase || !user || !membership?.avatar_path) return
    setIsUploading(true)
    setProfileMessage(null)
    try {
      const { error: profileError } = await supabase
        .from('couple_members')
        .update({ avatar_path: null })
        .eq('user_id', user.id)
      if (profileError) throw profileError
      await supabase.storage.from('avatars').remove([membership.avatar_path])
      await refresh()
      setProfileMessage('Foto eliminada.')
    } catch (error) {
      setProfileMessage(getErrorMessage(error))
    } finally {
      setIsUploading(false)
    }
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    setPasswordMessage(null)
    if (newPassword !== passwordConfirmation) {
      setPasswordMessage('Las contraseñas no coinciden.')
      return
    }

    setIsSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setPasswordConfirmation('')
      setPasswordMessage('Contraseña actualizada correctamente.')
    } catch (error) {
      setPasswordMessage(getErrorMessage(error))
    } finally {
      setIsSavingPassword(false)
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
          <p>Personaliza tu perfil, la apariencia y la seguridad.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-card profile-settings-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>Tu perfil</h2><p>Así aparecerás en el contenido que crees.</p></div>
          </div>

          <div className="avatar-editor">
            <ProfileAvatar
              member={membership}
              name={user?.email}
              size={72}
              url={membership ? avatarUrls[membership.user_id] : undefined}
            />
            <div>
              <input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void uploadAvatar(event)} ref={fileInputRef} type="file" />
              <button className="button button-secondary" disabled={isUploading} onClick={() => fileInputRef.current?.click()} type="button">
                <Camera size={16} /> {isUploading ? 'Subiendo…' : 'Cambiar foto'}
              </button>
              {membership?.avatar_path && (
                <button aria-label="Eliminar foto" className="icon-button" disabled={isUploading} onClick={() => void removeAvatar()} type="button">
                  <Trash2 size={16} />
                </button>
              )}
              <small>JPG, PNG o WebP · máximo 2 MB</small>
            </div>
          </div>

          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              <span>Nombre</span>
              <input maxLength={50} onChange={(event) => setGreetingName(event.target.value)} required value={greetingName} />
            </label>
            <fieldset className="color-fieldset">
              <legend>Tu color</legend>
              <div className="profile-color-grid">
                {profileColors.map((color) => (
                  <button aria-label={color.label} aria-pressed={profileColor === color.id} className={profileColor === color.id ? 'active' : ''} data-member-color={color.id} disabled={otherMemberColor === color.id} key={color.id} onClick={() => setProfileColor(color.id)} title={otherMemberColor === color.id ? 'Este color ya lo usa tu pareja' : color.label} type="button">
                    <span /> {color.label}
                    {profileColor === color.id && <Check size={13} />}
                  </button>
                ))}
              </div>
            </fieldset>
            {profileMessage && <p className="settings-message">{profileMessage}</p>}
            <button className="button button-secondary" disabled={isSavingProfile}>
              <Save size={16} /> Guardar perfil
            </button>
          </form>
        </section>

        <section className="settings-card appearance-card">
          <div className="settings-card-heading">
            <span><Palette size={20} /></span>
            <div><h2>Apariencia</h2><p>Se guarda únicamente en este dispositivo.</p></div>
          </div>
          <fieldset className="appearance-fieldset">
            <legend>Tema</legend>
            <div className="theme-options">
              {themeModes.map(({ id, label, icon: Icon }) => (
                <button aria-pressed={mode === id} className={mode === id ? 'active' : ''} key={id} onClick={() => setMode(id)} type="button">
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="appearance-fieldset">
            <legend>Color de acento</legend>
            <div className="accent-options">
              {accentColors.map((color) => (
                <button aria-label={color.label} aria-pressed={accent === color.id} className={accent === color.id ? 'active' : ''} data-accent-preview={color.id} key={color.id} onClick={() => setAccent(color.id)} title={color.label} type="button">
                  <span /> {accent === color.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>Espacio compartido</h2><p>El nombre que veréis al entrar.</p></div>
          </div>
          <form onSubmit={saveSpaceName}>
            <label>
              <span>Nombre</span>
              <input disabled={membership?.role !== 'owner'} maxLength={60} onChange={(event) => setSpaceName(event.target.value)} required value={spaceName} />
              {membership?.role !== 'owner' && <small>Solo quien creó el espacio puede cambiar este nombre.</small>}
            </label>
            {spaceMessage && <p className="settings-message">{spaceMessage}</p>}
            <button className="button button-secondary" disabled={isSavingSpace || membership?.role !== 'owner'}><Save size={16} /> Guardar cambios</button>
          </form>
        </section>

        <section className="settings-card invite-card">
          <div className="settings-card-heading">
            <span><ShieldCheck size={20} /></span>
            <div><h2>Invita a tu pareja</h2><p>Comparte este código una sola vez.</p></div>
          </div>
          <div className="invite-code">
            <strong>{couple?.invite_code}</strong>
            <button aria-label="Copiar código" className="icon-button" onClick={() => void copyCode()} type="button">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
          </div>
          <p className="muted-copy">Quien use el código podrá ver y editar el contenido compartido.</p>
        </section>

        <section className="settings-card password-settings-card">
          <div className="settings-card-heading">
            <span><KeyRound size={20} /></span>
            <div><h2>Cambiar contraseña</h2><p>No envía emails y se aplica inmediatamente.</p></div>
          </div>
          <form onSubmit={changePassword}>
            <label><span>Nueva contraseña</span><input autoComplete="new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} /></label>
            <label><span>Repite la contraseña</span><input autoComplete="new-password" minLength={8} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} /></label>
            {passwordMessage && <p className="settings-message">{passwordMessage}</p>}
            <button className="button button-secondary" disabled={isSavingPassword}><KeyRound size={16} /> Actualizar contraseña</button>
          </form>
        </section>

        <section className="settings-card account-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>Sesión</h2><p>{user?.email}</p></div>
          </div>
          <div className="account-meta"><span>Rol</span><strong>{membership?.role === 'owner' ? 'Creador/a' : 'Miembro'}</strong></div>
          <button className="button button-ghost danger-text" onClick={() => void signOut()} type="button"><LogOut size={16} /> Cerrar sesión</button>
        </section>
      </div>
    </div>
  )
}
