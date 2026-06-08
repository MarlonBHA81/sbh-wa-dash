import { Drawer } from '../ui/Drawer'
import { formatDate } from '../../lib/utils'
import type { ConversationRow } from '../../types/database'

const STATUS_LABELS: Record<string, string> = {
  in_progress:         'In progress',
  lead_complete:       'Lead complete',
  nonvendor_complete:  'Non-vendor complete',
  abandoned:           'Abandoned',
}

interface LeadDrawerProps {
  lead: ConversationRow | null
  onClose: () => void
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="mb-4">
      <dt className="text-xs font-heading font-semibold text-charcoal/50 uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="font-body text-sm text-charcoal">{value}</dd>
    </div>
  )
}

export function LeadDrawer({ lead, onClose }: LeadDrawerProps) {
  const fullName = [lead?.first_name, lead?.last_name].filter(Boolean).join(' ') || 'Unknown'

  return (
    <Drawer open={!!lead} onClose={onClose} title={fullName}>
      {lead && (
        <dl>
          <Field label="Business" value={lead.business_name} />
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Vendor type" value={lead.vendor_type} />
          <Field label="Vendor number" value={lead.vendor_number} />
          <Field label="Focus area" value={lead.focus_area} />
          <Field label="Status" value={STATUS_LABELS[lead.status] ?? lead.status} />
          <Field
            label="Started"
            value={lead.started_at ? formatDate(lead.started_at, 'dd MMM yyyy HH:mm') : null}
          />
          <Field
            label="Last message"
            value={lead.last_message_at ? formatDate(lead.last_message_at, 'dd MMM yyyy HH:mm') : null}
          />
          {lead.completed_at && (
            <Field
              label="Completed"
              value={formatDate(lead.completed_at, 'dd MMM yyyy HH:mm')}
            />
          )}

          {lead.struggle && (
            <div className="mt-6">
              <dt className="text-xs font-heading font-semibold text-charcoal/50 uppercase tracking-wide mb-2">
                Struggle / Challenge
              </dt>
              <dd className="font-body text-sm text-charcoal bg-white rounded-xl border border-surface-2 p-4 leading-relaxed whitespace-pre-wrap">
                {lead.struggle}
              </dd>
            </div>
          )}

          {lead.ai_note && (
            <div className="mt-4">
              <dt className="text-xs font-heading font-semibold text-charcoal/50 uppercase tracking-wide mb-2">
                AI Note
              </dt>
              <dd className="font-body text-sm text-charcoal bg-primary/5 border-l-2 border-primary rounded-r-xl p-4 leading-relaxed">
                {lead.ai_note}
              </dd>
            </div>
          )}

          {lead.retention_until && (
            <div className="mt-6 pt-4 border-t border-surface">
              <dt className="text-xs font-heading font-semibold text-charcoal/50 uppercase tracking-wide mb-0.5">
                Data retained until
              </dt>
              <dd className="font-body text-sm text-charcoal/60">
                {formatDate(lead.retention_until)}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Drawer>
  )
}
