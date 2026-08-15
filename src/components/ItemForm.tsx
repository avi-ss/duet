import { type FormEvent, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
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

export function ItemForm({
  item,
  type,
  submitLabel,
  onCancel,
  onSubmit,
}: ItemFormProps) {
  const { t } = useLanguage()
  const placeholders = {
    wishlist: { title: t('item.placeholderWishTitle'), description: t('item.placeholderWishDescription') },
    note: { title: t('item.placeholderNoteTitle'), description: t('item.placeholderNoteDescription') },
    link: { title: t('item.placeholderLinkTitle'), description: t('item.placeholderLinkDescription') },
  }
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
        description: type === 'link' ? null : description.trim() || null,
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
        <span>{t('item.title')}</span>
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
          <span>
            {t('item.url')}
            {type === 'wishlist' && <> <small>{t('common.optional')}</small></>}
          </span>
          <input
            inputMode="url"
            onChange={(event) => setUrl(event.target.value)}
            required={type === 'link'}
            placeholder="https://…"
            type="url"
            value={url}
          />
        </label>
      )}

      {type !== 'link' && (
        <label>
          <span>{type === 'note' ? t('item.note') : t('item.details')} <small>{t('common.optional')}</small></span>
          <textarea
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={placeholders[type].description}
            rows={5}
            value={description}
          />
        </label>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="button button-ghost" onClick={onCancel} type="button">
          {t('common.cancel')}
        </button>
        <button className="button button-primary" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="spin" size={17} />}
          {submitLabel ?? t('common.save')}
        </button>
      </div>
    </form>
  )
}
