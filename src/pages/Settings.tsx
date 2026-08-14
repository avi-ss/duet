import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  Copy,
  KeyRound,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  UserMinus,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Modal } from '../components/Modal'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  type AccentColor,
  type ThemeMode,
  useTheme,
} from '../contexts/ThemeContext'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { CoupleMember, ProfileColor } from '../types/database'

const profileColors: ProfileColor[] = ['coral', 'sage', 'blue', 'plum', 'amber', 'rose']

const themeModes: Array<{ id: ThemeMode; icon: typeof Sun }> = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
]

const accentColors: AccentColor[] = ['coral', 'ocean', 'forest', 'plum', 'amber']

export function Settings() {
  const { user, signOut } = useAuth()
  const { avatarUrls, couple, members, membership, refresh } = useCouple()
  const { language, setLanguage, t } = useLanguage()
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
  const [memberMessage, setMemberMessage] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<CoupleMember | null>(null)
  const [isRemovingMember, setIsRemovingMember] = useState(false)
  const otherMemberColor = members.find(
    (member) => member.user_id !== user?.id,
  )?.profile_color
  const colorLabel = (color: ProfileColor | AccentColor) => t(`color.${color}`)
  const themeLabel = (themeMode: ThemeMode) => t(`settings.${themeMode}`)

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
      setSpaceMessage(t('settings.spaceUpdated'))
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
      setProfileMessage(t('settings.profileUpdated'))
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
      setProfileMessage(t('settings.invalidPhoto'))
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage(t('settings.photoTooLarge'))
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
      setProfileMessage(t('settings.photoUpdated'))
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
      setProfileMessage(t('settings.photoRemoved'))
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
      setPasswordMessage(t('settings.passwordMismatch'))
      return
    }

    setIsSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setPasswordConfirmation('')
      setPasswordMessage(t('settings.passwordUpdated'))
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

  const removeMember = async () => {
    if (!supabase || !memberToRemove) return
    setIsRemovingMember(true)
    setMemberMessage(null)
    try {
      const { error } = await supabase.rpc('remove_couple_member', {
        target_member_id: memberToRemove.user_id,
      })
      if (error) throw error
      setMemberToRemove(null)
      await refresh()
      setMemberMessage(t('settings.memberRemoved'))
    } catch (error) {
      setMemberMessage(getErrorMessage(error))
    } finally {
      setIsRemovingMember(false)
    }
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('settings.eyebrow')}</p>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-card profile-settings-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>{t('settings.profileTitle')}</h2><p>{t('settings.profileDescription')}</p></div>
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
                <Camera size={16} /> {isUploading ? t('settings.uploading') : t('settings.changePhoto')}
              </button>
              {membership?.avatar_path && (
                <button aria-label={t('settings.removePhoto')} className="icon-button" disabled={isUploading} onClick={() => void removeAvatar()} type="button">
                  <Trash2 size={16} />
                </button>
              )}
              <small>{t('settings.photoHelp')}</small>
            </div>
          </div>

          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              <span>{t('settings.name')}</span>
              <input maxLength={50} onChange={(event) => setGreetingName(event.target.value)} required value={greetingName} />
            </label>
            <fieldset className="color-fieldset">
              <legend>{t('settings.yourColor')}</legend>
              <div className="profile-color-grid">
                {profileColors.map((color) => (
                  <button aria-label={colorLabel(color)} aria-pressed={profileColor === color} className={profileColor === color ? 'active' : ''} data-member-color={color} disabled={otherMemberColor === color} key={color} onClick={() => setProfileColor(color)} title={otherMemberColor === color ? t('settings.colorInUse') : colorLabel(color)} type="button">
                    <span /> {colorLabel(color)}
                    {profileColor === color && <Check size={13} />}
                  </button>
                ))}
              </div>
            </fieldset>
            {profileMessage && <p className="settings-message">{profileMessage}</p>}
            <button className="button button-secondary" disabled={isSavingProfile}>
              <Save size={16} /> {t('settings.saveProfile')}
            </button>
          </form>
        </section>

        <section className="settings-card appearance-card">
          <div className="settings-card-heading">
            <span><Palette size={20} /></span>
            <div><h2>{t('settings.appearanceTitle')}</h2><p>{t('settings.appearanceDescription')}</p></div>
          </div>
          <fieldset className="appearance-fieldset">
            <legend>{t('settings.theme')}</legend>
            <div className="theme-options">
              {themeModes.map(({ id, icon: Icon }) => (
                <button aria-pressed={mode === id} className={mode === id ? 'active' : ''} key={id} onClick={() => setMode(id)} type="button">
                  <Icon size={17} /> {themeLabel(id)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="appearance-fieldset">
            <legend>{t('settings.accent')}</legend>
            <div className="accent-options">
              {accentColors.map((color) => (
                <button aria-label={colorLabel(color)} aria-pressed={accent === color} className={accent === color ? 'active' : ''} data-accent-preview={color} key={color} onClick={() => setAccent(color)} title={colorLabel(color)} type="button">
                  <span /> {accent === color && <Check size={13} />}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="appearance-fieldset">
            <legend><Languages size={15} /> {t('settings.language')}</legend>
            <p className="appearance-help">{t('settings.languageDescription')}</p>
            <div className="language-options">
              <button aria-pressed={language === 'es'} className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')} type="button">{t('settings.spanish')}</button>
              <button aria-pressed={language === 'en'} className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} type="button">{t('settings.english')}</button>
            </div>
          </fieldset>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>{t('settings.spaceTitle')}</h2><p>{t('settings.spaceDescription')}</p></div>
          </div>
          <form onSubmit={saveSpaceName}>
            <label>
              <span>{t('settings.name')}</span>
              <input disabled={membership?.role !== 'owner'} maxLength={60} onChange={(event) => setSpaceName(event.target.value)} required value={spaceName} />
              {membership?.role !== 'owner' && <small>{t('settings.ownerOnly')}</small>}
            </label>
            {spaceMessage && <p className="settings-message">{spaceMessage}</p>}
            <button className="button button-secondary" disabled={isSavingSpace || membership?.role !== 'owner'}><Save size={16} /> {t('common.saveChanges')}</button>
          </form>
        </section>

        <section className="settings-card invite-card">
          <div className="settings-card-heading">
            <span><ShieldCheck size={20} /></span>
            <div><h2>{t('settings.inviteTitle')}</h2><p>{t('settings.inviteDescription')}</p></div>
          </div>
          <div className="invite-code">
            <strong>{couple?.invite_code}</strong>
            <button aria-label={t('settings.copyCode')} className="icon-button" onClick={() => void copyCode()} type="button">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
          </div>
          <p className="muted-copy">{members.length >= 2 ? t('settings.spaceFull') : t('settings.inviteHelp')}</p>
        </section>

        <section className="settings-card members-card">
          <div className="settings-card-heading">
            <span><UsersRound size={20} /></span>
            <div><h2>{t('settings.membersTitle')}</h2><p>{t('settings.membersDescription', { count: members.length })}</p></div>
          </div>
          <div className="members-list">
            {members.map((member) => {
              const isCurrentUser = member.user_id === user?.id
              const memberName = member.display_name ?? (isCurrentUser ? user?.email?.split('@')[0] : t('settings.unnamedMember'))
              return (
                <div className="member-row" data-member-color={member.profile_color} key={member.user_id}>
                  <ProfileAvatar member={member} name={memberName} size={42} url={avatarUrls[member.user_id]} />
                  <div className="member-details">
                    <strong>{memberName}{isCurrentUser && <small>{t('settings.you')}</small>}</strong>
                    <span>{member.role === 'owner' ? t('settings.owner') : t('settings.member')}</span>
                  </div>
                  {membership?.role === 'owner' && !isCurrentUser && (
                    <button aria-label={t('settings.removeMember')} className="icon-button member-remove-button" onClick={() => setMemberToRemove(member)} title={t('settings.removeMember')} type="button">
                      <UserMinus size={17} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {memberMessage && <p className="settings-message">{memberMessage}</p>}
        </section>

        <section className="settings-card password-settings-card">
          <div className="settings-card-heading">
            <span><KeyRound size={20} /></span>
            <div><h2>{t('settings.passwordTitle')}</h2><p>{t('settings.passwordDescription')}</p></div>
          </div>
          <form onSubmit={changePassword}>
            <label><span>{t('settings.newPassword')}</span><input autoComplete="new-password" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} /></label>
            <label><span>{t('settings.repeatPassword')}</span><input autoComplete="new-password" minLength={8} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} /></label>
            {passwordMessage && <p className="settings-message">{passwordMessage}</p>}
            <button className="button button-secondary" disabled={isSavingPassword}><KeyRound size={16} /> {t('settings.updatePassword')}</button>
          </form>
        </section>

        <section className="settings-card account-card">
          <div className="settings-card-heading">
            <span><UserRound size={20} /></span>
            <div><h2>{t('settings.session')}</h2><p>{user?.email}</p></div>
          </div>
          <div className="account-meta"><span>{t('settings.role')}</span><strong>{membership?.role === 'owner' ? t('settings.owner') : t('settings.member')}</strong></div>
          <button className="button button-ghost danger-text" onClick={() => void signOut()} type="button"><LogOut size={16} /> {t('nav.signOut')}</button>
        </section>
      </div>

      {memberToRemove && (
        <Modal
          description={t('settings.removeMemberDescription', { name: memberToRemove.display_name ?? t('settings.unnamedMember') })}
          eyebrow={t('settings.manageMembers')}
          onClose={() => !isRemovingMember && setMemberToRemove(null)}
          title={t('settings.removeMemberTitle')}
        >
          <div className="modal-actions">
            <button className="button button-ghost" disabled={isRemovingMember} onClick={() => setMemberToRemove(null)} type="button">{t('common.cancel')}</button>
            <button className="button button-danger" disabled={isRemovingMember} onClick={() => void removeMember()} type="button">
              <UserMinus size={16} /> {isRemovingMember ? t('settings.removingMember') : t('settings.confirmRemoveMember')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
