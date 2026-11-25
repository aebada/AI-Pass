# Twin Autopilot — Instinct functions in AI-Pass

First-party ownership of Instinct-class personal/employee agent capabilities, wired to the digital twin, Connect, WhatsApp, and Company Harness.

## Feature map

| Instinct cue | AI-Pass |
|---|---|
| Text / WhatsApp / call — no new UI | WhatsApp Cloud API twin channel |
| Cloud computer + browser | Twin cloud session (beta) under Harness |
| Secure vault for logins | Vault credential *refs* only (host secrets) |
| Proactive follow-ups | Proactive task queue + WhatsApp/email notify |
| Concierge outbound calls | Concierge call requests + approve-before-dial |
| Trusted Person network | Trusted twin peers + explicit approve |
| Payment approval / one-time cards | PaymentApproval gates (no spend without confirm) |
| Group coordination | Group threads across approved twins (beta) |
| Account connectors | Connect catalog (Workspace, Slack, CRM, ERP) |

## Surfaces

| Surface | Path |
|---|---|
| Product | `/twin-autopilot` |
| Workspace | `/workspace/twin-autopilot` |
| WhatsApp setup | `/workspace/connect/whatsapp` |
| API | `/api/v1/twin-autopilot/*` |
| Package | `@ai-pass/twin-autopilot` |

## Why better than consumer Instinct alone

1. Twin sits on **company Connect + graph**, not only personal inbox/calendar.
2. **Harness** gates irreversible actions (spend, send, delete, external posts).
3. Same chat-first UX via WhatsApp — enterprise-ready.
