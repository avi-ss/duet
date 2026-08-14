import { ArrowRight, Link2, Plus, StickyNote, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ItemCard } from '../components/ItemCard'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'
import { useItems } from '../hooks/useItems'
import { getGreeting } from '../lib/format'
import type { ItemType } from '../types/database'

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
  const { couple } = useCouple()
  const { items, isLoading, error, deleteItem } = useItems()
  const firstName = user?.user_metadata?.name ?? user?.email?.split('@')[0]

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">{couple?.name}</p>
          <h1>{getGreeting()}{firstName ? `, ${firstName}` : ''} <span>✦</span></h1>
          <p>Aquí tenéis todo lo que estáis construyendo juntos.</p>
        </div>
        <Link className="button button-primary desktop-quick-add" to="/deseos?crear=1">
          <Plus size={18} /> Añadir algo
        </Link>
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

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Últimos detalles</p>
            <h2>Lo más reciente</h2>
          </div>
        </div>

        {error && <p className="inline-error">No se pudo cargar el contenido: {error}</p>}

        {isLoading ? (
          <div className="card-skeleton-grid" aria-label="Cargando contenido">
            {[1, 2, 3].map((number) => <div className="card-skeleton" key={number} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="recent-grid">
            {items.slice(0, 6).map((item) => (
              <ItemCard
                item={item}
                key={item.id}
                onDelete={(current) => deleteItem(current.id)}
              />
            ))}
          </div>
        ) : (
          <div className="welcome-empty">
            <div className="empty-sparkles" aria-hidden="true">✦</div>
            <h3>Vuestro espacio empieza aquí</h3>
            <p>Guardad ese primer deseo, una nota bonita o el enlace de vuestro próximo plan.</p>
            <Link className="button button-primary" to="/deseos?crear=1"><Plus size={17} /> Añadir lo primero</Link>
          </div>
        )}
      </section>
    </div>
  )
}
