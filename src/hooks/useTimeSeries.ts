import { useEffect, useState } from 'react'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { TimeSeriesPoint } from '../types/database'

export function useTimeSeries(period: 30 | 90 = 30) {
  const [data, setData] = useState<TimeSeriesPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const now = new Date()
      const from = subDays(now, period).toISOString()

      const { data: rows, error: err } = await supabase
        .from('conversations')
        .select('started_at')
        .gte('started_at', from)

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const dayMap = new Map<string, number>()
      for (const day of eachDayOfInterval({ start: subDays(now, period), end: now })) {
        dayMap.set(format(day, 'yyyy-MM-dd'), 0)
      }
      for (const row of (rows ?? []) as Array<{ started_at: string }>) {
        const key = format(new Date(row.started_at), 'yyyy-MM-dd')
        if (dayMap.has(key)) dayMap.set(key, dayMap.get(key)! + 1)
      }

      setData(Array.from(dayMap, ([date, count]) => ({ date, count })))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [period])

  return { data, loading, error }
}
