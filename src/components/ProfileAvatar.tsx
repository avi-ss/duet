import type { CSSProperties } from 'react'
import { getInitials } from '../lib/format'
import type { CoupleMember, ProfileColor } from '../types/database'
import { useLanguage } from '../contexts/LanguageContext'

type ProfileAvatarProps = {
  className?: string
  member?: CoupleMember | null
  name?: string
  size?: number
  url?: string
}

export function ProfileAvatar({
  className = '',
  member,
  name,
  size = 36,
  url,
}: ProfileAvatarProps) {
  const { language } = useLanguage()
  const displayName = member?.display_name ?? name ?? 'Duet'
  const color: ProfileColor = member?.profile_color ?? 'coral'
  const style = { '--avatar-size': `${size}px` } as CSSProperties

  return (
    <span
      className={`profile-avatar ${className}`}
      data-member-color={color}
      style={style}
      title={displayName}
    >
      {url ? <img alt={language === 'es' ? `Foto de ${displayName}` : `Photo of ${displayName}`} src={url} /> : getInitials(displayName)}
    </span>
  )
}
