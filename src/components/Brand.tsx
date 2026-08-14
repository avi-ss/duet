import { Link } from 'react-router-dom'

type BrandProps = {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link className="brand" to="/" aria-label="Ir al inicio de Duet">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      {!compact && <span className="brand-name">duet</span>}
    </Link>
  )
}
