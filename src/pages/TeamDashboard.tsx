import { useState, useCallback, useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { TeamKPIs } from '../components/team/TeamKPIs'
import { FunnelChart } from '../components/team/FunnelChart'
import { CategoryBreakdown } from '../components/team/CategoryBreakdown'
import { VendorSplit } from '../components/team/VendorSplit'
import { PractitionerTable } from '../components/team/PractitionerTable'
import { AINoteFeed } from '../components/team/AINoteFeed'
import { LeadTable } from '../components/team/LeadTable'
import { TimeSeriesChart } from '../components/team/TimeSeriesChart'
import { HeatmapChart } from '../components/team/HeatmapChart'
import { ResetDataModal } from '../components/team/ResetDataModal'
import { useTeamKPIs } from '../hooks/useTeamKPIs'
import { useConversations } from '../hooks/useConversations'
import { useFunnelData } from '../hooks/useFunnelData'
import { useCategoryBreakdown } from '../hooks/useCategoryBreakdown'
import { useHeatmapData } from '../hooks/useHeatmapData'
import { usePractitionerData } from '../hooks/usePractitionerData'
import { useVendorData } from '../hooks/useVendorData'
import { supabase } from '../lib/supabase'

export function TeamDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [resetOpen, setResetOpen] = useState(false)
  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    const channel = supabase
      .channel('team-dashboard-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, refresh)
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [refresh])

  const { kpis, loading: kpisLoading } = useTeamKPIs(refreshKey)
  const { conversations, loading: convsLoading } = useConversations(refreshKey)
  const { steps, loading: funnelLoading } = useFunnelData(refreshKey)
  const { data: categoryData, loading: categoryLoading } = useCategoryBreakdown(refreshKey)
  const { cells, loading: heatmapLoading } = useHeatmapData()
  const { data: practitionerData, loading: practitionerLoading } = usePractitionerData(refreshKey)
  const { data: vendorData, loading: vendorLoading } = useVendorData(refreshKey)

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-charcoal mb-1">Team Dashboard</h1>
          <p className="font-body text-sm text-charcoal/50">WhatsApp intake funnel · live data</p>
        </div>

        <TeamKPIs kpis={kpis} loading={kpisLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart steps={steps} loading={funnelLoading} />
          <TimeSeriesChart />
        </div>

        <CategoryBreakdown data={categoryData} loading={categoryLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VendorSplit data={vendorData} loading={vendorLoading} />
          <PractitionerTable data={practitionerData} loading={practitionerLoading} />
        </div>

        <AINoteFeed refreshKey={refreshKey} />

        <HeatmapChart cells={cells} loading={heatmapLoading} />

        <div>
          <h2 className="font-heading font-semibold text-lg text-charcoal mb-4">Lead inbox</h2>
          <LeadTable conversations={conversations} loading={convsLoading} />
        </div>

        <div className="border-t border-surface pt-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold text-xs text-charcoal/40 uppercase tracking-wide">Danger zone</p>
            <p className="font-body text-xs text-charcoal/30 mt-0.5">Irreversible — use with care</p>
          </div>
          <button
            onClick={() => setResetOpen(true)}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-500 font-body text-sm hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-colors"
          >
            Reset data
          </button>
        </div>

        <ResetDataModal open={resetOpen} onClose={() => { setResetOpen(false); refresh() }} />
      </div>
    </Layout>
  )
}
