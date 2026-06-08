import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const client = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userErr } = await client.auth.getUser()
    if (userErr || !user) return json({ error: 'Unauthorized' }, 401)
    if (user.app_metadata?.role !== 'team') return json({ error: 'Forbidden' }, 403)

    const { pin } = await req.json() as { pin: string }

    const { data: pinRow } = await client
      .from('admin_settings')
      .select('value')
      .eq('key', 'reset_pin')
      .single()

    if (!pinRow || pinRow.value !== pin) return json({ error: 'Invalid PIN' }, 401)

    const BREVO_KEY = Deno.env.get('BREVO_API_KEY')
    if (!BREVO_KEY) return json({ error: 'BREVO_API_KEY secret not set on this Edge Function' }, 500)

    let offset = 0
    const limit = 50
    let totalDeleted = 0

    while (true) {
      const res = await fetch(`https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}`, {
        headers: { 'api-key': BREVO_KEY },
      })
      const data = await res.json() as { contacts?: Array<{ email: string }> }
      const contacts = data.contacts ?? []
      if (contacts.length === 0) break

      await Promise.all(contacts.map(async c => {
        const del = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(c.email)}`, {
          method: 'DELETE',
          headers: { 'api-key': BREVO_KEY },
        })
        if (del.ok || del.status === 204) totalDeleted++
      }))

      if (contacts.length < limit) break
      offset += limit
    }

    return json({ success: true, deleted: totalDeleted })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
