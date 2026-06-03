import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { StakeholderMetrics, MonthlyTrendRow } from '../types/database'

export function useStakeholderMetrics() {
  const [metrics, setMetrics] = useState<StakeholderMetrics | null>(null)
  const [trend, setTrend] = useState<MonthlyTrendRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [metricsRes, trendRes] = await Promise.all([
        supabase.rpc('get_stakeholder_metrics'),
        supabase
          .from('v_stakeholder_monthly_trend')
          .select('*')
          .order('month', { ascending: true }),
      ])

      const metricsData = metricsRes as { data: StakeholderMetrics[] | null; error: { message: string } | null }
      if (metricsData.error) {
        setError(metricsData.error.message)
      } else if (metricsData.data) {
        const row = Array.isArray(metricsData.data) ? metricsData.data[0] : metricsData.data
        setMetrics(row as StakeholderMetrics)
      }

      const trendData = trendRes as { data: MonthlyTrendRow[] | null; error: { message: string } | null }
      if (!trendData.error && trendData.data) {
        setTrend(trendData.data)
      }

      setLoading(false)
    }

    load()
  }, [])

  return { metrics, trend, loading, error }
}
