import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface PractitionerRow {
  practitioner: string
  total: number
  completed: number
  inProgress: number
  abandoned: number
}

export function usePractitionerData(refreshKey = 0) {
  const [data, setData] = useState<PractitionerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: rows } = await supabase
        .from('conversations')
        .select('practitioner, status')

      if (cancelled) return

      const typed = (rows ?? []) as Array<{ practitioner: string | null; status: string }>
      const map = new Map<string, PractitionerRow>()

      for (const r of typed) {
        const key = r.practitioner ?? 'Unassigned'
        if (!map.has(key)) map.set(key, { practitioner: key, total: 0, completed: 0, inProgress: 0, abandoned: 0 })
        const entry = map.get(key)!
        entry.total++
        if (r.status === 'lead_complete' || r.status === 'nonvendor_complete') entry.completed++
        else if (r.status === 'in_progress') entry.inProgress++
        else if (r.status === 'abandoned') entry.abandoned++
      }

      if (!cancelled) {
        setData(
          Array.from(map.values())
            .filter(r => r.practitioner !== 'Unassigned' || r.total > 0)
            .sort((a, b) => b.total - a.total)
        )
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { data, loading }
}
