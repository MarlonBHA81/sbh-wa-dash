import { useState, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import { LeadDrawer } from './LeadDrawer'
import { exportToCSV, formatRelativeTime } from '../../lib/utils'
import type { ConversationRow, ConversationStatus } from '../../types/database'

const STATUS_LABELS: Record<ConversationStatus, string> = {
  in_progress:        'In progress',
  lead_complete:      'Lead complete',
  nonvendor_complete: 'Non-vendor',
  abandoned:          'Abandoned',
}

const STATUS_COLORS: Record<ConversationStatus, string> = {
  in_progress:        'bg-amber-50 text-amber-700 border-amber-200',
  lead_complete:      'bg-teal-50 text-teal-700 border-teal-200',
  nonvendor_complete: 'bg-green-50 text-green-700 border-green-200',
  abandoned:          'bg-rose-50 text-rose-700 border-rose-200',
}

const FOCUS_AREAS = [
  'Sell, negotiate & present',
  'Business finances & compliance',
  'Finding customers & promotion',
  'Using AI to be productive',
  'Completing RFPs & Tenders',
  'Leadership, burnout & stress',
]

type SortField = 'started_at' | 'status' | 'vendor_type' | 'focus_area'
const PAGE_SIZE = 25

interface LeadTableProps {
  conversations: ConversationRow[]
  loading: boolean
}

export function LeadTable({ conversations, loading }: LeadTableProps) {
  const [selectedLead, setSelectedLead] = useState<ConversationRow | null>(null)
  const [filterVendorType, setFilterVendorType] = useState('')
  const [filterFocusArea, setFilterFocusArea] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('started_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    return conversations
      .filter(c => !filterVendorType || c.vendor_type === filterVendorType)
      .filter(c => !filterFocusArea || c.focus_area === filterFocusArea)
      .filter(c => !filterDateFrom || c.started_at >= filterDateFrom)
      .filter(c => !filterDateTo || c.started_at <= filterDateTo + 'T23:59:59Z')
      .sort((a, b) => {
        const av = (a[sortField] ?? '') as string
        const bv = (b[sortField] ?? '') as string
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
  }, [conversations, filterVendorType, filterFocusArea, filterDateFrom, filterDateTo, sortField, sortAsc])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(a => !a)
    else { setSortField(field); setSortAsc(false) }
    setPage(0)
  }

  const handleExport = () => {
    exportToCSV(
      filtered.map(c => ({
        Name: [c.first_name, c.last_name].filter(Boolean).join(' '),
        Business: c.business_name ?? '',
        Email: c.email ?? '',
        Phone: c.phone,
        'Focus Area': c.focus_area ?? '',
        Status: STATUS_LABELS[c.status] ?? c.status,
        'Vendor Type': c.vendor_type ?? '',
        Started: c.started_at,
      })),
      'sbh-leads.csv',
    )
  }

  const SortIndicator = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-charcoal/30 text-xs">
      {sortField === field ? (sortAsc ? '↑' : '↓') : '↕'}
    </span>
  )

  const inputClass =
    'font-body text-sm rounded-lg border border-surface-2 bg-white px-3 py-2 text-charcoal ' +
    'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterVendorType}
          onChange={e => { setFilterVendorType(e.target.value); setPage(0) }}
          className={inputClass}
        >
          <option value="">All vendor types</option>
          <option value="Vendor">Vendor</option>
          <option value="Non-Vendor">Non-Vendor</option>
        </select>

        <select
          value={filterFocusArea}
          onChange={e => { setFilterFocusArea(e.target.value); setPage(0) }}
          className={inputClass}
        >
          <option value="">All focus areas</option>
          {FOCUS_AREAS.map(fa => (
            <option key={fa} value={fa}>{fa}</option>
          ))}
        </select>

        <input
          type="date"
          value={filterDateFrom}
          onChange={e => { setFilterDateFrom(e.target.value); setPage(0) }}
          className={inputClass}
          aria-label="From date"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={e => { setFilterDateTo(e.target.value); setPage(0) }}
          className={inputClass}
          aria-label="To date"
        />

        <Button variant="outline" size="sm" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No leads match the current filters"
          description="Try adjusting the filters above."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-surface-2">
            <table className="w-full text-sm font-body">
              <thead className="bg-surface">
                <tr>
                  <th
                    className="text-left px-4 py-3 text-charcoal/60 font-heading font-semibold text-xs uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                    onClick={() => handleSort('started_at')}
                  >
                    Name <SortIndicator field="started_at" />
                  </th>
                  <th className="text-left px-4 py-3 text-charcoal/60 font-heading font-semibold text-xs uppercase tracking-wide">
                    Business
                  </th>
                  <th
                    className="text-left px-4 py-3 text-charcoal/60 font-heading font-semibold text-xs uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                    onClick={() => handleSort('focus_area')}
                  >
                    Focus area <SortIndicator field="focus_area" />
                  </th>
                  <th
                    className="text-left px-4 py-3 text-charcoal/60 font-heading font-semibold text-xs uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIndicator field="status" />
                  </th>
                  <th
                    className="text-left px-4 py-3 text-charcoal/60 font-heading font-semibold text-xs uppercase tracking-wide cursor-pointer whitespace-nowrap select-none"
                    onClick={() => handleSort('vendor_type')}
                  >
                    Vendor <SortIndicator field="vendor_type" />
                  </th>
                  <th className="text-left px-4 py-3 text-charcoal/60 font-heading font-semibold text-xs uppercase tracking-wide">
                    Intake
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(lead => (
                  <tr
                    key={lead.id}
                    className="border-t border-surface-2 cursor-pointer hover:bg-surface/70 transition-colors"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-4 py-3 text-charcoal">
                      {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || (
                        <span className="text-charcoal/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {lead.business_name ?? <span className="text-charcoal/30">—</span>}
                    </td>
                    <td className="px-4 py-3 text-charcoal max-w-[200px] truncate">
                      {lead.focus_area ?? <span className="text-charcoal/30">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[lead.status] ?? 'bg-surface text-charcoal border-surface-2'
                        }`}
                      >
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {lead.vendor_type ?? <span className="text-charcoal/30">—</span>}
                    </td>
                    <td className="px-4 py-3 text-charcoal/50 whitespace-nowrap">
                      {formatRelativeTime(lead.started_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-charcoal/50 font-body">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ←
                </Button>
                <span className="text-xs font-body text-charcoal/60 min-w-[60px] text-center">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}
