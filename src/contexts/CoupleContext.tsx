import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Couple, CoupleMember } from '../types/database'
import { useAuth } from './AuthContext'

type CoupleContextValue = {
  couple: Couple | null
  membership: CoupleMember | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const CoupleContext = createContext<CoupleContextValue | undefined>(undefined)

export function CoupleProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const [couple, setCouple] = useState<Couple | null>(null)
  const [membership, setMembership] = useState<CoupleMember | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase || !user) {
      setCouple(null)
      setMembership(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { data: member, error: memberError } = await supabase
      .from('couple_members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (memberError) {
      setError(memberError.message)
      setIsLoading(false)
      return
    }

    setMembership(member)

    if (!member) {
      setCouple(null)
      setIsLoading(false)
      return
    }

    const { data: coupleData, error: coupleError } = await supabase
      .from('couples')
      .select('*')
      .eq('id', member.couple_id)
      .single()

    setCouple(coupleData)
    setError(coupleError?.message ?? null)
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ couple, membership, isLoading, error, refresh }),
    [couple, membership, isLoading, error, refresh],
  )

  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  )
}

// The provider and its hook intentionally live together as one context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useCouple() {
  const context = useContext(CoupleContext)
  if (!context) {
    throw new Error('useCouple debe usarse dentro de CoupleProvider')
  }
  return context
}
