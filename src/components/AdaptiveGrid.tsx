import { type PropsWithChildren, useLayoutEffect, useRef } from 'react'
import type { AdaptiveItemSize } from '../lib/itemLayout'
import type { ItemType } from '../types/database'

type AdaptiveGridItemProps = PropsWithChildren<{
  size?: AdaptiveItemSize
  type?: ItemType
}>

export function AdaptiveGridItem({ children, size = 'compact', type }: AdaptiveGridItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = itemRef.current
    if (!element) return

    const resizeItem = () => {
      const grid = element.parentElement
      if (!grid) return

      const gridStyles = window.getComputedStyle(grid)
      const rowHeight = Number.parseFloat(gridStyles.gridAutoRows)
      const rowGap = Number.parseFloat(gridStyles.rowGap) || 0

      if (gridStyles.display !== 'grid' || !Number.isFinite(rowHeight)) {
        element.style.removeProperty('grid-row-end')
        return
      }

      const itemHeight = element.getBoundingClientRect().height
      const rowSpan = Math.max(1, Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap)))
      element.style.gridRowEnd = `span ${rowSpan}`
    }

    resizeItem()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resizeItem)
      return () => window.removeEventListener('resize', resizeItem)
    }

    const observer = new ResizeObserver(resizeItem)
    observer.observe(element)
    window.addEventListener('resize', resizeItem)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resizeItem)
    }
  }, [])

  return (
    <div
      className={`adaptive-grid-item is-${size} ${type ? `is-${type}` : ''}`}
      data-content-size={size}
      ref={itemRef}
    >
      {children}
    </div>
  )
}
