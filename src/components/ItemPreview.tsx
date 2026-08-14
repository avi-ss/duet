import { ExternalLink, Link2, StickyNote, WandSparkles } from 'lucide-react'
import { useCouple } from '../contexts/CoupleContext'
import { useLanguage } from '../contexts/LanguageContext'
import { formatDate, getSafeUrl } from '../lib/format'
import type { Item } from '../types/database'
import { ProfileAvatar } from './ProfileAvatar'

type ItemPreviewProps = {
  item: Item
}

const iconByType = {
  wishlist: WandSparkles,
  note: StickyNote,
  link: Link2,
}

export function ItemPreview({ item }: ItemPreviewProps) {
  const { avatarUrls, members, membership } = useCouple()
  const { locale, t } = useLanguage()
  const creator = members.find((member) => member.user_id === item.created_by)
  const creatorName = creator?.user_id === membership?.user_id
    ? t('item.you')
    : creator?.display_name ?? t('item.partner')
  const safeUrl = getSafeUrl(item.url)
  const Icon = iconByType[item.type]

  return (
    <div className={`item-preview item-preview-${item.type}`} data-member-color={creator?.profile_color ?? 'coral'}>
      <div className="item-preview-kind">
        <span><Icon size={17} /></span>
        {t(`collection.${item.type}.singular`)}
      </div>
      {item.description && <p>{item.description}</p>}
      {safeUrl && (
        <a className="button button-secondary" href={safeUrl} rel="noreferrer" target="_blank">
          {t('item.open')} <ExternalLink size={15} />
        </a>
      )}
      <div className="item-preview-footer">
        <span className="item-creator">
          <ProfileAvatar member={creator} name={creatorName} size={28} url={creator ? avatarUrls[creator.user_id] : undefined} />
          <span>{creatorName}</span>
        </span>
        <time dateTime={item.created_at}>{formatDate(item.created_at, locale)}</time>
      </div>
    </div>
  )
}
