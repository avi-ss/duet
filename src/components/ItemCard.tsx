import { useState } from 'react'
import {
  Bookmark,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  StickyNote,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import { getErrorMessage } from '../lib/errors'
import { formatDate, getSafeUrl } from '../lib/format'
import type { Item } from '../types/database'
import { useCouple } from '../contexts/CoupleContext'
import { useLanguage } from '../contexts/LanguageContext'
import { ProfileAvatar } from './ProfileAvatar'

type ItemCardProps = {
  item: Item
  onEdit?: (item: Item) => void
  onPreview?: (item: Item) => void
  onTogglePin?: (item: Item) => Promise<void>
  onDelete: (item: Item) => Promise<void>
  previewHref?: string
}

const iconByType = {
  wishlist: WandSparkles,
  note: StickyNote,
  link: Link2,
}

export function ItemCard({ item, onEdit, onPreview, onTogglePin, onDelete, previewHref }: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const { avatarUrls, members, membership } = useCouple()
  const { locale, t } = useLanguage()
  const Icon = iconByType[item.type]
  const safeUrl = getSafeUrl(item.url)
  const creator = members.find((member) => member.user_id === item.created_by)
  const creatorName =
    creator?.user_id === membership?.user_id
      ? t('item.you')
      : creator?.display_name ?? t('item.partner')
  const typeLabel = t(`collection.${item.type}.singular`)

  const handleDelete = async () => {
    if (!window.confirm(t('item.deleteConfirm', { title: item.title }))) return
    setIsDeleting(true)
    try {
      await onDelete(item)
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
      setMenuOpen(false)
    }
  }

  const handleTogglePin = async () => {
    if (!onTogglePin) return
    setIsPinning(true)
    try {
      await onTogglePin(item)
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      setIsPinning(false)
      setMenuOpen(false)
    }
  }

  return (
    <article
      className={`item-card item-card-${item.type} ${item.is_pinned ? 'is-pinned' : ''} ${safeUrl ? 'has-external-link' : ''}`}
      data-member-color={creator?.profile_color ?? 'coral'}
    >
      {onPreview && previewHref && (
        <a
          aria-label={t('item.preview', { title: item.title })}
          className="item-card-hitarea"
          href={previewHref}
          onClick={(event) => {
            event.preventDefault()
            setMenuOpen(false)
            onPreview(item)
          }}
        />
      )}
      {item.is_pinned && (
        <span className="pin-marker" title={t('item.pinned')}>
          <Bookmark fill="currentColor" size={15} />
          <span className="sr-only">{t('item.pinned')}</span>
        </span>
      )}
      <div className="item-card-top">
        <div className="item-card-labels">
          <span aria-label={typeLabel} className="item-icon" role="img">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <h3>{item.title}</h3>
        </div>
        {safeUrl && (
          <a className="item-card-open" href={safeUrl} rel="noreferrer" target="_blank">
            {t('item.open')} <ExternalLink size={13} />
          </a>
        )}
      </div>
      <div className="item-card-content">
        {item.description && <p>{item.description}</p>}
      </div>
      <div className="item-card-footer">
        <span className="item-creator">
          <ProfileAvatar
            member={creator}
            name={creatorName}
            size={23}
            url={creator ? avatarUrls[creator.user_id] : undefined}
          />
          <span>{creatorName}</span>
        </span>
        <time dateTime={item.created_at}>{formatDate(item.created_at, locale)}</time>
        <div className="item-menu-wrap">
          <button
            aria-expanded={menuOpen}
            aria-label={t('item.options', { title: item.title })}
            className="icon-button small item-menu-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <div className="item-menu">
              {onTogglePin && (
                <button disabled={isPinning} onClick={() => void handleTogglePin()} type="button">
                  {item.is_pinned ? <PinOff size={15} /> : <Pin size={15} />}
                  {item.is_pinned ? t('item.unpin') : t('item.pin')}
                </button>
              )}
              {onEdit && (
                <button onClick={() => { setMenuOpen(false); onEdit(item) }} type="button">
                  <Pencil size={15} /> {t('item.edit')}
                </button>
              )}
              <button
                className="danger"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                type="button"
              >
                <Trash2 size={15} /> {t('item.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
