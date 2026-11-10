#!/usr/bin/env python3
"""
Daily Micro1-style customer outreach from contact@aipass.space.

Always shares transparent AI-Pass prices (seats + pilot packages).

Usage:
  set -a; source /tmp/smtp-deploy.env; set +a
  python3 scripts/send-daily-outreach.py --dry-run
  python3 scripts/send-daily-outreach.py --limit 100
  python3 scripts/send-daily-outreach.py --mode pricing-followup --limit 50
  python3 scripts/send-daily-outreach.py --csv docs/sales/ops-reality-prospects.csv

State: docs/sales/daily-outreach-state.json
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import smtplib
import ssl
import sys
import time
from datetime import date, datetime, timezone
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CSV = ROOT / "docs/sales/daily-100-prospects.csv"
STATE_PATH = ROOT / "docs/sales/daily-outreach-state.json"
LOG_PATH = ROOT / "docs/sales/daily-outreach-log.md"
PRICING_PATH = ROOT / "docs/sales/pricing.md"

SUBJECT_INTRO = "AI-Pass prices + twin pilot for {company} (from €8k / $49/mo)"
SUBJECT_PRICING = "AI-Pass pricing for {company} — Twin Starter from €8,000"

PRICE_BLOCK = """Transparent pricing (list):
• Platform seats: Free $0 · Professional $49/user/mo · Enterprise custom
• Twin Starter pilot (2 weeks): from €8,000 (up to €15,000)
• Twin + Graph (4 weeks): from €20,000
• Ops Reality co-build: from €25,000
• Lab Eval Sprint: from €15,000
Full sheet on request — reply “pricing” or book a 15-min walkthrough."""

BODY_INTRO = """Hello {company} team,

