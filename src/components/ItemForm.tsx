import { type FormEvent, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { getErrorMessage } from '../lib/errors'
import type { Item, ItemType } from '../types/database'

type ItemFormProps = {
  item?: Item
  type: ItemType
  submitLabel?: string
  onCancel: () => void
  onSubmit: (values: {
    type: ItemType
    title: string
    description: string | null
    url: string | null
  }) => Promise<void>
}

const placeholders: Record<ItemType, { title: string; description: string }> = {
  wishlist: {
    title: 'Esa cafetera tan bonita',
    description: 'Tamaño, color, para qué ocasión…',
  },
  note: {
    title: 'Algo que no queremos olvidar',
    description: 'Escribe aquí vuestra nota…',
  },
  link: {
    title: 'Un sitio para la próxima escapada',
    description: '¿Por qué merece la pena guardarlo?',
  },
}

export function ItemForm({
  item,
  type,
  submitLabel = 'Guardar',
  onCancel,
  onSubmit,
}: ItemFormProps) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        type,
        title: title.trim(),
        description: description.trim() || null,
        url: url.trim() || null,
      })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setIsSubmitting(false)
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <label>
        <span>Título</span>
        <input
          autoFocus
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={placeholders[type].title}
          required
          value={title}
        />
      </label>

      {(type === 'wishlist' || type === 'link') && (
        <label>
          <span>Enlace <small>opcional</small></span>
          <input
            inputMode="url"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            type="url"
            value={url}
          />
        </label>
      )}

      <label>
        <span>{type === 'note' ? 'Nota' : 'Detalles'} <small>opcional</small></span>
        <textarea
          maxLength={1000}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={placeholders[type].description}
          rows={5}
          value={description}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="button button-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="button button-primary" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="spin" size={17} />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
