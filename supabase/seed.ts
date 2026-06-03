/**
 * Seed script — inserts ~200 realistic fake conversations + events into Supabase.
 *
 * Run: npx tsx supabase/seed.ts
 *
 * Requires env vars (NOT the VITE_ ones — service-role key bypasses RLS):
 *   SUPABASE_URL=https://...supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Reference data ─────────────────────────────────────────────

const FIRST_NAMES = [
  'Sipho', 'Thabo', 'Zanele', 'Lerato', 'Pieter', 'Mariam', 'Fatima', 'Nadia',
  'Ayanda', 'Nomvula', 'James', 'Priya', 'Lindiwe', 'David', 'Blessing',
  'Kyle', 'Amara', 'Mohamed', 'Jade', 'Ricky', 'Ntombi', 'Lebo', 'Chloe',
  'Tariq', 'Simone', 'Andile', 'Yolanda', 'Gerhard', 'Naledi', 'Siya',
]

const LAST_NAMES = [
  'Nkosi', 'Dlamini', 'van der Merwe', 'Patel', 'Williams', 'Mokoena',
  'du Toit', 'Singh', 'Khumalo', 'Adams', 'Botha', 'Mthembu', 'Jacobs',
  'Coetzee', 'Sithole', 'Swart', 'Ntuli', 'Mitchell', 'Cele', 'Hendricks',
  'Pillay', 'Fourie', 'Zulu', 'Smit', 'Mkhize', 'Ferreira', 'Shabalala',
]

const BIZ_ADJ = ['Bright', 'Cape', 'Summit', 'Urban', 'Prime', 'True', 'Fresh',
  'Bold', 'Green', 'Blue', 'Gold', 'Peak', 'Metro', 'South', 'Smart']
const BIZ_NOUN = ['Solutions', 'Catering', 'Logistics', 'Retail', 'Consulting',
  'Trading', 'Services', 'Enterprises', 'Digital', 'Manufacturing', 'Designs',
  'Foods', 'Tech', 'Events', 'Media']

const FOCUS_AREAS = [
  'Sell, negotiate & present',
  'Business finances & compliance',
  'Finding customers & promotion',
  'Using AI to be productive',
  'Completing RFPs & Tenders',
  'Leadership, burnout & stress',
]

const FOCUS_WEIGHTS = [0.22, 0.20, 0.18, 0.15, 0.14, 0.11]

const STRUGGLES = [
  'We struggle to close deals at trade shows — customers show interest but rarely follow through.',
  'My cash flow is unpredictable and I find tax compliance confusing and time-consuming.',
  'Getting our first paying customers outside of friends and family has been really hard.',
  'I want to use AI tools for admin and quotes but I do not know where to start.',
  'We have tried to apply for government tenders twice and both times we were disqualified on technicalities.',
  'I am burning out trying to do everything myself and managing a team of 4 is overwhelming.',
  'Social media feels like a waste of time; none of our posts convert to actual sales.',
  'We need to raise prices but are scared of losing the few clients we have.',
]

const STATUS_WEIGHTS: Array<{ status: string; weight: number }> = [
  { status: 'lead_complete',      weight: 0.40 },
  { status: 'nonvendor_complete', weight: 0.25 },
  { status: 'in_progress',        weight: 0.20 },
  { status: 'abandoned',          weight: 0.15 },
]

const FUNNEL_STEPS = [
  'inbound', 'greeting', 'name_capture', 'vendor_check',
  'focus_area', 'struggle', 'lead_form', 'completion',
]

// ── Helpers ────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickFocusArea(): string {
  let r = Math.random()
  for (let i = 0; i < FOCUS_AREAS.length; i++) {
    r -= FOCUS_WEIGHTS[i]
    if (r <= 0) return FOCUS_AREAS[i]
  }
  return FOCUS_AREAS[FOCUS_AREAS.length - 1]
}

function pickStatus(): string {
  let r = Math.random()
  for (const { status, weight } of STATUS_WEIGHTS) {
    r -= weight
    if (r <= 0) return status
  }
  return 'abandoned'
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60_000)
}

function randomDaysAgo(max: number): Date {
  // Peak on weekdays 8am-1pm SAST (UTC+2 = UTC-2h shift)
  const daysAgo = Math.random() * max
  const base = new Date(Date.now() - daysAgo * 86_400_000)
  // 70% chance of landing in peak hours
  if (Math.random() < 0.70) {
    base.setUTCHours(6 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 60), 0, 0)
    // Push to weekday if weekend
    const dow = base.getDay()
    if (dow === 0) base.setDate(base.getDate() + 1)
    if (dow === 6) base.setDate(base.getDate() - 1)
  }
  return base
}

function saPhone(): string {
  const prefix = rand(['821', '832', '840', '861', '878', '712', '739', '764', '783', '790'])
  const rest = String(Math.floor(Math.random() * 9_000_000) + 1_000_000)
  return `+27${prefix}${rest}`
}

// ── Main ────────────────────────────────────────────────────────

async function seed() {
  const TOTAL = 200
  console.log(`Seeding ${TOTAL} conversations…`)

  // Clear existing seed data (idempotent re-runs)
  // Only deletes if you want a clean slate — comment out to append
  // await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  // await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const conversations = []
  const events = []
  const usedPhones = new Set<string>()

  for (let i = 0; i < TOTAL; i++) {
    let phone = saPhone()
    while (usedPhones.has(phone)) phone = saPhone()
    usedPhones.add(phone)

    const status = pickStatus()
    const isVendor = Math.random() < 0.60
    const vendorType = isVendor ? 'Vendor' : 'Non-Vendor'
    const startedAt = randomDaysAgo(90)

    // How many steps did this conversation reach?
    let stepsReached: number
    if (status === 'lead_complete' || status === 'nonvendor_complete') {
      stepsReached = FUNNEL_STEPS.length
    } else if (status === 'in_progress') {
      stepsReached = 2 + Math.floor(Math.random() * 4)
    } else {
      // abandoned
      stepsReached = 1 + Math.floor(Math.random() * 3)
    }

    const lastStep = FUNNEL_STEPS[stepsReached - 1]
    const lastMessageAt = addMinutes(startedAt, stepsReached * (3 + Math.random() * 8))
    const completedAt = (status === 'lead_complete' || status === 'nonvendor_complete')
      ? lastMessageAt
      : null
    const retentionUntil = new Date(startedAt.getTime() + 30 * 86_400_000)

    const focusReached = stepsReached > FUNNEL_STEPS.indexOf('focus_area')
    const struggleReached = stepsReached > FUNNEL_STEPS.indexOf('struggle')
    const nameReached = stepsReached > FUNNEL_STEPS.indexOf('name_capture')

    conversations.push({
      phone,
      started_at: startedAt.toISOString(),
      last_message_at: lastMessageAt.toISOString(),
      completed_at: completedAt?.toISOString() ?? null,
      retention_until: retentionUntil.toISOString(),
      status,
      vendor_type: vendorType,
      first_name: nameReached ? rand(FIRST_NAMES) : null,
      last_name: nameReached ? rand(LAST_NAMES) : null,
      business_name: nameReached ? `${rand(BIZ_ADJ)} ${rand(BIZ_NOUN)}` : null,
      email: nameReached ? `contact@${rand(BIZ_NOUN).toLowerCase()}.co.za` : null,
      vendor_number: isVendor && nameReached ? `V${String(100 + Math.floor(Math.random() * 400)).padStart(4, '0')}` : null,
      focus_area: focusReached ? pickFocusArea() : null,
      struggle: struggleReached ? rand(STRUGGLES) : null,
    })

    // Generate events for this conversation
    let stepTime = new Date(startedAt)
    const stepTexts: Record<string, string> = {
      inbound: 'Hello, I need help with my business',
      greeting: 'Welcome to the City of Cape Town Small Business Helpdesk!',
      name_capture: 'What is your full name?',
      vendor_check: 'Are you a registered City vendor?',
      focus_area: 'Which area would you like support with?',
      struggle: 'Please describe your main challenge in a few sentences.',
      lead_form: 'Thank you! We are creating your lead profile.',
      completion: 'Your intake is complete. A consultant will follow up.',
    }

    // Only emit steps that were actually reached
    // Skip step names that come after lastStep
    const lastStepIndex = FUNNEL_STEPS.indexOf(lastStep)
    for (let s = 0; s <= lastStepIndex; s++) {
      const step = FUNNEL_STEPS[s]
      events.push({
        phone,
        step,
        text: stepTexts[step] ?? null,
        created_at: stepTime.toISOString(),
      })
      stepTime = addMinutes(stepTime, 2 + Math.random() * 6)
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < conversations.length; i += 50) {
    const batch = conversations.slice(i, i + 50)
    const { error } = await supabase.from('conversations').insert(batch)
    if (error) {
      console.error(`Conversations batch ${i}–${i + 50} failed:`, error.message)
      process.exit(1)
    }
    console.log(`  conversations ${i + 1}–${Math.min(i + 50, conversations.length)} ✓`)
  }

  for (let i = 0; i < events.length; i += 200) {
    const batch = events.slice(i, i + 200)
    const { error } = await supabase.from('events').insert(batch)
    if (error) {
      console.error(`Events batch ${i}–${i + 200} failed:`, error.message)
      process.exit(1)
    }
    console.log(`  events ${i + 1}–${Math.min(i + 200, events.length)} ✓`)
  }

  console.log(`\nDone. Inserted ${conversations.length} conversations, ${events.length} events.`)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
