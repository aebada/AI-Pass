# Form-first outreach (then email)

**Rule:** If the company has a contact / partner / startup form, use the form.  
**Fallback:** Only if there is no usable form (or the form is WAF-blocked / unfillable), validate the email, then send.

## Why

Generic inboxes bounce (`partner@bmw.com` DSN 5.1.0, `info@infineon.com` rejected by smtp2). Official forms reach the right queue and match how BMW Startup Garage, Infineon Co-Innovation, Telekom GK, etc. want inbound.

## Daily run

```bash
set -a; source /tmp/smtp-deploy.env; set +a
# Discover/map forms
python3 scripts/daily-outreach-run.py --discover-forms --limit 20
# Submit forms + email only companies without forms
python3 scripts/daily-outreach-run.py --submit-forms --send-email --limit 20
```

Or stepwise:

```bash
python3 scripts/submit-contact-forms.py --submit --company "Deutsche Telekom"
python3 scripts/validate_prospect_emails.py --csv docs/sales/daily-100-prospects.csv --smtp-probe --write-csv
python3 scripts/send-daily-outreach.py --limit 50   # skips FORM-first + invalid emails
```

## Catalog

- `docs/sales/company-contact-forms.csv` — form URLs + status  
- `docs/sales/form-outreach-state.json` — submitted / discovered  
- Screenshots: `docs/sales/form-screenshots/`

## Email safety

Before any SMTP send: syntax → MX → SMTP RCPT probe → block known bounces.  
Invalid → `status=BOUNCE` and switch to form if listed.
