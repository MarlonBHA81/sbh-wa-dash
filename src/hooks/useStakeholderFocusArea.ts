import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { focusLabel } from '../lib/focusLabels'
import type { CategoryStat } from './useCategoryBreakdown'

export function useStakeholderFocusArea() {
  const [data, setData] = useState<CategoryStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: rows, error: err } = await supabase.rpc('get_focus_area_distribution') as {
        data: Array<{ focus_area: string; total: number; completed: number }> | null
        error: { message: string } | null
      }

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const result: CategoryStat[] = (rows ?? []).map(r => ({
        category: r.focus_area,
        label: focusLabel(r.focus_area),
        total: Number(r.total),
        completed: Number(r.completed),
        notCompleted: Number(r.total) - Number(r.completed),
        completionRate: r.total === 0 ? 0 : Math.round(Number(r.completed) / Number(r.total) * 100),
      }))

      setData(result)
      setLoading(false)
    }

    load()
  }, [])

  return { data, loading, error }
}
