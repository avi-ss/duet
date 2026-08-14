import { useState } from 'react'
import { Pin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ItemCard } from '../components/ItemCard'
import { ItemForm } from '../components/ItemForm'
import { Modal } from '../components/Modal'
import { QuickAddMenu } from '../components/QuickAddMenu'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useDelayedLoading } from '../hooks/useDelayedLoading'
import { useItems } from '../hooks/useItems'
import { getGreeting } from '../lib/format'
import type { Item, ItemType } from '../types/database'

export function Dashboard() {
  const { user } = useAuth()
  const { couple, membership } = useCouple()
  const { language, t } = useLanguage()
  const { items, isLoading, error, updateItem, deleteItem } = useItems()
  const showLoading = useDelayedLoading(isLoading)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const firstName = membership?.display_name ?? user?.email?.split('@')[0]
  const pinnedItems = items.filter((item) => item.is_pinned).slice(0, 3)
  const recentItems = items.filter((item) => !item.is_pinned).slice(0, 6)

  const itemLabel: Record<ItemType, string> = {
    wishlist: t('collection.wishlist.singular'),
    note: t('collection.note.singular'),
    link: t('collection.link.singular'),
  }

  const renderItem = (item: Item) => (
    <ItemCard
      item={item}
      key={item.id}
      onDelete={(current) => deleteItem(current.id)}
      onEdit={setEditingItem}
      onTogglePin={(current) =>
        updateItem(current.id, { is_pinned: !current.is_pinned })
      }
    />
  )

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">{couple?.name}</p>
          <h1>{getGreeting(language)}{firstName ? `, ${firstName}` : ''} <span>✦</span></h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <QuickAddMenu />
      </header>

      {error && <p className="inline-error">{t('collection.loadError', { error })}</p>}

      {!isLoading && pinnedItems.length > 0 && (
        <section className="pinned-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow pinned-eyebrow"><Pin size={12} fill="currentColor" /> {t('dashboard.pinnedEyebrow')}</p>
              <h2>{t('dashboard.pinnedTitle')}</h2>
            </div>
          </div>
          <div className="pinned-grid">{pinnedItems.map(renderItem)}</div>
        </section>
      )}

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('dashboard.recentEyebrow')}</p>
            <h2>{t('dashboard.recentTitle')}</h2>
          </div>
        </div>

        {showLoading ? (
          <div className="card-skeleton-grid" aria-label={t('common.loading')}>
            {[1, 2, 3].map((number) => <div className="card-skeleton" key={number} />)}
          </div>
        ) : isLoading ? null : recentItems.length > 0 ? (
          <div className="recent-grid">
            {recentItems.map(renderItem)}
          </div>
        ) : items.length === 0 ? (
          <div className="welcome-empty">
            <div className="empty-sparkles" aria-hidden="true">✦</div>
            <h3>{t('dashboard.emptyTitle')}</h3>
            <p>{t('dashboard.emptyDescription')}</p>
            <Link className="button button-primary" to="/wishlist?create=1"><Plus size={17} /> {t('dashboard.addFirst')}</Link>
          </div>
        ) : (
          <p className="all-pinned-copy">{t('dashboard.allPinned')}</p>
        )}
      </section>

      {editingItem && (
        <Modal
          description={t('modal.editDescription')}
          onClose={() => setEditingItem(null)}
          title={t('collection.edit', { item: itemLabel[editingItem.type] })}
        >
          <ItemForm
            item={editingItem}
            onCancel={() => setEditingItem(null)}
            onSubmit={async (values) => {
              await updateItem(editingItem.id, values)
              setEditingItem(null)
            }}
            submitLabel={t('common.saveChanges')}
            type={editingItem.type}
          />
        </Modal>
      )}
    </div>
  )
}
