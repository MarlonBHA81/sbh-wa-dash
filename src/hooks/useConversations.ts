import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ConversationRow } from '../types/database'

export function useConversations(refreshKey = 0) {
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('conversations')
        .select('*')
        .order('started_at', { ascending: false })

      if (cancelled) return

      if (err) {
        setError(err.message)
      } else {
        setConversations((data ?? []) as ConversationRow[])
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { conversations, loading, error }
}