I am reaching out from AI-Pass (https://aipass.space) the Micro1-style way: clear offer, clear prices, short pilot.

AI-Pass is enterprise AI infrastructure for digital twins (employees, apps, machines), Connect for your APIs/ERP/CRM, Company Harness for always-on agents with confirmation gates, and Graph Builder that only accepts facts with evidence.

Suggested pilot for you ({wedge}):
• Connect 1–2 systems into a twin
• Route work through My AI-Pass harness
• Keep humans on irreversible actions

{prices}

Live demo: https://aipass.space/demo
Connect: https://aipass.space/connect
Company Harness: https://aipass.space/company-os
Pricing on site: https://aipass.space/#pricing
Book 15 min: https://aipass.space/book-demo

If this is the wrong inbox, please forward to partnerships / digital innovation — or reply “stop” and we will not write again.

Best regards,
AI-Pass Partnerships
contact@aipass.space
https://aipass.space
"""

BODY_PRICING_FOLLOWUP = """Hello {company} team,

Quick follow-up with our current list prices so you can share internally without a call.

{prices}

Suggested next step for {company} ({wedge}): Twin Starter — Connect one system, stand up one twin slice, harness with confirmation gates (2 weeks, from €8,000).

Book 15 min: https://aipass.space/book-demo
Or reply with the right owner and we will only write them once.

Reply “stop” to opt out.

AI-Pass Partnerships
contact@aipass.space
https://aipass.space
"""


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"sent": {}, "priced": {}, "days": {}}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def load_prospects(csv_path: Path) -> list[dict]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def persist_csv_statuses(csv_path: Path, state: dict, mode: str) -> None:
    prospects = load_prospects(csv_path)
    if not prospects:
        return
    by_rank = {r["rank"]: r for r in prospects}
    source = state.get("priced" if mode == "pricing-followup" else "sent", {})
    for rank, meta in source.items():
        if rank not in by_rank:
            continue
        status = (by_rank[rank].get("status") or "").upper()
        if status in {"SKIP", "CAREFUL", "SENT_PRIOR"}:
            continue
        prefix = "PRICED" if mode == "pricing-followup" else "SENT"
        by_rank[rank]["status"] = f"{prefix} {meta['at'][:10]}"
        by_rank[rank]["next_action"] = (
            "Wait 5 business days" if mode == "pricing-followup" else "Send pricing follow-up day 5"
        )
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(prospects[0].keys()))
        writer.writeheader()
        writer.writerows(prospects)


def _channel_allows_email(row: dict) -> bool:
    """Forms first: email only when no usable form / explicit fallback."""
    channel = (row.get("preferred_channel") or "EMAIL").upper()
    fallback = (row.get("email_fallback") or "yes").lower()
    if channel == "FORM" and fallback in {"no", "false", "0"}:
        return False
    return True


def eligible_intro(row: dict, state: dict) -> bool:
    status = (row.get("status") or "").upper()
    if status in {"SKIP", "SENT_PRIOR", "CAREFUL", "BOUNCE", "HOLD_FORM"}:
        return False
    if status.startswith("SENT") or status.startswith("PRICED") or status.startswith("FORM"):
        return False
    if not _channel_allows_email(row):
        return False
    if (row.get("email_valid") or "").lower() == "no":
        return False
    email = (row.get("email_primary") or "").strip()
    if not email or "@" not in email:
        return False
    if row["rank"] in state.get("sent", {}):
        return False
    return True


def eligible_pricing_followup(row: dict, state: dict) -> bool:
    status = (row.get("status") or "").upper()
    if status in {"SKIP", "SENT_PRIOR", "CAREFUL", "BOUNCE", "HOLD_FORM"}:
        return False
    if not _channel_allows_email(row):
        return False
    if (row.get("email_valid") or "").lower() == "no":
        return False
    email = (row.get("email_primary") or "").strip()
    if not email or "@" not in email:
        return False
    rank = row["rank"]
    if rank not in state.get("sent", {}):
        # allow CSV SENT without state seed
        if not status.startswith("SENT"):
            return False
    if rank in state.get("priced", {}):
        return False
    return True


def smtp_connect():
    host = os.environ["SMTP_HOST"]
    port = int(os.environ.get("SMTP_PORT", "465"))
    user = os.environ["SMTP_USER"]
    password = os.environ["SMTP_PASS"]
    context = ssl.create_default_context()
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, context=context, timeout=60)
    else:
        server = smtplib.SMTP(host, port, timeout=60)
        server.starttls(context=context)
    server.login(user, password)
    return server


def smtp_close(server) -> None:
    if server is None:
        return
    try:
        server.quit()
    except Exception:
        try:
            server.close()
        except Exception:
            pass


def build_message(row: dict, mode: str) -> EmailMessage:
    msg = EmailMessage()
    mail_from = os.environ.get("MAIL_FROM", "contact@aipass.space")
    company = row["company"]
    wedge = row.get("wedge") or "enterprise twin + harness"
    msg["From"] = f"AI-Pass Partnerships <{mail_from}>"
    msg["To"] = row["email_primary"].strip()
    if row.get("email_alt"):
        msg["Cc"] = row["email_alt"].strip()
    bcc = os.environ.get("MAIL_BCC", mail_from)
    if bcc:
        msg["Bcc"] = bcc
    if mode == "pricing-followup":
        msg["Subject"] = SUBJECT_PRICING.format(company=company)
        body = BODY_PRICING_FOLLOWUP.format(
            company=company, wedge=wedge, prices=PRICE_BLOCK
        )
    else:
        msg["Subject"] = SUBJECT_INTRO.format(company=company)
        body = BODY_INTRO.format(company=company, wedge=wedge, prices=PRICE_BLOCK)
    msg["Reply-To"] = mail_from
    msg.set_content(body)
    return msg


def append_log(lines: list[str], sent: int, failures: int) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    prev = LOG_PATH.read_text() if LOG_PATH.exists() else "# Daily outreach log\n\n"
    LOG_PATH.write_text(
        prev + "\n".join(lines) + f"\n\nSent this run: {sent}. Failures: {failures}.\n\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--sleep", type=float, default=5.0)
    parser.add_argument("--backoff", type=float, default=120.0)
    parser.add_argument(
        "--mode",
        choices=("intro", "pricing-followup"),
        default="intro",
        help="intro = new READY rows with prices; pricing-followup = re-share prices to SENT",
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=DEFAULT_CSV,
        help="Prospect CSV path",
    )
    args = parser.parse_args()
    csv_path = args.csv if args.csv.is_absolute() else ROOT / args.csv

    for key in ("SMTP_HOST", "SMTP_USER", "SMTP_PASS"):
        if not args.dry_run and not os.environ.get(key):
            raise SystemExit(f"Missing {key}")

    state = load_state()
    state.setdefault("priced", {})
    today = date.today().isoformat()
    already_today = state.get("days", {}).get(today, 0)
    remaining = max(0, args.limit - already_today)
    if remaining == 0:
        print(f"Daily cap reached for {today} ({already_today})", flush=True)
        return 0

    if args.mode == "pricing-followup":
        rows = [r for r in load_prospects(csv_path) if eligible_pricing_followup(r, state)]
    else:
        rows = [r for r in load_prospects(csv_path) if eligible_intro(r, state)]

    rows.sort(
        key=lambda r: (
            0 if r.get("priority") == "P0" else 1 if r.get("priority") == "P1" else 2,
            int(r["rank"]),
        )
    )
    batch = rows[:remaining]
    print(
        f"mode={args.mode} csv={csv_path.name} eligible={len(rows)} "
        f"sending={len(batch)} dry_run={args.dry_run} already_today={already_today}",
        flush=True,
    )
    if not batch:
        return 0

    # Mandatory pre-send email validation (syntax + MX + SMTP RCPT probe).
    sys.path.insert(0, str(ROOT / "scripts"))
    from validate_prospect_emails import (  # type: ignore
        load_cache,
        save_cache,
        validate_email,
    )

    vcache = load_cache()
    validated_batch: list[dict] = []
    for row in batch:
        email = row["email_primary"].strip()
        result = validate_email(email, smtp_probe=True, cache=vcache)
        if not result.ok:
            print(f"SKIP_INVALID {row['rank']} {row['company']} <{email}> {result.reason}", flush=True)
            row["email_valid"] = "no"
            row["email_check_reason"] = result.reason
            row["status"] = "BOUNCE"
            row["next_action"] = f"Fix email or use form ({result.reason})"
            continue
        row["email_valid"] = "yes"
        row["email_check_reason"] = result.reason
        validated_batch.append(row)
    save_cache(vcache)
    # Persist bounce marks
    all_rows = load_prospects(csv_path)
    by_rank = {r["rank"]: r for r in all_rows}
    for row in batch:
        if row["rank"] in by_rank:
            by_rank[row["rank"]].update(
                {
                    k: row[k]
                    for k in ("email_valid", "email_check_reason", "status", "next_action")
                    if k in row and row.get(k)
                }
            )
    if all_rows:
        fields = list(all_rows[0].keys())
        for col in ("email_valid", "email_check_reason", "preferred_channel", "email_fallback"):
            if col not in fields:
                fields.append(col)
        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(all_rows)

    batch = validated_batch
    print(f"validated_sending={len(batch)}", flush=True)
    if not batch:
        return 0

    server = None if args.dry_run else smtp_connect()
    sent = 0
    failures: list[str] = []
    stop_batch = False
    log_lines = [
        f"## {today} {datetime.now(timezone.utc).strftime('%H:%M')} UTC — "
        f"{'dry-run' if args.dry_run else 'send'} mode={args.mode} csv={csv_path.name}"
    ]

    try:
        for row in batch:
            if stop_batch:
                break
            to = row["email_primary"].strip()
            label = f"{row['rank']} {row['company']} <{to}>"
            if args.dry_run:
                print("DRY", label, flush=True)
                log_lines.append(f"- DRY {label}")
                sent += 1
                continue

            attempt = 0
            while attempt < 3:
                attempt += 1
                try:
                    if server is None:
                        server = smtp_connect()
                    server.send_message(build_message(row, args.mode))
                    now = datetime.now(timezone.utc).isoformat()
                    meta = {
                        "company": row["company"],
                        "email": to,
                        "at": now,
                        "mode": args.mode,
                        "csv": csv_path.name,
                    }
                    if args.mode == "pricing-followup":
                        state.setdefault("priced", {})[row["rank"]] = meta
                    else:
                        state.setdefault("sent", {})[row["rank"]] = meta
                        # intro already includes prices
                        state.setdefault("priced", {})[row["rank"]] = meta
                    state.setdefault("days", {})[today] = already_today + sent + 1
                    save_state(state)
                    persist_csv_statuses(csv_path, state, args.mode)
                    sent += 1
                    print("SENT", label, flush=True)
                    log_lines.append(f"- SENT {label}")
                    time.sleep(args.sleep)
                    break
                except smtplib.SMTPDataError as exc:
                    smtp_close(server)
                    server = None
                    code, resp = exc.smtp_code, (exc.smtp_error or b"").decode(
                        errors="replace"
                    )
                    if code == 451 and "ratelimit" in resp.lower():
                        print(f"RATE_LIMIT stop at {label}: {resp}", flush=True)
                        log_lines.append(f"- RATE_LIMIT stop at {label}: {resp}")
                        failures.append(f"{label}: rate limit {resp}")
                        stop_batch = True
                        break
                    wait = args.backoff * attempt
                    print(
                        f"RETRY {label} SMTPDataError wait={wait:.0f}s attempt={attempt} {resp}",
                        flush=True,
                    )
                    log_lines.append(f"- RETRY {label}: SMTPDataError wait={wait:.0f}s")
                    time.sleep(wait)
                    if attempt >= 3:
                        failures.append(f"{label}: {exc}")
                        print("FAIL", label, "SMTPDataError", flush=True)
                        log_lines.append(f"- FAIL {label}: SMTPDataError")
                except (smtplib.SMTPServerDisconnected, OSError) as exc:
                    smtp_close(server)
                    server = None
                    wait = args.backoff * attempt
                    print(
                        f"RETRY {label} {type(exc).__name__} wait={wait:.0f}s attempt={attempt}",
                        flush=True,
                    )
                    log_lines.append(
                        f"- RETRY {label}: {type(exc).__name__} wait={wait:.0f}s"
                    )
                    time.sleep(wait)
                    if attempt >= 3:
                        failures.append(f"{label}: {exc}")
                        print("FAIL", label, type(exc).__name__, flush=True)
                        log_lines.append(f"- FAIL {label}: {type(exc).__name__}")
                except Exception as exc:  # noqa: BLE001
                    failures.append(f"{label}: {exc}")
                    print("FAIL", label, type(exc).__name__, flush=True)
                    log_lines.append(f"- FAIL {label}: {type(exc).__name__}")
                    break
    finally:
        smtp_close(server)

    if not args.dry_run:
        state.setdefault("days", {})[today] = already_today + sent
        save_state(state)
        persist_csv_statuses(csv_path, state, args.mode)

    append_log(log_lines, sent, len(failures))
    print(f"done sent={sent} failures={len(failures)}", flush=True)
    if PRICING_PATH.exists():
        print(f"pricing_sheet={PRICING_PATH}", flush=True)
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
