#!/usr/bin/env python3
"""
Daily customer outreach: send up to 100 pilot emails from contact@aipass.space.

Usage:
  set -a; source /tmp/smtp-deploy.env; set +a   # or export SMTP_* in CI secrets
  python3 scripts/send-daily-outreach.py --dry-run
  python3 scripts/send-daily-outreach.py --limit 100

State file: docs/sales/daily-outreach-state.json (sent ids + dates)
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import smtplib
import ssl
import time
from datetime import date, datetime, timezone
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "docs/sales/daily-100-prospects.csv"
STATE_PATH = ROOT / "docs/sales/daily-outreach-state.json"
LOG_PATH = ROOT / "docs/sales/daily-outreach-log.md"

SUBJECT = "AI-Pass pilot — company twin harness + Connect (15 min)"

BODY_TEMPLATE = """Hello {company} team,

I am reaching out from AI-Pass (https://aipass.space) about a short pilot.

AI-Pass is enterprise AI infrastructure for digital twins (employees, apps, machines), a Connect layer for your APIs/ERP/CRM, a Company Harness for always-on agents, and a Graph Builder that judges every fact against evidence.

Suggested pilot ({wedge}):
• Connect 1–2 systems into a twin
• Route work through My AI-Pass harness
• Keep human confirmation on irreversible actions

Live walkthrough: https://aipass.space/demo
Connect: https://aipass.space/connect
Company Harness: https://aipass.space/company-os
Book 15 min: https://aipass.space/book-demo

If this is the wrong inbox, please forward to partnerships / digital innovation — or reply “stop” and we will not write again.

Best regards,
AI-Pass Partnerships
contact@aipass.space
https://aipass.space
"""


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"sent": {}, "days": {}}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def persist_csv_statuses(state: dict) -> None:
    prospects = load_prospects()
    if not prospects:
        return
    by_rank = {r["rank"]: r for r in prospects}
    for rank, meta in state.get("sent", {}).items():
        if rank in by_rank:
            by_rank[rank]["status"] = f"SENT {meta['at'][:10]}"
            by_rank[rank]["next_action"] = "Wait 5 business days"
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(prospects[0].keys()))
        writer.writeheader()
        writer.writerows(prospects)


def load_prospects() -> list[dict]:
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def eligible(row: dict, state: dict) -> bool:
    status = (row.get("status") or "").upper()
    if status in {"SKIP", "SENT_PRIOR", "CAREFUL"}:
        return False
    if status.startswith("SENT") and "READY" not in status:
        return False
    email = (row.get("email_primary") or "").strip()
    if not email or "@" not in email:
        return False
    key = row["rank"]
    if key in state.get("sent", {}):
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


def build_message(row: dict) -> EmailMessage:
    msg = EmailMessage()
    mail_from = os.environ.get("MAIL_FROM", "contact@aipass.space")
    msg["From"] = f"AI-Pass Partnerships <{mail_from}>"
    msg["To"] = row["email_primary"].strip()
    if row.get("email_alt"):
        msg["Cc"] = row["email_alt"].strip()
    bcc = os.environ.get("MAIL_BCC", mail_from)
    if bcc:
        msg["Bcc"] = bcc
    msg["Subject"] = SUBJECT
    msg["Reply-To"] = mail_from
    msg.set_content(
        BODY_TEMPLATE.format(
            company=row["company"],
            wedge=row.get("wedge") or "enterprise twin + harness",
        )
    )
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
    parser.add_argument("--sleep", type=float, default=2.0, help="Seconds between sends")
    parser.add_argument(
        "--backoff",
        type=float,
        default=45.0,
        help="Seconds to wait after SMTPDataError / disconnect before reconnect",
    )
    args = parser.parse_args()

    for key in ("SMTP_HOST", "SMTP_USER", "SMTP_PASS"):
        if not args.dry_run and not os.environ.get(key):
            raise SystemExit(f"Missing {key}")

    state = load_state()
    today = date.today().isoformat()
    already_today = state.get("days", {}).get(today, 0)
    remaining = max(0, args.limit - already_today)
    if remaining == 0:
        print(f"Daily cap reached for {today} ({already_today})")
        return 0

    rows = [r for r in load_prospects() if eligible(r, state)]
    rows.sort(
        key=lambda r: (
            0 if r.get("priority") == "P0" else 1 if r.get("priority") == "P1" else 2,
            int(r["rank"]),
        )
    )
    batch = rows[:remaining]
    print(
        f"eligible={len(rows)} sending={len(batch)} dry_run={args.dry_run} already_today={already_today}",
        flush=True,
    )

    if not batch:
        return 0

    server = None if args.dry_run else smtp_connect()
    sent = 0
    failures: list[str] = []
    stop_batch = False
    log_lines = [
        f"## {today} {datetime.now(timezone.utc).strftime('%H:%M')} UTC — "
        f"{'dry-run' if args.dry_run else 'send'}"
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
                    server.send_message(build_message(row))
                    now = datetime.now(timezone.utc).isoformat()
                    state.setdefault("sent", {})[row["rank"]] = {
                        "company": row["company"],
                        "email": to,
                        "at": now,
                    }
                    state.setdefault("days", {})[today] = already_today + sent + 1
                    save_state(state)
                    persist_csv_statuses(state)
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
                    # Hostinger outbound quota — stop the batch; resume later / next day.
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
                    log_lines.append(
                        f"- RETRY {label}: SMTPDataError wait={wait:.0f}s"
                    )
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
                except Exception as exc:  # noqa: BLE001 — record and continue
                    failures.append(f"{label}: {exc}")
                    print("FAIL", label, type(exc).__name__, flush=True)
                    log_lines.append(f"- FAIL {label}: {type(exc).__name__}")
                    break
    finally:
        smtp_close(server)

    if not args.dry_run:
        state.setdefault("days", {})[today] = already_today + sent
        save_state(state)
        persist_csv_statuses(state)

    append_log(log_lines, sent, len(failures))
    print(f"done sent={sent} failures={len(failures)}", flush=True)
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
