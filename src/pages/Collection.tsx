import { useEffect, useState } from 'react'
import { Link2, Plus, StickyNote, WandSparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ItemCard } from '../components/ItemCard'
import { ItemForm } from '../components/ItemForm'
import { ItemPreview, ItemPreviewAction, ItemPreviewTitle } from '../components/ItemPreview'
import { MobileGridToggle } from '../components/MobileGridToggle'
import { Modal } from '../components/Modal'
import { useLanguage } from '../contexts/LanguageContext'
import { useDelayedLoading } from '../hooks/useDelayedLoading'
import { useItems } from '../hooks/useItems'
import { useGridPreference } from '../hooks/useGridPreference'
import type { Item, ItemType } from '../types/database'

type CollectionProps = {
  type: ItemType
}

export function Collection({ type }: CollectionProps) {
  const { t } = useLanguage()
  const icons: Record<ItemType, typeof WandSparkles> = { wishlist: WandSparkles, note: StickyNote, link: Link2 }
  const config = {
    eyebrow: t(`collection.${type}.eyebrow`),
    title: t(`collection.${type}.title`),
    highlighted: t(`collection.${type}.highlighted`),
    description: t(`collection.${type}.description`),
    singular: t(`collection.${type}.singular`),
    emptyTitle: t(`collection.${type}.emptyTitle`),
    emptyDescription: t(`collection.${type}.emptyDescription`),
    icon: icons[type],
  }
  const Icon = config.icon
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [previewItem, setPreviewItem] = useState<Item | null>(null)
  const { compact, toggleCompact } = useGridPreference()
  const { items, isLoading, error, createItem, updateItem, deleteItem } = useItems(type)
  const showLoading = useDelayedLoading(isLoading)

  useEffect(() => {
    if (searchParams.get('create') === '1' || searchParams.get('crear') === '1') {
      setModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const previewId = searchParams.get('preview')
    if (!previewId || items.length === 0) return
    setPreviewItem(items.find((item) => item.id === previewId) ?? null)
  }, [items, searchParams])

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const closePreview = () => {
    setPreviewItem(null)
    if (!searchParams.has('preview')) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('preview')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className={`page collection-page collection-page-${type}`}>
      <header className="page-header collection-header">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title} <em>{config.highlighted}</em></h1>
          <p>{config.description}</p>
        </div>
        <div className="collection-actions">
          <MobileGridToggle compact={compact} onToggle={toggleCompact} />
          <button className="button button-primary" onClick={() => setModalOpen(true)} type="button">
            <Plus size={18} /> {t('collection.add', { item: config.singular })}
          </button>
        </div>
      </header>

      {error && <p className="inline-error">{t('collection.loadError', { error })}</p>}

      {showLoading ? (
        <div className={`card-skeleton-grid ${compact ? 'mobile-compact-grid' : ''}`}>
          {[1, 2, 3, 4].map((number) => <div className="card-skeleton" key={number} />)}
        </div>
      ) : isLoading ? null : items.length > 0 ? (
        <div className={`collection-grid ${type === 'note' ? 'note-grid' : ''} ${compact ? 'mobile-compact-grid' : ''}`}>
          {items.map((item) => (
            <ItemCard
              item={item}
              key={item.id}
              onDelete={(current) => deleteItem(current.id)}
              onEdit={(current) => {
                setEditingItem(current)
                setModalOpen(true)
              }}
              onPreview={setPreviewItem}
              onTogglePin={(current) =>
                updateItem(current.id, { is_pinned: !current.is_pinned })
              }
              previewHref={`#/${type === 'wishlist' ? 'wishlist' : `${type}s`}?preview=${item.id}`}
            />
          ))}
          <button className="add-card" onClick={() => setModalOpen(true)} type="button">
            <span><Plus size={22} /></span>
            {t('collection.add', { item: config.singular })}
          </button>
        </div>
      ) : (
        <div className="collection-empty">
          <span><Icon size={30} strokeWidth={1.5} /></span>
          <h2>{config.emptyTitle}</h2>
          <p>{config.emptyDescription}</p>
          <button className="button button-primary" onClick={() => setModalOpen(true)} type="button">
            <Plus size={17} /> {t('collection.add', { item: config.singular })}
          </button>
        </div>
      )}

      {modalOpen && (
        <Modal
          description={editingItem ? t('modal.editDescription') : config.description}
          onClose={closeModal}
          title={editingItem ? t('collection.edit', { item: config.singular }) : t('collection.new', { item: config.singular })}
        >
          <ItemForm
            item={editingItem ?? undefined}
            onCancel={closeModal}
            onSubmit={async (values) => {
              if (editingItem) await updateItem(editingItem.id, values)
              else await createItem(values)
              closeModal()
            }}
            submitLabel={editingItem ? t('common.saveChanges') : t('collection.save', { item: config.singular })}
            type={type}
          />
        </Modal>
      )}

      {previewItem && (
        <Modal
          eyebrow={t('item.previewEyebrow')}
          headerAction={<ItemPreviewAction item={previewItem} />}
          onClose={closePreview}
          title={<ItemPreviewTitle item={previewItem} />}
        >
          <ItemPreview item={previewItem} />
        </Modal>
      )}
    </div>
  )
}
