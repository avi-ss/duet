import { useState } from 'react'
import { ArrowRight, Link2, Pin, Plus, StickyNote, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ItemCard } from '../components/ItemCard'
import { ItemForm } from '../components/ItemForm'
import { Modal } from '../components/Modal'
import { QuickAddMenu } from '../components/QuickAddMenu'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useItems } from '../hooks/useItems'
import { getGreeting } from '../lib/format'
import type { Item, ItemType } from '../types/database'

const collectionInfo: Record<
  ItemType,
  { label: string; caption: string; path: string; icon: typeof WandSparkles }
> = {
  wishlist: {
    label: 'Deseos',
    caption: 'Cosas que os hacen ilusión',
    path: '/deseos',
    icon: WandSparkles,
  },
  note: {
    label: 'Notas',
    caption: 'Pensamientos para los dos',
    path: '/notas',
    icon: StickyNote,
  },
  link: {
    label: 'Enlaces',
    caption: 'Lugares e ideas guardadas',
    path: '/enlaces',
    icon: Link2,
  },
}

export function Dashboard() {
  const { user } = useAuth()
  const { couple, membership } = useCouple()
  const { items, isLoading, error, updateItem, deleteItem } = useItems()
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const firstName = membership?.display_name ?? user?.email?.split('@')[0]
  const pinnedItems = items.filter((item) => item.is_pinned).slice(0, 3)
  const recentItems = items.filter((item) => !item.is_pinned).slice(0, 6)

  const itemLabel: Record<ItemType, string> = {
    wishlist: 'deseo',
    note: 'nota',
    link: 'enlace',
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
          <h1>{getGreeting()}{firstName ? `, ${firstName}` : ''} <span>✦</span></h1>
          <p>Aquí tenéis todo lo que estáis construyendo juntos.</p>
        </div>
        <QuickAddMenu />
      </header>

      <section className="collection-overview" aria-label="Colecciones">
        {(Object.keys(collectionInfo) as ItemType[]).map((type) => {
          const info = collectionInfo[type]
          const Icon = info.icon
          const count = items.filter((item) => item.type === type).length

          return (
            <Link className={`overview-card overview-${type}`} key={type} to={info.path}>
              <span className="overview-icon"><Icon size={22} strokeWidth={1.7} /></span>
              <div>
                <strong>{info.label}</strong>
                <p>{info.caption}</p>
              </div>
              <span className="overview-count">{count}</span>
              <ArrowRight className="overview-arrow" size={18} />
            </Link>
          )
        })}
      </section>

      {error && <p className="inline-error">No se pudo cargar el contenido: {error}</p>}

      {!isLoading && pinnedItems.length > 0 && (
        <section className="pinned-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow pinned-eyebrow"><Pin size={12} fill="currentColor" /> A mano</p>
              <h2>Fijado para los dos</h2>
            </div>
          </div>
          <div className="pinned-grid">{pinnedItems.map(renderItem)}</div>
        </section>
      )}

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Últimos detalles</p>
            <h2>Lo más reciente</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="card-skeleton-grid" aria-label="Cargando contenido">
            {[1, 2, 3].map((number) => <div className="card-skeleton" key={number} />)}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="recent-grid">
            {recentItems.map(renderItem)}
          </div>
        ) : items.length === 0 ? (
          <div className="welcome-empty">
            <div className="empty-sparkles" aria-hidden="true">✦</div>
            <h3>Vuestro espacio empieza aquí</h3>
            <p>Guardad ese primer deseo, una nota bonita o el enlace de vuestro próximo plan.</p>
            <Link className="button button-primary" to="/deseos?crear=1"><Plus size={17} /> Añadir lo primero</Link>
          </div>
        ) : (
          <p className="all-pinned-copy">Todo lo que habéis guardado está fijado arriba.</p>
        )}
      </section>

      {editingItem && (
        <Modal
          description="Cambia lo que necesites y vuelve a guardarlo."
          onClose={() => setEditingItem(null)}
          title={`Editar ${itemLabel[editingItem.type]}`}
        >
          <ItemForm
            item={editingItem}
            onCancel={() => setEditingItem(null)}
            onSubmit={async (values) => {
              await updateItem(editingItem.id, values)
              setEditingItem(null)
            }}
            submitLabel="Guardar cambios"
            type={editingItem.type}
          />
        </Modal>
      )}
    </div>
  )
}
