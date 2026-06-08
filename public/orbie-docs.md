# Orbie — WhatsApp Intake Bot

Orbie is the Small Business Helpdesk's WhatsApp assistant. It qualifies incoming leads, captures their details, assigns a focus area and practitioner, then emails the team with a summary and sends a confirmation to the client.

**Current version:** v2.2.0 · Model: Claude Haiku 4.5 · Timezone: Africa/Johannesburg

---

## How a conversation works

### Vendor leads (registered CoCT vendors)

1. Orbie asks whether they are a registered vendor
2. Captures vendor number, full name, business name and email
3. Presents the 6 focus-area options (see below)
4. Asks them to describe their main challenge
5. Closes warmly, promises a practitioner will be in touch within 24 hours, and invites them to the WhatsApp Channel
6. Sends a branded results email to the team and a confirmation to the client

### Non-vendor leads

1. Orbie identifies that they are not a registered vendor
2. Walks them through the CoCT registration steps with a video and portal link
3. Closes with a Channel invite
4. Logs the conversation as `nonvendor_complete`

---

## The 6 focus areas

| Option shown to user | Dashboard label |
|---|---|
| How to sell, negotiate and present my product or service | Sell & negotiate |
| Understanding business finances, cashflow management or financial compliance | Finances & compliance |
| Finding customers and promoting my business | Finding customers |
| Using AI to be more productive and market my business | AI productivity |
| Completing RFPs or Tenders | RFPs & Tenders |
| How to lead my business or deal with burnout and stress | Leadership & burnout |

---

## Practitioner assignment

Orbie assigns a practitioner automatically based on focus area. The assignment and a short AI-written **AI note** appear in:

- The results email to Elmarie
- The lead drawer on the Team Dashboard
- The AI Note Feed card on the dashboard

The AI note flags cross-category concerns or anything that might need a different practitioner.

---

## Conversation statuses

| Status | Meaning |
|---|---|
| `in_progress` | Conversation started, not yet closed |
| `lead_complete` | Vendor lead fully captured and closed |
| `nonvendor_complete` | Non-vendor walk-through completed |
| `abandoned` | No response after final prompt |

---

## POPIA & opt-outs

- Orbie opens every conversation with a consent notice explaining what data is collected, why, and how to opt out.
- If a user replies **STOP** at any point, their record is deleted from the database and they receive a confirmation.
- Every record stores a **data retained until** date (2 years from last message), visible in the lead drawer.
- Struggle descriptions and personal details are only visible in the Team view — stakeholders see aggregates only.

> The Opt-outs counter on the dashboard reflects STOP events logged to the audit table. A deleted record leaves no trace, so the true count may be slightly higher.

---

## The 24-hour reply window

Meta's WhatsApp Cloud API only allows free-form replies within **24 hours** of the user's last message. Orbie's intake happens within this window automatically. However, if a practitioner follows up a day later, that reply may be rejected unless it uses a pre-approved **message template**. Plan human follow-ups as templates if they might arrive after 24h.

The **Reply window closing** card on the dashboard flags in-progress conversations with fewer than 4 hours left.

---

## Results email

Two emails are sent on every completed vendor intake:

- **Team notification** → `elmarie@smallbusinesshelpdesk.co.za` — full lead details, AI note, and suggested practitioner.
- **Client confirmation** → the lead's email address — branded confirmation of next steps.

---

## Voice notes

Orbie transcribes voice messages automatically (via Groq Whisper). The transcription is processed identically to a text reply — voice-note intakes complete the funnel just like text ones.

---

## Automatic data cleanup

A separate daily workflow (`WF_SBHelpdesk_Retention_Cleanup`) runs at 02:00 and permanently deletes records whose **data retained until** date has passed. No manual action required.
