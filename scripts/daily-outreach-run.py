#!/usr/bin/env python3
"""
Daily Micro1 outreach orchestrator.

Policy (user rule):
1. Prefer company contact forms when available.
2. Use email only when the company has no usable form (or form is blocked/WAF).
3. Validate email (syntax + MX + SMTP probe) before every send.

Usage:
  set -a; source /tmp/smtp-deploy.env; set +a
  python3 scripts/daily-outreach-run.py --dry-run
  python3 scripts/daily-outreach-run.py --submit-forms --send-email --limit 20
"""

from __future__ import annotations

import argparse
import csv
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_CSV = ROOT / "docs/sales/company-contact-forms.csv"
PROSPECTS_CSV = ROOT / "docs/sales/daily-100-prospects.csv"


def companies_with_forms() -> set[str]:
    if not FORMS_CSV.exists():
        return set()
    out = set()
    for r in csv.DictReader(FORMS_CSV.open(encoding="utf-8")):
        if (r.get("channel") or "").upper() != "FORM":
            continue
        status = (r.get("status") or "").upper()
        # usable or not-yet-tried forms block email
        if status in {"READY", "RETRY", "MAPPED", "SUBMITTED"}:
            out.add(r["company"])
        # BLOCKED_OR_COMPLEX → email fallback allowed (not in set)
    return out


def annotate_email_fallback() -> None:
    """Mark prospect rows: FORM-first companies should not get cold email."""
    form_cos = companies_with_forms()
    rows = list(csv.DictReader(PROSPECTS_CSV.open(encoding="utf-8")))
    if not rows:
        return
    fields = list(rows[0].keys())
    for col in ("preferred_channel", "email_fallback"):
        if col not in fields:
            fields.append(col)
    for r in rows:
        if r["company"] in form_cos:
            r["preferred_channel"] = "FORM"
            r["email_fallback"] = "no"
            # Don't send intro email while form path is active
            status = (r.get("status") or "").upper()
            if status == "READY":
                r["next_action"] = "Use contact form first"
        else:
            if not r.get("preferred_channel"):
                r["preferred_channel"] = "EMAIL"
            r["email_fallback"] = "yes"
            if (r.get("status") or "").upper() == "READY":
                r["next_action"] = "Validate email then send"
    with PROSPECTS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"annotated form_first={len(form_cos)} email_fallback_candidates="
          f"{sum(1 for r in rows if r.get('email_fallback')=='yes')}", flush=True)


def run(cmd: list[str]) -> int:
    print("+", " ".join(cmd), flush=True)
    return subprocess.call(cmd, cwd=str(ROOT))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--submit-forms", action="store_true")
    parser.add_argument("--discover-forms", action="store_true")
    parser.add_argument("--send-email", action="store_true")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--skip-validate", action="store_true")
    args = parser.parse_args()

    annotate_email_fallback()

    # 1) Forms first
    if args.discover_forms or args.submit_forms:
        cmd = [
            sys.executable,
            "scripts/submit-contact-forms.py",
            "--limit",
            str(args.limit),
        ]
        if args.submit_forms and not args.dry_run:
            cmd.append("--submit")
        else:
            cmd.append("--discover")
        rc = run(cmd)
        if rc != 0:
            print(f"form step rc={rc} (continuing to email fallback)", flush=True)

    # Re-annotate after form attempts (blocked forms become email-eligible)
    annotate_email_fallback()

    if not args.send_email and not args.dry_run:
        print("done (forms only)", flush=True)
        return 0

    # 2) Validate emails for EMAIL-fallback READY rows
    if not args.skip_validate:
        rc = run(
            [
                sys.executable,
                "scripts/validate_prospect_emails.py",
                "--csv",
                str(PROSPECTS_CSV),
                "--smtp-probe",
                "--write-csv",
            ]
        )
        print(f"validate rc={rc}", flush=True)

    # 3) Email only companies without active form path
    # Temporarily mark FORM-first READY as CAREFUL-equivalent by filtering in a wrapper CSV? 
    # Simpler: update send script via env flag — patch eligibility here by setting status HOLD_FORM
    rows = list(csv.DictReader(PROSPECTS_CSV.open(encoding="utf-8")))
    fields = list(rows[0].keys()) if rows else []
    form_cos = companies_with_forms()
    changed = False
    for r in rows:
        if r["company"] in form_cos and (r.get("status") or "").upper() == "READY":
            r["status"] = "HOLD_FORM"
            r["next_action"] = "Form path active — no email"
            changed = True
    if changed:
        with PROSPECTS_CSV.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(rows)

    email_cmd = [
        sys.executable,
        "scripts/send-daily-outreach.py",
        "--limit",
        str(args.limit),
        "--sleep",
        "5",
    ]
    if args.dry_run or not args.send_email:
        email_cmd.append("--dry-run")
    rc = run(email_cmd)

    # Restore HOLD_FORM → READY for next form attempts
    rows = list(csv.DictReader(PROSPECTS_CSV.open(encoding="utf-8")))
    for r in rows:
        if (r.get("status") or "").upper() == "HOLD_FORM":
            r["status"] = "READY"
            r["next_action"] = "Use contact form first"
    with PROSPECTS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print(f"done email_rc={rc}", flush=True)
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
