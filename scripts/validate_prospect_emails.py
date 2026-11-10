#!/usr/bin/env python3
"""
Validate prospect emails before outreach.

Checks (in order):
1. Syntax
2. Domain not disposable / blocked
3. MX records exist
4. Optional SMTP RCPT TO probe against primary MX (catches many 5.1.x rejects)

Usage:
  python3 scripts/validate_prospect_emails.py --csv docs/sales/daily-100-prospects.csv
  python3 scripts/validate_prospect_emails.py --email partner@bmw.com --smtp-probe
  python3 scripts/validate_prospect_emails.py --csv docs/sales/daily-100-prospects.csv --fix-csv --smtp-probe
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import smtplib
import socket
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CSV = ROOT / "docs/sales/daily-100-prospects.csv"
CACHE_PATH = ROOT / "docs/sales/email-validation-cache.json"

EMAIL_RE = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$")

# Domains / exact addresses we already know are bad or must not be mailed.
BLOCKED_ADDRESSES = {
    "partner@bmw.com",  # DSN 5.1.0 reject 2026-11-10
    "info@infineon.com",  # rejected by smtp2.infineon.com 2026-11-10
}
BLOCKED_DOMAINS = {
    "example.com",
    "example.org",
    "mailinator.com",
    "guerrillamail.com",
    "tempmail.com",
}


@dataclass
class ValidationResult:
    email: str
    ok: bool
    reason: str
    mx: str | None = None
    smtp_code: int | None = None
    checked_at: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


def load_cache() -> dict:
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text())
    return {}


def save_cache(cache: dict) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=2, sort_keys=True) + "\n")


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def mx_hosts(domain: str) -> list[str]:
    try:
        import dns.resolver  # type: ignore

        answers = dns.resolver.resolve(domain, "MX")
        records = sorted(
            ((r.preference, str(r.exchange).rstrip(".")) for r in answers),
            key=lambda x: x[0],
        )
        return [host for _, host in records]
    except Exception:
        # Fallback: try A record as implicit MX
        try:
            socket.getaddrinfo(domain, 25)
            return [domain]
        except OSError:
            return []


def smtp_rcpt_probe(email: str, mx: str, helo_host: str = "aipass.space", mail_from: str = "contact@aipass.space") -> tuple[bool, str, int | None]:
    """
    Probe RCPT TO. Treat 250/251 as ok, 55x as hard fail.
    4xx / timeout / policy greylist → inconclusive (ok=True with warning) so we do not
    block sends that only fail open verification — but BMW-style 5.1.0 is caught.
    """
    try:
        server = smtplib.SMTP(timeout=20)
        server.connect(mx, 25)
        server.ehlo_or_helo_if_needed()
        try:
            if server.has_extn("starttls"):
                context = __import__("ssl").create_default_context()
                server.starttls(context=context)
                server.ehlo()
        except Exception:
            pass
        code, _ = server.mail(mail_from)
        if code not in (250, 251):
            server.quit()
            return False, f"MAIL FROM rejected ({code})", code
        code, resp = server.rcpt(email)
        try:
            server.rset()
            server.quit()
        except Exception:
            try:
                server.close()
            except Exception:
                pass
        text = (resp or b"").decode(errors="replace") if isinstance(resp, (bytes, bytearray)) else str(resp)
        if code in (250, 251):
            return True, "rcpt accepted", code
        if 500 <= code <= 599:
            return False, f"rcpt rejected ({code}): {text}", code
        # 4xx greylist / try later — do not hard-fail
        return True, f"rcpt inconclusive ({code}): {text}", code
    except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, TimeoutError, OSError, socket.error) as exc:
        return True, f"smtp probe skipped: {type(exc).__name__}", None


def validate_email(
    email: str,
    *,
    smtp_probe: bool = True,
    cache: dict | None = None,
    cache_ttl_hours: int = 72,
    force: bool = False,
) -> ValidationResult:
    now = datetime.now(timezone.utc)
    addr = normalize_email(email)
    checked_at = now.isoformat()

    if not addr:
        return ValidationResult(addr, False, "empty", checked_at=checked_at)
    if addr in BLOCKED_ADDRESSES:
        return ValidationResult(addr, False, "blocked_address_known_bounce", checked_at=checked_at)
    if not EMAIL_RE.match(addr):
        return ValidationResult(addr, False, "invalid_syntax", checked_at=checked_at)

    local, _, domain = addr.partition("@")
    if not local or not domain or domain in BLOCKED_DOMAINS:
        return ValidationResult(addr, False, "blocked_or_bad_domain", checked_at=checked_at)

    if cache is not None and not force and addr in cache:
        prev = cache[addr]
        try:
            prev_at = datetime.fromisoformat(prev.get("checked_at", ""))
            age_h = (now - prev_at).total_seconds() / 3600
            if age_h <= cache_ttl_hours and prev.get("ok") is False:
                return ValidationResult(**prev)
            if age_h <= cache_ttl_hours and prev.get("ok") is True and not smtp_probe:
                return ValidationResult(**prev)
            # Re-use successful SMTP probe within TTL
            if age_h <= cache_ttl_hours and prev.get("ok") is True and prev.get("smtp_code") in (250, 251, None):
                if smtp_probe and prev.get("smtp_code") in (250, 251):
                    return ValidationResult(**prev)
                if not smtp_probe:
                    return ValidationResult(**prev)
        except Exception:
            pass

    hosts = mx_hosts(domain)
    if not hosts:
        result = ValidationResult(addr, False, "no_mx", checked_at=checked_at)
        if cache is not None:
            cache[addr] = result.to_dict()
        return result

    mx = hosts[0]
    if not smtp_probe:
        result = ValidationResult(addr, True, "mx_ok", mx=mx, checked_at=checked_at)
        if cache is not None:
            cache[addr] = result.to_dict()
        return result

    ok, reason, code = smtp_rcpt_probe(addr, mx)
    result = ValidationResult(addr, ok, reason, mx=mx, smtp_code=code, checked_at=checked_at)
    if cache is not None:
        cache[addr] = result.to_dict()
    return result


def ensure_valid_or_raise(email: str, *, smtp_probe: bool = True) -> ValidationResult:
    cache = load_cache()
    result = validate_email(email, smtp_probe=smtp_probe, cache=cache)
    save_cache(cache)
    if not result.ok:
        raise ValueError(f"invalid email {email}: {result.reason}")
    return result


def update_csv(csv_path: Path, results: dict[str, ValidationResult]) -> tuple[int, int]:
    rows = list(csv.DictReader(csv_path.open(encoding="utf-8")))
    if not rows:
        return 0, 0
    fields = list(rows[0].keys())
    for col in ("email_valid", "email_check_reason", "email_checked_at"):
        if col not in fields:
            fields.append(col)
    bad = 0
    good = 0
    for row in rows:
        email = normalize_email(row.get("email_primary") or "")
        alt = normalize_email(row.get("email_alt") or "")
        res = results.get(email)
        if not res:
            continue
        row["email_valid"] = "yes" if res.ok else "no"
        row["email_check_reason"] = res.reason
        row["email_checked_at"] = res.checked_at[:19]
        status = (row.get("status") or "").upper()
        if not res.ok:
            bad += 1
            # Prefer alt if present and not yet checked bad
            if alt and alt != email and alt not in BLOCKED_ADDRESSES:
                alt_res = results.get(alt) or validate_email(alt, smtp_probe=True, cache=load_cache())
                results[alt] = alt_res
                if alt_res.ok:
                    row["email_primary"] = alt
                    row["email_alt"] = email
                    row["email_valid"] = "yes"
                    row["email_check_reason"] = f"switched_from_bad_primary; {alt_res.reason}"
                    row["status"] = "READY" if status.startswith("SENT") or status == "BOUNCE" else row.get("status") or "READY"
                    row["next_action"] = "Send after email repair"
                    good += 1
                    bad -= 1
                    continue
            if status not in {"SKIP", "CAREFUL", "SENT_PRIOR"}:
                row["status"] = "BOUNCE"
                row["next_action"] = f"Fix email ({res.reason})"
        else:
            good += 1
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    return good, bad


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--email", action="append", default=[])
    parser.add_argument("--smtp-probe", action="store_true", default=False)
    parser.add_argument("--no-smtp-probe", action="store_true")
    parser.add_argument("--write-csv", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    smtp_probe = args.smtp_probe and not args.no_smtp_probe

    cache = load_cache()
    results: dict[str, ValidationResult] = {}

    emails: list[str] = list(args.email)
    csv_path = args.csv if args.csv.is_absolute() else ROOT / args.csv
    if csv_path.exists() and not args.email:
        for row in csv.DictReader(csv_path.open(encoding="utf-8")):
            if row.get("email_primary"):
                emails.append(row["email_primary"])
            if row.get("email_alt"):
                emails.append(row["email_alt"])

    for raw in emails:
        addr = normalize_email(raw)
        if not addr:
            continue
        res = validate_email(addr, smtp_probe=smtp_probe, cache=cache, force=args.force)
        results[addr] = res
        flag = "OK" if res.ok else "BAD"
        print(f"{flag}\t{addr}\t{res.reason}\tmx={res.mx or '-'}\tcode={res.smtp_code}", flush=True)

    save_cache(cache)

    if args.write_csv and csv_path.exists():
        good, bad = update_csv(csv_path, results)
        print(f"csv_updated good={good} bad={bad} path={csv_path}", flush=True)

    bad_n = sum(1 for r in results.values() if not r.ok)
    return 1 if bad_n else 0


if __name__ == "__main__":
    raise SystemExit(main())
