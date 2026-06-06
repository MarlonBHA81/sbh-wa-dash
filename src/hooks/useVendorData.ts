import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface VendorData {
  vendor: number
  nonVendor: number
  unknown: number
  total: number
}

export function useVendorData(refreshKey = 0) {
  const [data, setData] = useState<VendorData>({ vendor: 0, nonVendor: 0, unknown: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: rows } = await supabase
        .from('conversations')
        .select('vendor_type')

      if (cancelled) return
      const typed = (rows ?? []) as Array<{ vendor_type: string | null }>
      let vendor = 0, nonVendor = 0, unknown = 0
      for (const r of typed) {
        if (r.vendor_type === 'Vendor') vendor++
        else if (r.vendor_type === 'Non-Vendor') nonVendor++
        else unknown++
      }
      if (!cancelled) {
        setData({ vendor, nonVendor, unknown, total: vendor + nonVendor + unknown })
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { data, loading }
}
