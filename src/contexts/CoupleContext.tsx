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
  avatarUrls: Record<string, string>
  couple: Couple | null
  members: CoupleMember[]
  membership: CoupleMember | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const CoupleContext = createContext<CoupleContextValue | undefined>(undefined)

export function CoupleProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({})
  const [couple, setCouple] = useState<Couple | null>(null)
  const [members, setMembers] = useState<CoupleMember[]>([])
  const [membership, setMembership] = useState<CoupleMember | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase || !user) {
      setCouple(null)
      setMembers([])
      setMembership(null)
      setAvatarUrls({})
      setIsLoading(false)
      return
    }

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
      setMembers([])
      setAvatarUrls({})
      setIsLoading(false)
      return
    }

    const [coupleResult, membersResult] = await Promise.all([
      supabase.from('couples').select('*').eq('id', member.couple_id).single(),
      supabase
        .from('couple_members')
        .select('*')
        .eq('couple_id', member.couple_id)
        .order('joined_at', { ascending: true }),
    ])

    const memberList = membersResult.data ?? []
    const signedAvatarEntries = await Promise.all(
      memberList.map(async (currentMember) => {
        if (!currentMember.avatar_path || !supabase) return null
        const { data } = await supabase.storage
          .from('avatars')
          .createSignedUrl(currentMember.avatar_path, 60 * 60 * 24)
        return data?.signedUrl
          ? ([currentMember.user_id, data.signedUrl] as const)
          : null
      }),
    )

    setCouple(coupleResult.data)
    setMembers(memberList)
    setAvatarUrls(
      Object.fromEntries(
        signedAvatarEntries.filter(
          (entry): entry is readonly [string, string] => entry !== null,
        ),
      ),
    )
    setError(coupleResult.error?.message ?? membersResult.error?.message ?? null)
    setIsLoading(false)
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const coupleId = membership?.couple_id
    if (!supabase || !coupleId) return

    const client = supabase
    const channel = client
      .channel(`members:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couple_members',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => void refresh(),
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [membership?.couple_id, refresh])

  const value = useMemo(
    () => ({ avatarUrls, couple, members, membership, isLoading, error, refresh }),
    [avatarUrls, couple, members, membership, isLoading, error, refresh],
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
