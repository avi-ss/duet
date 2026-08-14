import { useState } from 'react'
import {
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  StickyNote,
  Trash2,
  WandSparkles,
} from 'lucide-react'
import { getErrorMessage } from '../lib/errors'
import { formatDate, getSafeUrl } from '../lib/format'
import type { Item } from '../types/database'

type ItemCardProps = {
  item: Item
  onEdit?: (item: Item) => void
  onDelete: (item: Item) => Promise<void>
}

const iconByType = {
  wishlist: WandSparkles,
  note: StickyNote,
  link: Link2,
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const Icon = iconByType[item.type]
  const safeUrl = getSafeUrl(item.url)

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar “${item.title}”?`)) return
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

  return (
    <article className={`item-card item-card-${item.type}`}>
      <div className="item-card-top">
        <span className="item-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div className="item-menu-wrap">
          <button
            aria-expanded={menuOpen}
            aria-label={`Opciones de ${item.title}`}
            className="icon-button small"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <div className="item-menu">
              {onEdit && (
                <button onClick={() => onEdit(item)} type="button">
                  <Pencil size={15} /> Editar
                </button>
              )}
              <button
                className="danger"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                type="button"
              >
                <Trash2 size={15} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="item-card-content">
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
      </div>
      <div className="item-card-footer">
        <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
        {safeUrl && (
          <a href={safeUrl} rel="noreferrer" target="_blank">
            Abrir <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  )
}
