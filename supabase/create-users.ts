/**
 * One-time user setup script.
 *
 * Run:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   PW1=YourPasswordHere PW2=YourPasswordHere \
 *   npx tsx supabase/create-users.ts
 *
 * Delete this file after running — it is not needed in production.
 */

import { createClient } from '@supabase/supabase-js'

const url            = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const serviceKey     = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const pw1            = process.env.PW1 ?? ''
const pw2            = process.env.PW2 ?? ''

if (!url || !serviceKey || !pw1 || !pw2) {
  console.error('Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PW1, PW2')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const USERS = [
  {
    email:        'webmaster@smallbusinesshelpdesk.co.za',
    password:     pw1,
    role:         'team',        // team role → can access both views
    description:  'Webmaster / dual-access',
  },
  {
    email:        'team@smallbusinesshelpdesk.co.za',
    password:     pw2,
    role:         'team',
    description:  'Team member',
  },
]

async function run() {
  for (const u of USERS) {
    console.log(`Creating ${u.description} (${u.email})…`)

    const { data, error } = await supabase.auth.admin.createUser({
      email:          u.email,
      password:       u.password,
      app_metadata:   { role: u.role },
      email_confirm:  true,        // skip confirmation email
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        // User exists — just make sure the role is set
        console.log(`  Already exists — updating app_metadata…`)
        const { data: list } = await supabase.auth.admin.listUsers()
        const existing = list?.users.find(x => x.email === u.email)
        if (existing) {
          const { error: ue } = await supabase.auth.admin.updateUserById(existing.id, {
            app_metadata: { role: u.role },
          })
          if (ue) console.error(`  Update failed: ${ue.message}`)
          else    console.log(`  Role set to "${u.role}" ✓`)
        }
      } else {
        console.error(`  Failed: ${error.message}`)
      }
    } else {
      console.log(`  Created (${data.user.id}), role="${u.role}" ✓`)
    }
  }
  console.log('\nDone.')
}

run().catch(err => { console.error(err); process.exit(1) })
