import { useEffect, useRef, useState } from 'react'
import {
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
import { getAdaptiveItemSize } from '../lib/itemLayout'
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
  const menuRef = useRef<HTMLDivElement>(null)
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
  const contentSize = getAdaptiveItemSize(item)
  const isBareLinkDescription = item.type === 'link' && /^https?:\/\/\S+$/i.test(item.description?.trim() ?? '')
  const visibleDescription = isBareLinkDescription ? null : item.description

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

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

  const itemActions = (
    <div className="item-card-actions">
      {item.is_pinned && (
        <span className="pin-marker" title={t('item.pinned')}>
          <Pin fill="currentColor" size={12} />
          <span className="sr-only">{t('item.pinned')}</span>
        </span>
      )}
      <div className="item-menu-wrap" ref={menuRef}>
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
  )

  if (item.type === 'link') {
    return (
      <article
        className={`item-card item-card-link ${item.is_pinned ? 'is-pinned' : ''} ${menuOpen ? 'is-menu-open' : ''}`}
        data-content-size={contentSize}
        data-member-color={creator?.profile_color ?? 'coral'}
      >
        <span aria-hidden="true" className="link-glyph">
          <Link2 size={17} strokeWidth={1.8} />
        </span>
        <div className="item-link-body">
          {safeUrl ? (
            <a className="item-link-title" href={safeUrl} rel="noreferrer" target="_blank">
              <span>{item.title}</span>
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : (
            <h3>{item.title}</h3>
          )}
          {visibleDescription && <p>{visibleDescription}</p>}
          <div className="item-card-footer">
            <span className="item-creator">
              <ProfileAvatar
                member={creator}
                name={creatorName}
                size={21}
                url={creator ? avatarUrls[creator.user_id] : undefined}
              />
              <span>{creatorName}</span>
            </span>
            <time dateTime={item.created_at}>{formatDate(item.created_at, locale)}</time>
          </div>
        </div>
        {itemActions}
      </article>
    )
  }

  return (
    <article
      className={`item-card item-card-${item.type} ${item.is_pinned ? 'is-pinned' : ''} ${menuOpen ? 'is-menu-open' : ''}`}
      data-content-size={contentSize}
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
      <div className="item-card-meta">
        <span className="item-card-kind">
          <Icon aria-hidden="true" size={14} strokeWidth={1.9} />
          {typeLabel}
        </span>
        {itemActions}
      </div>
      <h3>{item.title}</h3>
      {visibleDescription && (
        <div className="item-card-content">
          <p>{visibleDescription}</p>
        </div>
      )}
      {safeUrl && (
        <a className="item-card-open" href={safeUrl} rel="noreferrer" target="_blank">
          {t('item.open')} <ExternalLink size={13} />
        </a>
      )}
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
      </div>
    </article>
  )
}
