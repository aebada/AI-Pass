# Daily customer outreach (form-first)

**From:** `contact@aipass.space`  
**Rule:** Use the company **contact form** when one exists. Use **email only** if there is no usable form (missing, WAF-blocked, or too complex to automate).

## Run

```bash
set -a; source /tmp/smtp-deploy.env; set +a
python3 scripts/daily-outreach-run.py --submit-forms --send-email --limit 20
```

## Pieces

| Piece | Path |
|---|---|
| Form catalog | `docs/sales/company-contact-forms.csv` |
| Form submitter | `scripts/submit-contact-forms.py` |
| Orchestrator | `scripts/daily-outreach-run.py` |
| Email validator | `scripts/validate_prospect_emails.py` |
| Email sender | `scripts/send-daily-outreach.py` |
| Pricing | `docs/sales/pricing.md` |
| Policy | `docs/sales/form-first-outreach.md` |

## Email safety

Before SMTP: syntax → MX → SMTP RCPT probe → known-bounce blocklist.  
Invalid addresses get `status=BOUNCE` (e.g. `partner@bmw.com`, `info@infineon.com`).

## Notes

- Telekom GK form (`https://www.telekom.de/gk/kontakt`) is preferred but CloudFront WAF blocks this environment → email fallback after validate.
- BMW Startup Garage form is preferred; wizard is multi-step — if automation fails, email `bmw.startup.garage@bmw.com`.
- Cap ~50 sends/window (Hostinger rate limit); state file prevents duplicates.
