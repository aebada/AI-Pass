# AI provider Digital Twin collaboration outreach

**List:** `docs/sales/ai-providers-twin-collab.csv`  
**From:** `contact@aipass.space`  
**Offer:** Collaborate so provider models show better results inside AI-Pass digital twins (personal/employee/business) + Twin Autopilot (WhatsApp, vault, harness gates).

## Pitch (short)

AI-Pass is building digital twins that sit on Connect + Company Harness. We want to collaborate so your models power twin chat, proactive follow-ups, and governed actions — with measurable evals in Intelligence Lab.

Transparent pricing: seats from $49/user/mo · Twin Starter from €8k · https://aipass.space/book-demo

## Policy

- Forms first when usable.
- Never DeepMind/Meta **press** as the primary sales channel (press = auto-ACK only).
- Validate MX before SMTP.
- Cap ~50 sends/window (Hostinger).

## Run (when SMTP secrets available)

```bash
set -a; source /tmp/smtp-deploy.env; set +a
python3 scripts/validate_prospect_emails.py --csv docs/sales/ai-providers-twin-collab.csv
python3 scripts/send-daily-outreach.py --csv docs/sales/ai-providers-twin-collab.csv --mode intro --limit 20
```

## Status

SMTP secrets requested from environment (2026-11-25). Sends blocked until `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` are available on the agent.
