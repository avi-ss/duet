import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type {
  Item,
  ItemInsert,
  ItemType,
  ItemUpdate,
} from '../types/database'
import { useCouple } from '../contexts/CoupleContext'
import { useLanguage } from '../contexts/LanguageContext'

export function useItems(type?: ItemType, limit?: number) {
  const { couple } = useCouple()
  const { t } = useLanguage()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  const fetchItems = useCallback(async () => {
    if (!supabase || !couple) return

    if (!hasLoaded.current) setIsLoading(true)
    let query = supabase
      .from('items')
      .select('*')
      .eq('couple_id', couple.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (type) query = query.eq('type', type)
    if (limit) query = query.limit(limit)

    const { data, error: queryError } = await query
    setItems(data ?? [])
    setError(queryError?.message ?? null)
    hasLoaded.current = true
    setIsLoading(false)
  }, [couple, limit, type])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (!supabase || !couple) return

    const client = supabase
    const channel = client
      .channel(`items:${couple.id}:${type ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `couple_id=eq.${couple.id}`,
        },
        () => void fetchItems(),
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [couple, fetchItems, type])

  const createItem = async (
    values: Omit<ItemInsert, 'couple_id' | 'created_by'>,
  ) => {
    if (!supabase || !couple) throw new Error(t('error.noCouple'))

    try {
      const { error: createError } = await supabase.from('items').insert({
        ...values,
        couple_id: couple.id,
      })
      if (createError) throw createError
      await fetchItems()
    } catch (caughtError) {
      throw new Error(getErrorMessage(caughtError))
    }
  }

  const updateItem = async (id: string, values: ItemUpdate) => {
    if (!supabase) throw new Error(t('error.supabase'))

    try {
      const { error: updateError } = await supabase
        .from('items')
        .update(values)
        .eq('id', id)
      if (updateError) throw updateError
      await fetchItems()
    } catch (caughtError) {
      throw new Error(getErrorMessage(caughtError))
    }
  }

  const deleteItem = async (id: string) => {
    if (!supabase) throw new Error(t('error.supabase'))

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
      if (deleteError) throw deleteError
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (caughtError) {
      throw new Error(getErrorMessage(caughtError))
    }
  }

  return {
    items,
    isLoading,
    error,
    refresh: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
}
