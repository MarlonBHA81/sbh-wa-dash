# Orbie — Small Business Helpdesk WhatsApp Workflow

**File:** `WF_SBHelpdesk_Orbie_Vendor__v1.2.1.json`
**Stack:** n8n + WhatsApp Business Cloud API (native `whatsApp` node) + Anthropic Claude (Sonnet 4.5) + Brevo (contacts) + Supabase (analytics)
**Timezone:** Africa/Johannesburg

## Versioning

Semantic versioning: `__vMAJOR.MINOR`. Bump MINOR (v1.1, v1.2) for additive changes or fixes; MAJOR (v2.0) for breaking changes to schema, channel, or flow structure. Current: **v1.2.1**. Both the filename and the workflow's internal `name` + `meta.version` should be bumped together on each material change, with a one-line entry added to `meta.changelog`.

## What it does

A single AI-agent-driven state machine. Each inbound WhatsApp message (delivered via Meta's Cloud API webhook) is one n8n execution; conversation state lives in Simple Memory keyed on the sender's phone number. Orbie walks the user through:

**Vendor = YES path**
1. Vendor check → 2. Vendor number → 3. Name + business + email → 4. Focus-area menu (1–6) → 5. "Tell me what you're struggling with" → 6. Warm close + 24-hour promise + Channel invite.

**Vendor = NO path**
1. Vendor check → registration steps + explainer video + portal link → wish-well + Channel invite.

Completed conversations (either path) are upserted as contacts into Brevo. The agent emits a structured `DATA={...}` block on close, which is parsed into discrete Brevo contact attributes.

## Why one agent instead of 30 IF nodes

A multi-turn conversation with free-text capture (name/business/email, struggle description) and fuzzy yes/no handling is brittle as a hard-wired node tree. The agent reads memory each turn, knows which step it's on, and outputs only that step's message. The system prompt is the state machine.

## Node map

| Node | Purpose |
|---|---|
| `[Step00]_Webhook_Verify` (GET) | Meta webhook verification handshake — echoes `hub.challenge` |
| `[Step00b]_Respond_Challenge` | Returns the challenge string to Meta |
| `[Step01]_Webhook_WhatsApp_Cloud` (POST) | Inbound message webhook from Meta |
| `[Step02]_Normalize_Filter` | Parses Meta nested payload; filters status callbacks / team numbers; detects STOP opt-out; extracts phone + text |
| `[Step02c]_IF_OptOut` → `[Step02d/e]` | POPIA opt-out: delete Supabase row + confirm |
| `[Step03]_Orbie_Agent` | The conversational brain; emits `STEP=` + `DATA=` tags |
| `[Step03a]_Claude_Model` | Claude Sonnet 4.5, temp 0.4 |
| `[Step03b]_Session_Memory` | Window buffer, sessionKey = phoneNumber, window 20 |
| `[Step04]_PostProcess_Links` | Swaps links; parses `DATA=` + `STEP=`; strips tags; builds `convRow` |
| `[Step04b]_Upsert_Conversation_Supabase` | Upserts the `conversations` row (keyed on phone) every turn |
| `[Step04c]_Log_Event_Supabase` | Appends an `events` row with the named step (funnel tracking) |
| `[Step05]_Send_WhatsApp_Reply` | Native `whatsApp` node — operation `send` |
| `[Step06]_IF_Completed` | Routes finished conversations to Brevo |
| `[Step07]_Build_Brevo_Payload` → `[Step08]_Brevo_Upsert_Contact` | Builds + upserts the contact in Brevo |

## Setup steps

1. **Import** the JSON into n8n.

2. **Environment variables** (Settings → Variables, or your container env):
   - `WA_VERIFY_TOKEN` — any string you choose; entered in Meta when configuring the webhook (step 7)
   - `RESEND_API_KEY` — your Resend API key (domain smallbusinesshelpdesk.co.za must be verified in Resend first)
   - `BREVO_API_KEY` — your Brevo API key
   - `BREVO_LIST_ID` — numeric ID of the Brevo list to add contacts to (e.g. `5`)
   - `SUPABASE_PROJECT_REF` — your project ref (the `xxxx` in `xxxx.supabase.co`)
   - `SUPABASE_SERVICE_KEY` — Supabase **service role** key (server-side only; never expose to the dashboard front-end)

   > The Meta access token is no longer an env var — the native `whatsApp` node holds it in an n8n credential (next step).

3. **Edit the links** in `[Step04]_PostProcess_Links` (top of the code):
   ```js
   const CHANNEL_LINK = 'https://whatsapp.com/channel/YOUR_CHANNEL_ID';
   const VIDEO_LINK   = 'https://youtu.be/YOUR_EXPLAINER_VIDEO';
   const PORTAL_LINK  = 'https://web1.capetown.gov.za/web1/suppliesvendor/';
   ```
   (Confirm the real CoCT vendor portal URL — placeholder used above.)

4. **Team numbers** — in `[Step02]_Normalize_Filter`, replace the placeholder in `teamNumbers` with the numbers (digits only, e.g. `27821234567`) that should bypass automation.

5. **Anthropic credential** — attach your Anthropic API credential to `[Step03a]_Claude_Model`.

5b. **WhatsApp credential** — note: the Phone Number ID is set directly in the `[Step05]` and `[Step02e]` nodes (no env var needed). The credential below only holds the access token.

5b. **WhatsApp credential** — `[Step05]_Send_WhatsApp_Reply` uses the native `whatsApp` node with a **WhatsApp API** credential (`whatsAppApi`). Create one in n8n (Credentials → WhatsApp API) holding your Meta **access token** and Business Account ID, then attach it to the node. On import the node shows `REPLACE_WITH_CRED_ID` — just pick your credential from the dropdown. Use a System User permanent token for production (the dashboard's temporary token expires in 24h).

5c. **Supabase schema** — run this once in the Supabase SQL editor so the logging nodes have somewhere to write. **This is the same schema the dashboard is built against** — keep them in sync:
   ```sql
   create table if not exists conversations (
     id uuid primary key default gen_random_uuid(),
     phone text unique not null,
     started_at timestamptz default now(),
     last_message_at timestamptz,
     completed_at timestamptz,
     retention_until timestamptz,
     status text default 'in_progress',
     vendor_type text,
     first_name text, last_name text, business_name text,
     email text, vendor_number text,
     focus_area text, struggle text,
     ai_note text, practitioner text,
     created_at timestamptz default now()
   );
   create table if not exists events (
     id uuid primary key default gen_random_uuid(),
     phone text not null,
     step text not null,
     text text,
     created_at timestamptz default now()
   );
   create index if not exists idx_events_phone on events(phone);
   ```
   The `phone unique` constraint is what makes the per-turn upsert (`on_conflict=phone`) work — `started_at` is set once on first insert, later turns only update status/fields.

6. **Brevo contact attributes** — in Brevo (Contacts → Settings → Contact Attributes), create these custom attributes so the upsert populates them. Text type unless noted: `BUSINESS_NAME`, `VENDOR_NUMBER`, `VENDOR_TYPE`, `FOCUS_AREA`, `STRUGGLE`, `PRACTITIONER`, `AI_NOTE`, `SOURCE`, `INTAKE_DATE`, `EXT_ID`, `WHATSAPP`. (`FIRSTNAME`, `LASTNAME`, `SMS` already exist by default.) Attribute names in the code must match exactly — edit `[Step07]_Build_Brevo_Payload` if yours differ.

7. **Meta webhook setup** — in your Meta App dashboard → WhatsApp → Configuration → Webhooks:
   - **Callback URL:** `https://n8n-n8n.jimchy.easypanel.host/webhook/orbie/inbound`
   - **Verify token:** the exact value you set in `WA_VERIFY_TOKEN`
   - Click **Verify and Save**. Meta sends a GET request with `hub.challenge`; `[Step00]/[Step00b]` echo it back, completing verification.
   - Then **Subscribe** to the **messages** field.

   > Note: the GET verify node and the POST message node share the same path (`orbie/inbound`) but different HTTP methods — that's intentional and how Meta expects a single callback URL to behave.

   **Optional but recommended — verify-token check:** `[Step00b]` currently echoes the challenge unconditionally. To harden it, add an IF before it comparing `{{ $json.query['hub.verify_token'] }}` to `{{ $env.WA_VERIFY_TOKEN }}` and only respond on match.

8. **Activate** the workflow.

## Validation checklist

- [ ] Workflow imports without errors
- [ ] `WA_VERIFY_TOKEN`, `BREVO_API_KEY`, `BREVO_LIST_ID`, `SUPABASE_PROJECT_REF`, `SUPABASE_SERVICE_KEY` env vars set
- [ ] Links edited in Step04
- [ ] Team numbers set in Step02 (E.164 digits, no `+`)
- [ ] Anthropic credential attached
- [ ] WhatsApp API credential created and attached to Step05 (replacing `REPLACE_WITH_CRED_ID`)
- [ ] Supabase tables created (conversations + events) with `phone` unique constraint
- [ ] Brevo custom attributes created (matching the names in Step07)
- [ ] Meta webhook verified (GET handshake passes) and subscribed to **messages**
- [ ] Send "Hi" from a test number → vendor question; full happy path reaches warm close; contact appears in Brevo AND a `conversations` row shows status `lead_complete`
- [ ] Each inbound message creates an `events` row; `conversations` row updates in place (no duplicates per phone)
- [ ] Answer "No" → registration path; `conversations` row status `nonvendor_complete`, vendor_type `Non-Vendor`

## v1.1 — Practitioner routing, category lists & results email

Three things to configure for v1.1:

**A. Six Brevo lists (one per focus area) + a non-vendor list.** Create them in Brevo (Contacts → Lists), then paste each numeric list ID into the `CATEGORY_MAP` at the top of `[Step07]_Build_Brevo_Payload`. Set `NON_VENDOR_LIST` to the list ID for leads with no category.

**B. Practitioner mapping.** In that same `CATEGORY_MAP`, fill each category's `practitioner` (name) and `email`. The workflow assigns a practitioner deterministically by category; the AI also writes a short `aiNote` suggesting fit (and flags cross-category cases). Both appear in the results email and in Brevo (`PRACTITIONER`, `AI_NOTE`).

**C. Resend email.** Two senders are used: the internal email to Elmarie sends from `notifications@smallbusinesshelpdesk.co.za`, and the USER confirmation email sends from `notifications@bot.smallbusinesshelpdesk.co.za`. BOTH the root domain AND the `bot.` subdomain must be verified in Resend separately (each needs its own DNS records). Verify `smallbusinesshelpdesk.co.za` (add the SPF/DKIM DNS records they provide), create an API key, set it as `RESEND_API_KEY`. The results email sends from `notifications@smallbusinesshelpdesk.co.za` to `elmarie@smallbusinesshelpdesk.co.za` on every completed intake — branded HTML with suggested practitioner, AI note, and full lead detail.

**WhatsApp branding** (set in WhatsApp Manager, not the workflow): profile photo = circular `sbh` submark; display name = "Small Business Helpdesk"; complete About/category/website; pursue the green-tick verified badge. Every Orbie message now ends with an italic "_A Story Advantage Workflow_" signature (added in `[Step04]`).

## POPIA compliance (built in)

This is operational guidance, not legal advice — have your privacy policy and retention period reviewed by someone qualified. What the workflow now does:

- **Consent & purpose notice** — Orbie's first message states what data is collected, why, that it's never sold, that processing is under POPIA, and how to opt out, with a link to `[PRIVACY_LINK]`. The user must agree before any collection begins.
- **Opt-out / right to erasure** — replying **STOP** at any point triggers `[Step02c→d→e]`: the conversation row is deleted from Supabase and the user gets a confirmation. (Note: this deletes the Supabase record. Brevo deletion isn't automated here — see gaps below.)
- **Retention** — every conversation row is stamped `retention_until` (default **2 years** from last message; change in `[Step04]` to match your documented policy). The separate **`WF_SBHelpdesk_Retention_Cleanup__v1.0`** workflow runs daily at 02:00 and purges expired conversations + events.
- **Data minimisation in the dashboard** — stakeholders see aggregates only; PII and the free-text `struggle` stay behind auth in the team view (enforced by Supabase RLS).

### Things to set up / decide (not automatable here)

- **Publish a privacy policy** at the `[PRIVACY_LINK]` URL (edit it in `[Step04]`). It should name Small Business Helpdesk as responsible party, list the processors (Brevo, Supabase, Anthropic), and state the retention period.
- **Cross-border processing (POPIA s72):** Anthropic (Claude) and possibly Brevo/Supabase process data outside South Africa. Confirm your privacy policy discloses this and that you rely on a valid ground (consent / adequate protection).
- **n8n execution data:** message contents (including `struggle` text) persist in execution logs. Set `EXECUTIONS_DATA_PRUNE=true` and a short `EXECUTIONS_DATA_MAX_AGE` on your instance so PII isn't retained indefinitely there.
- **Brevo erasure on STOP:** currently STOP deletes the Supabase row but not the Brevo contact. If you want full erasure, add a Brevo `DELETE /v3/contacts/{identifier}` call into the opt-out branch.
- **Sensitive info:** the `struggle` field may capture special-category data. Keep RLS tight and consider not surfacing it beyond the assigned advisor.

## How Orbie closes a conversation

On the closing message, the agent appends two hidden lines:

```
COMPLETE_LEAD
DATA={"firstName":"...","lastName":"...","businessName":"...","email":"...","vendorNumber":"...","focusArea":"...","struggle":"..."}
```

`[Step04]` parses that JSON, strips both lines so the user never sees them, and passes the fields to `[Step07]`, which maps them onto Brevo attributes.

**Identifier logic:** Brevo keys contacts by email. Vendor leads always have an email, so they upsert by email. Non-vendors have no email, so they upsert by `ext_id` (their phone in E.164) — still tracked, still segmentable by the `Non-Vendor` Vendor Type. `updateEnabled: true` means a returning number updates rather than duplicates.

## Notes / next enhancements

- **The 24-hour customer service window (Cloud API).** Meta only lets you send free-form text replies within 24 hours of the user's last message. This whole flow is reply-driven, so a normal intake stays inside the window with no problem. But the "a human will be in touch within 24 hours" follow-up — if a teammate replies a day later — may fall *outside* it, in which case Meta will reject a plain text send and you must use a pre-approved **message template**. Plan the human follow-up as a template if it might land after 24h.
- **Anti-ban:** This is reactive 1:1 (one reply per inbound), so batch pacing isn't needed here — keep it in mind if you ever add broadcast follow-ups (which on Cloud API also require templates).
- **Brevo as trigger for follow-up:** since contacts land in a list, you can fire a Brevo automation off list membership for the SLA.
- **Interactive messages:** the normalizer already reads button/list replies, so you can later upgrade the focus-area menu (steps B3) from a numbered text list to a proper Cloud API interactive list message for a cleaner UX.
