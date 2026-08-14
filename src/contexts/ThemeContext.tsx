import {
  createContext,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'coral' | 'ocean' | 'forest' | 'plum' | 'amber'

type ThemeContextValue = {
  accent: AccentColor
  mode: ThemeMode
  setAccent: (accent: AccentColor) => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function isAccentColor(value: string | null): value is AccentColor {
  return ['coral', 'ocean', 'forest', 'plum', 'amber'].includes(value ?? '')
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('duet-theme')
    return isThemeMode(saved) ? saved : 'system'
  })
  const [accent, setAccent] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('duet-accent')
    return isAccentColor(saved) ? saved : 'coral'
  })

  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      document.documentElement.dataset.theme =
        mode === 'system' ? (media.matches ? 'dark' : 'light') : mode
    }

    applyTheme()
    localStorage.setItem('duet-theme', mode)
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [mode])

  useLayoutEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('duet-accent', accent)
  }, [accent])

  const value = useMemo(
    () => ({ accent, mode, setAccent, setMode }),
    [accent, mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// The provider and hook form one cohesive preference module.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return context
}
