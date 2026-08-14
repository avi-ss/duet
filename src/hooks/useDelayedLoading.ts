import { useEffect, useState } from 'react'

export function useDelayedLoading(isLoading: boolean, delay = 180) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setIsVisible(false)
      return
    }

    const timeout = window.setTimeout(() => setIsVisible(true), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, isLoading])

  return isVisible
}
