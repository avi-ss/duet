import type { Item } from '../types/database'

export type AdaptiveItemSize = 'compact' | 'medium' | 'expanded'

export function getAdaptiveItemSize(item: Item): AdaptiveItemSize {
  if (item.type === 'link') return 'compact'

  const titleLength = item.title.trim().length
  const descriptionLength = item.description?.trim().length ?? 0
  const totalLength = titleLength + descriptionLength

  if (titleLength > 44 || descriptionLength > 220 || totalLength > 260) return 'expanded'
  if (descriptionLength > 72 || totalLength > 100) return 'medium'
  return 'compact'
}
