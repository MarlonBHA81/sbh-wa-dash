import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { FunnelStep } from '../types/database'

const FUNNEL_STEPS = [
  'inbound',
  'focus_area',
]

export function useFunnelData(refreshKey = 0) {
  const [steps, setSteps] = useState<FunnelStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('events')
        .select('phone, step')

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const stepPhones = new Map<string, Set<string>>()
      const rows = (data ?? []) as Array<{ phone: string; step: string }>
      for (const e of rows) {
        if (!stepPhones.has(e.step)) stepPhones.set(e.step, new Set<string>())
        stepPhones.get(e.step)!.add(e.phone)
      }

      const result: FunnelStep[] = []
      let prevCount = 0

      for (const stepName of FUNNEL_STEPS) {
        const count = stepPhones.get(stepName)?.size ?? 0
        const dropOffPct = prevCount === 0
          ? 0
          : Math.round((1 - count / prevCount) * 100)
        result.push({ step: stepName, count, dropOffPct })
        if (count > 0) prevCount = count
      }

      setSteps(result)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { steps, loading, error }
}
