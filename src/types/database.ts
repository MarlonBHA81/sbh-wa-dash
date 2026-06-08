export type ConversationStatus =
  | 'in_progress'
  | 'lead_complete'
  | 'nonvendor_complete'
  | 'abandoned'

export type VendorType = 'Vendor' | 'Non-Vendor'

export type FocusArea =
  | 'Sell, negotiate & present'
  | 'Business finances & compliance'
  | 'Finding customers & promotion'
  | 'Using AI to be productive'
  | 'Completing RFPs & Tenders'
  | 'Leadership, burnout & stress'

export interface ConversationRow {
  id: string
  phone: string
  started_at: string
  last_message_at: string
  completed_at: string | null
  retention_until: string
  status: ConversationStatus
  vendor_type: VendorType | null
  first_name: string | null
  last_name: string | null
  business_name: string | null
  email: string | null
  vendor_number: string | null
  focus_area: FocusArea | null
  struggle: string | null
  ai_note: string | null
  created_at: string
  practitioner: string | null
  channel: string | null
}

export interface EventRow {
  id: string
  phone: string
  step: string
  text: string | null
  created_at: string
}

export interface StakeholderMetrics {
  total_conversations: number
  total_completed: number
  completion_rate_pct: number
  cnt_in_progress: number
  cnt_lead_complete: number
  cnt_nonvendor_complete: number
  cnt_abandoned: number
  cnt_vendor: number
  cnt_nonvendor: number
  fa_sell: number
  fa_finance: number
  fa_customers: number
  fa_ai: number
  fa_rfp: number
  fa_leadership: number
}

export interface MonthlyTrendRow {
  month: string
  total_conversations: number
  completed: number
}

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: ConversationRow
        Insert: Omit<ConversationRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<ConversationRow, 'id'>>
      }
      events: {
        Row: EventRow
        Insert: Omit<EventRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<EventRow, 'id'>>
      }
    }
    Views: {
      v_stakeholder_monthly_trend: {
        Row: MonthlyTrendRow
      }
    }
    Functions: {
      get_stakeholder_metrics: {
        Args: Record<never, never>
        Returns: StakeholderMetrics[]
      }
    }
  }
}

export interface TeamKpis {
  today: number
  thisWeek: number
  thisMonth: number
  completionRate: number
  leadsAwaitingFollowup: number
  approaching24hWindow: number
  avgCompletionHours: number | null
  optOutCount: number
}

export interface FunnelStep {
  step: string
  count: number
  dropOffPct: number
}

export interface HeatmapCell {
  dow: number
  hour: number
  count: number
}

export interface TimeSeriesPoint {
  date: string
  count: number
}
