# Daily 100-email customer outreach

**From:** `contact@aipass.space` (Hostinger SMTP)  
**List:** `docs/sales/daily-100-prospects.csv`  
**Runner:** `scripts/send-daily-outreach.py`  
**Cap:** 100 sends / calendar day  
**BCC:** `contact@aipass.space`

## Cadence

1. Each day run (CI secret or local env):

```bash
export SMTP_HOST=smtp.hostinger.com
export SMTP_PORT=465
export SMTP_USER='contact@aipass.space'
export SMTP_PASS='…'   # from Hostinger mailbox
export MAIL_FROM=contact@aipass.space
export MAIL_BCC=contact@aipass.space
python3 scripts/send-daily-outreach.py --limit 100
```

2. Dry run first: `python3 scripts/send-daily-outreach.py --dry-run --limit 100`
3. Wait **5 business days** before one follow-up to non-responders.
4. On reply “stop” / bounce / press-only complaint: mark `SKIP` in the CSV and do not resend.

## Offer

Pilot wedge in every mail: Connect 1–2 systems → company twin → Company Harness agents with confirmation gates.

Live links: `/demo`, `/connect`, `/company-os`, `/book-demo`

## Safety

- Skip `SENT_PRIOR`, `SKIP`, `CAREFUL` rows.
- Do not scrape personal inboxes; use published partnership / info contacts only.
- Prefer P0 then P1 ordering inside the daily batch.
- Hostinger `hostinger_out_ratelimit` (SMTP 451) stops the runner mid-batch. Wait 30–60 minutes or resume the next calendar day; state file prevents duplicates.

## First wave (2026-11-10)

- Sent **49** READY prospects from `contact@aipass.space` before Hostinger outbound rate limit.
- Remaining READY rows stay in `daily-100-prospects.csv` for the next run (`--limit 100` resumes automatically).
