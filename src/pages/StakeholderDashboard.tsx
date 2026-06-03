import { Layout } from '../components/layout/Layout'
import { StakeholderKPIs } from '../components/stakeholder/StakeholderKPIs'
import { FocusAreaBar } from '../components/stakeholder/FocusAreaBar'
import { VendorDonut } from '../components/stakeholder/VendorDonut'
import { MonthlyTrend } from '../components/stakeholder/MonthlyTrend'
import { useStakeholderMetrics } from '../hooks/useStakeholderMetrics'

export function StakeholderDashboard() {
  const { metrics, trend, loading } = useStakeholderMetrics()

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-charcoal mb-1">
            Programme Overview
          </h1>
          <p className="font-body text-sm text-charcoal/50">
            City of Cape Town Small Business Helpdesk
          </p>
        </div>

        <StakeholderKPIs metrics={metrics} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FocusAreaBar metrics={metrics} loading={loading} />
          <VendorDonut metrics={metrics} loading={loading} />
        </div>

        <MonthlyTrend data={trend} loading={loading} />
      </div>
    </Layout>
  )
}
