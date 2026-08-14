import { useState } from 'react'

const storageKey = 'duet-mobile-compact-grid'

export function useGridPreference() {
  const [compact, setCompact] = useState(() => localStorage.getItem(storageKey) === 'true')

  const toggleCompact = () => {
    setCompact((current) => {
      const next = !current
      localStorage.setItem(storageKey, String(next))
      return next
    })
  }

  return { compact, toggleCompact }
}
