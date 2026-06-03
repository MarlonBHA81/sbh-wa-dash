import { useEffect, useState } from 'react'
import { getDay, getHours } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { HeatmapCell } from '../types/database'

export function useHeatmapData() {
  const [cells, setCells] = useState<HeatmapCell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('events')
        .select('created_at')
        .eq('step', 'inbound')

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const grid: Record<string, number> = {}
      const rows = (data ?? []) as Array<{ created_at: string }>
      for (const row of rows) {
        const d = new Date(row.created_at)
        const key = `${getDay(d)}_${getHours(d)}`
        grid[key] = (grid[key] ?? 0) + 1
      }

      const result: HeatmapCell[] = []
      for (let dow = 0; dow < 7; dow++) {
        for (let hour = 0; hour < 24; hour++) {
          result.push({ dow, hour, count: grid[`${dow}_${hour}`] ?? 0 })
        }
      }

      setCells(result)
      setLoading(false)
    }

    load()
  }, [])

  return { cells, loading, error }
}
