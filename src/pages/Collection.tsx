import { useEffect, useState } from 'react'
import { Link2, Plus, StickyNote, WandSparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ItemCard } from '../components/ItemCard'
import { ItemForm } from '../components/ItemForm'
import { Modal } from '../components/Modal'
import { useItems } from '../hooks/useItems'
import type { Item, ItemType } from '../types/database'

const collectionConfig: Record<
  ItemType,
  {
    eyebrow: string
    title: string
    highlighted: string
    description: string
    singular: string
    emptyTitle: string
    emptyDescription: string
    icon: typeof WandSparkles
  }
> = {
  wishlist: {
    eyebrow: 'Para algún día',
    title: 'Nuestra lista de',
    highlighted: 'deseos',
    description: 'Pequeñas y grandes cosas que os hacen ilusión.',
    singular: 'deseo',
    emptyTitle: 'Aún no hay deseos por aquí',
    emptyDescription: 'Añadid algo que os apetezca comprar, vivir o regalar.',
    icon: WandSparkles,
  },
  note: {
    eyebrow: 'Entre nosotros',
    title: 'Nuestras',
    highlighted: 'notas',
    description: 'Ideas, recordatorios y palabras que queréis conservar.',
    singular: 'nota',
    emptyTitle: 'Una página por estrenar',
    emptyDescription: 'Escribid algo que queráis recordar los dos.',
    icon: StickyNote,
  },
  link: {
    eyebrow: 'Para volver después',
    title: 'Nuestros',
    highlighted: 'enlaces',
    description: 'Restaurantes, viajes, recetas y hallazgos compartidos.',
    singular: 'enlace',
    emptyTitle: 'Guardad vuestro primer hallazgo',
    emptyDescription: 'Ese sitio, receta o idea que no queréis perder.',
    icon: Link2,
  },
}

type CollectionProps = {
  type: ItemType
}

export function Collection({ type }: CollectionProps) {
  const config = collectionConfig[type]
  const Icon = config.icon
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const { items, isLoading, error, createItem, updateItem, deleteItem } = useItems(type)

  useEffect(() => {
    if (searchParams.get('crear') === '1') {
      setModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  return (
    <div className={`page collection-page collection-page-${type}`}>
      <header className="page-header collection-header">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title} <em>{config.highlighted}</em></h1>
          <p>{config.description}</p>
        </div>
        <button className="button button-primary" onClick={() => setModalOpen(true)} type="button">
          <Plus size={18} /> Añadir {config.singular}
        </button>
      </header>

      {error && <p className="inline-error">No se pudo cargar el contenido: {error}</p>}

      {isLoading ? (
        <div className="card-skeleton-grid">
          {[1, 2, 3, 4].map((number) => <div className="card-skeleton" key={number} />)}
        </div>
      ) : items.length > 0 ? (
        <div className={`collection-grid ${type === 'note' ? 'note-grid' : ''}`}>
          {items.map((item) => (
            <ItemCard
              item={item}
              key={item.id}
              onDelete={(current) => deleteItem(current.id)}
              onEdit={(current) => {
                setEditingItem(current)
                setModalOpen(true)
              }}
            />
          ))}
          <button className="add-card" onClick={() => setModalOpen(true)} type="button">
            <span><Plus size={22} /></span>
            Añadir {config.singular}
          </button>
        </div>
      ) : (
        <div className="collection-empty">
          <span><Icon size={30} strokeWidth={1.5} /></span>
          <h2>{config.emptyTitle}</h2>
          <p>{config.emptyDescription}</p>
          <button className="button button-primary" onClick={() => setModalOpen(true)} type="button">
            <Plus size={17} /> Añadir {config.singular}
          </button>
        </div>
      )}

      {modalOpen && (
        <Modal
          description={editingItem ? 'Cambia lo que necesites y vuelve a guardarlo.' : config.description}
          onClose={closeModal}
          title={editingItem ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
        >
          <ItemForm
            item={editingItem ?? undefined}
            onCancel={closeModal}
            onSubmit={async (values) => {
              if (editingItem) await updateItem(editingItem.id, values)
              else await createItem(values)
              closeModal()
            }}
            submitLabel={editingItem ? 'Guardar cambios' : `Guardar ${config.singular}`}
            type={type}
          />
        </Modal>
      )}
    </div>
  )
}
