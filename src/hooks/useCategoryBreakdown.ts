import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { focusLabel } from '../lib/focusLabels'

export interface CategoryStat {
  category: string
  label: string
  total: number
  completed: number
  notCompleted: number
  completionRate: number
}

export function useCategoryBreakdown(refreshKey = 0) {
  const [data, setData] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data: rows, error: err } = await supabase
        .from('conversations')
        .select('focus_area, status')

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const typed = (rows ?? []) as Array<{ focus_area: string | null; status: string }>
      const map = new Map<string, { total: number; completed: number }>()

      for (const r of typed) {
        const key = r.focus_area ?? '(no category)'
        if (!map.has(key)) map.set(key, { total: 0, completed: 0 })
        const entry = map.get(key)!
        entry.total++
        if (r.status === 'lead_complete' || r.status === 'nonvendor_complete') {
          entry.completed++
        }
      }

      const result: CategoryStat[] = Array.from(map.entries())
        .map(([key, val]) => ({
          category: key,
          label: focusLabel(key),
          total: val.total,
          completed: val.completed,
          notCompleted: val.total - val.completed,
          completionRate: val.total === 0 ? 0 : Math.round(val.completed / val.total * 100),
        }))
        .sort((a, b) => {
          // Pin "Not selected yet" to the bottom
          if (a.category === '(no category)') return 1
          if (b.category === '(no category)') return -1
          return b.total - a.total
        })

      setData(result)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { data, loading, error }
}
