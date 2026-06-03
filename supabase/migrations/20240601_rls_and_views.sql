-- ============================================================
-- supabase/migrations/20240601_rls_and_views.sql
--
-- Run once in Supabase SQL editor: Dashboard › SQL Editor › New query
-- Assumes RLS is already enabled on conversations and events tables.
-- ============================================================

-- ── 1. RLS: Team role — full SELECT on conversations ─────────

CREATE POLICY "team_select_conversations"
  ON public.conversations
  FOR SELECT TO authenticated
  USING (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'team'
  );

-- ── 2. RLS: Team role — full SELECT on events ─────────────────

CREATE POLICY "team_select_events"
  ON public.events
  FOR SELECT TO authenticated
  USING (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'team'
  );

-- Stakeholders have NO direct access to either base table.
-- RLS enabled + no permissive policy for them = default deny. ✓

-- ── 3. Stakeholder metrics — SECURITY DEFINER function ────────
--
-- A plain view is SECURITY DEFINER by default in Supabase (runs as
-- the postgres owner, bypassing RLS). Using an explicit function
-- lets us return only aggregate columns, never raw rows or PII.

CREATE OR REPLACE FUNCTION public.get_stakeholder_metrics()
RETURNS TABLE (
  total_conversations    bigint,
  total_completed        bigint,
  completion_rate_pct    numeric,
  cnt_in_progress        bigint,
  cnt_lead_complete      bigint,
  cnt_nonvendor_complete bigint,
  cnt_abandoned          bigint,
  cnt_vendor             bigint,
  cnt_nonvendor          bigint,
  fa_sell                bigint,
  fa_finance             bigint,
  fa_customers           bigint,
  fa_ai                  bigint,
  fa_rfp                 bigint,
  fa_leadership          bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('lead_complete', 'nonvendor_complete')),
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('lead_complete', 'nonvendor_complete'))::numeric
      / NULLIF(COUNT(*), 0) * 100, 1
    ),
    COUNT(*) FILTER (WHERE status = 'in_progress'),
    COUNT(*) FILTER (WHERE status = 'lead_complete'),
    COUNT(*) FILTER (WHERE status = 'nonvendor_complete'),
    COUNT(*) FILTER (WHERE status = 'abandoned'),
    COUNT(*) FILTER (WHERE vendor_type = 'Vendor'),
    COUNT(*) FILTER (WHERE vendor_type = 'Non-Vendor'),
    COUNT(*) FILTER (WHERE focus_area = 'Sell, negotiate & present'),
    COUNT(*) FILTER (WHERE focus_area = 'Business finances & compliance'),
    COUNT(*) FILTER (WHERE focus_area = 'Finding customers & promotion'),
    COUNT(*) FILTER (WHERE focus_area = 'Using AI to be productive'),
    COUNT(*) FILTER (WHERE focus_area = 'Completing RFPs & Tenders'),
    COUNT(*) FILTER (WHERE focus_area = 'Leadership, burnout & stress')
  FROM public.conversations
  WHERE coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '')
          IN ('team', 'stakeholder');
$$;

REVOKE ALL ON FUNCTION public.get_stakeholder_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_metrics() TO authenticated;

-- ── 4. Monthly trend view (stakeholder line chart) ────────────

CREATE OR REPLACE VIEW public.v_stakeholder_monthly_trend AS
SELECT
  date_trunc('month', started_at)::date AS month,
  COUNT(*)                               AS total_conversations,
  COUNT(*) FILTER (
    WHERE status IN ('lead_complete', 'nonvendor_complete')
  )                                      AS completed
FROM public.conversations
WHERE coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '')
        IN ('team', 'stakeholder')
GROUP BY date_trunc('month', started_at)
ORDER BY month;

GRANT SELECT ON public.v_stakeholder_monthly_trend TO authenticated;

-- ── NOTE: Assigning roles ──────────────────────────────────────
--
-- Set app_metadata for each user via Supabase Dashboard:
--   Authentication › Users › [user] › Edit › app_metadata
--   { "role": "team" }   or   { "role": "stakeholder" }
--
-- Or programmatically using the Admin API with the service-role key:
--   supabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'team' } })
--
-- IMPORTANT: Use app_metadata (server-writable only), NOT user_metadata.
