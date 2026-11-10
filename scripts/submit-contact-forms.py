#!/usr/bin/env python3
"""
Form-first Micro1 outreach.

Prefer official company contact / partner / startup forms.
Only skip to email when a company has no usable form row.

Usage:
  python3 scripts/submit-contact-forms.py --discover --limit 5
  python3 scripts/submit-contact-forms.py --company "Deutsche Telekom" --submit
  python3 scripts/submit-contact-forms.py --submit --limit 10
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_CSV = ROOT / "docs/sales/company-contact-forms.csv"
PROSPECTS_CSV = ROOT / "docs/sales/daily-100-prospects.csv"
STATE_PATH = ROOT / "docs/sales/form-outreach-state.json"
LOG_PATH = ROOT / "docs/sales/form-outreach-log.md"
SCREEN_DIR = ROOT / "docs/sales/form-screenshots"

SENDER = {
    "first_name": "Partnerships",
    "last_name": "AI-Pass",
    "full_name": "AI-Pass Partnerships",
    "email": "contact@aipass.space",
    "phone": "+49 89 00000000",
    "company": "AI-Pass",
    "website": "https://aipass.space",
    "country": "Germany",
    "city": "Munich",
}

MESSAGE_TEMPLATE = """Hello {company} team,

AI-Pass (https://aipass.space) — enterprise twin + Connect + Company Harness.

Pilot wedge: {wedge}
• Connect 1–2 systems into a twin
• Route work through harness with human confirmation on irreversible actions
• Graph Builder only accepts facts with evidence

Transparent prices (list):
• Platform: Free $0 · Professional $49/user/mo · Enterprise custom
• Twin Starter pilot (2 weeks): from €8,000
• Twin + Graph (4 weeks): from €20,000
• Ops Reality co-build: from €25,000
• Lab Eval Sprint: from €15,000

Demo: https://aipass.space/demo
Book 15 min: https://aipass.space/book-demo

Contact: contact@aipass.space
"""


def load_forms() -> list[dict]:
    with FORMS_CSV.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def save_forms(rows: list[dict]) -> None:
    if not rows:
        return
    with FORMS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


def load_prospects() -> dict[str, dict]:
    with PROSPECTS_CSV.open(newline="", encoding="utf-8") as f:
        return {r["company"]: r for r in csv.DictReader(f)}


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"submitted": {}, "discovered": {}}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def append_log(line: str) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    prev = LOG_PATH.read_text() if LOG_PATH.exists() else "# Form outreach log\n\n"
    LOG_PATH.write_text(prev + line + "\n")


def message_for(company: str, wedge: str) -> str:
    return MESSAGE_TEMPLATE.format(company=company, wedge=wedge or "enterprise twin + harness")


def launch_browser(headless: bool = True):
    from playwright.sync_api import sync_playwright

    pw = sync_playwright().start()
    browser = pw.chromium.launch(headless=headless, args=["--disable-blink-features=AutomationControlled"])
    context = browser.new_context(
        user_agent=(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        locale="de-DE",
        viewport={"width": 1400, "height": 900},
    )
    page = context.new_page()
    return pw, browser, context, page


def discover_fields(page) -> list[dict]:
    return page.evaluate(
        """() => {
          const nodes = [...document.querySelectorAll('input, textarea, select')];
          return nodes.map((el, i) => ({
            i,
            tag: el.tagName.toLowerCase(),
            type: (el.type || '').toLowerCase(),
            name: el.name || '',
            id: el.id || '',
            placeholder: el.placeholder || '',
            aria: el.getAttribute('aria-label') || '',
            label: (() => {
              if (el.id) {
                const lab = document.querySelector(`label[for="${el.id}"]`);
                if (lab) return (lab.innerText || '').trim().slice(0, 120);
              }
              const parent = el.closest('label');
              return parent ? (parent.innerText || '').trim().slice(0, 120) : '';
            })(),
            required: !!el.required,
            visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
          }));
        }"""
    )


def classify_field(meta: dict) -> str | None:
    blob = " ".join(
        [
            meta.get("name") or "",
            meta.get("id") or "",
            meta.get("placeholder") or "",
            meta.get("aria") or "",
            meta.get("label") or "",
        ]
    ).lower()
    typ = (meta.get("type") or "").lower()
    tag = meta.get("tag") or ""

    if typ in {"hidden", "submit", "button", "image", "file", "checkbox", "radio", "password"}:
        if typ == "checkbox" and any(k in blob for k in ("privacy", "datenschutz", "consent", "agree", "opt")):
            return "consent"
        return None
    if typ == "email" or "e-mail" in blob or "email" in blob or "mail" == blob.strip():
        return "email"
    if typ == "tel" or "phone" in blob or "telefon" in blob or "mobile" in blob:
        return "phone"
    if any(k in blob for k in ("first name", "vorname", "firstname", "given")):
        return "first_name"
    if any(k in blob for k in ("last name", "nachname", "lastname", "surname", "family")):
        return "last_name"
    if re.search(r"\bname\b", blob) and "company" not in blob and "firma" not in blob:
        return "full_name"
    if any(k in blob for k in ("company", "firma", "unternehmen", "organization", "organisation")):
        return "company"
    if any(k in blob for k in ("website", "webseite", "url", "homepage")):
        return "website"
    if any(k in blob for k in ("country", "land", "country/region")):
        return "country"
    if any(k in blob for k in ("city", "stadt", "ort")):
        return "city"
    if tag == "textarea" or any(
        k in blob
        for k in (
            "message",
            "nachricht",
            "comment",
            "anliegen",
            "description",
            "beschreibung",
            "request",
            "inquiry",
            "anfrage",
            "details",
            "use case",
            "solution",
            "pitch",
        )
    ):
        return "message"
    if any(k in blob for k in ("subject", "betreff", "topic", "thema", "reason", "kategorie", "category")):
        return "subject"
    return None


def fill_value(kind: str, company: str, wedge: str) -> str:
    if kind == "email":
        return SENDER["email"]
    if kind == "phone":
        return SENDER["phone"]
    if kind == "first_name":
        return SENDER["first_name"]
    if kind == "last_name":
        return SENDER["last_name"]
    if kind == "full_name":
        return SENDER["full_name"]
    if kind == "company":
        return SENDER["company"]
    if kind == "website":
        return SENDER["website"]
    if kind == "country":
        return SENDER["country"]
    if kind == "city":
        return SENDER["city"]
    if kind == "subject":
        return f"AI-Pass twin pilot + pricing for {company}"
    if kind == "message":
        return message_for(company, wedge)
    return ""


def try_accept_cookies(page) -> None:
    for text in (
        "Alle akzeptieren",
        "Accept all",
        "Accept All",
        "Zustimmen",
        "Einverstanden",
        "OK",
        "Agree",
        "I agree",
    ):
        loc = page.get_by_role("button", name=re.compile(text, re.I))
        try:
            if loc.count() and loc.first.is_visible():
                loc.first.click(timeout=2000)
                time.sleep(0.5)
                return
        except Exception:
            pass
        loc = page.locator(f"button:has-text('{text}'), [role=button]:has-text('{text}')")
        try:
            if loc.count() and loc.first.is_visible():
                loc.first.click(timeout=2000)
                time.sleep(0.5)
                return
        except Exception:
            pass


def fill_form(page, company: str, wedge: str) -> dict:
    fields = discover_fields(page)
    filled = 0
    mapping = []
    for meta in fields:
        if not meta.get("visible"):
            continue
        kind = classify_field(meta)
        if not kind:
            continue
        if kind == "consent":
            sel = None
            if meta.get("id"):
                sel = f"#{meta['id']}"
            elif meta.get("name"):
                sel = f"input[name=\"{meta['name']}\"]"
            if sel:
                try:
                    page.locator(sel).first.check(force=True)
                    filled += 1
                    mapping.append({"kind": kind, "sel": sel})
                except Exception:
                    pass
            continue
        value = fill_value(kind, company, wedge)
        sel = None
        if meta.get("id"):
            sel = f"#{meta['id']}"
        elif meta.get("name"):
            sel = f"{meta['tag']}[name=\"{meta['name']}\"]"
        if not sel:
            continue
        try:
            loc = page.locator(sel).first
            tag = meta.get("tag")
            if tag == "select":
                try:
                    loc.select_option(label=value)
                except Exception:
                    loc.select_option(index=1)
            else:
                loc.fill(value)
            filled += 1
            mapping.append({"kind": kind, "sel": sel})
        except Exception as exc:
            mapping.append({"kind": kind, "sel": sel, "error": str(exc)[:120]})
    return {"filled": filled, "fields_seen": len(fields), "mapping": mapping}


def click_submit(page) -> bool:
    candidates = [
        page.get_by_role("button", name=re.compile(r"(send|senden|submit|absenden|anfragen|apply|bewerben|kontakt)", re.I)),
        page.locator("button[type=submit], input[type=submit]"),
        page.locator("button:has-text('Senden'), button:has-text('Absenden'), button:has-text('Send')"),
    ]
    for loc in candidates:
        try:
            if loc.count():
                loc.first.click(timeout=5000)
                return True
        except Exception:
            continue
    return False


def process_one(row: dict, prospects: dict[str, dict], *, submit: bool, headless: bool) -> dict:
    company = row["company"]
    url = row["form_url"]
    prospect = prospects.get(company, {})
    wedge = prospect.get("wedge") or "enterprise twin + harness"
    SCREEN_DIR.mkdir(parents=True, exist_ok=True)
    safe = re.sub(r"[^a-z0-9]+", "-", company.lower()).strip("-")
    shot = SCREEN_DIR / f"{safe}.png"

    pw, browser, context, page = launch_browser(headless=headless)
    result = {
        "company": company,
        "url": url,
        "ok": False,
        "reason": "",
        "filled": 0,
        "submitted": False,
    }
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(2)
        try_accept_cookies(page)
        time.sleep(1)
        # WAF / challenge pages often have almost no inputs
        title = page.title()
        body_text = page.inner_text("body")[:500] if page.locator("body").count() else ""
        fill = fill_form(page, company, wedge)
        result["filled"] = fill["filled"]
        result["discover"] = fill
        page.screenshot(path=str(shot), full_page=True)
        result["screenshot"] = str(shot)

        if fill["filled"] == 0:
            result["reason"] = f"no_fillable_fields title={title!r} body={body_text[:160]!r}"
            return result

        if not submit:
            result["ok"] = True
            result["reason"] = "discovered_only"
            return result

        clicked = click_submit(page)
        time.sleep(3)
        page.screenshot(path=str(shot.with_name(safe + "-after.png")), full_page=True)
        if not clicked:
            result["reason"] = "submit_button_not_found"
            return result
        result["ok"] = True
        result["submitted"] = True
        result["reason"] = "submitted"
        return result
    except Exception as exc:
        result["reason"] = f"{type(exc).__name__}: {exc}"
        try:
            page.screenshot(path=str(shot), full_page=True)
            result["screenshot"] = str(shot)
        except Exception:
            pass
        return result
    finally:
        context.close()
        browser.close()
        pw.stop()


def mark_prospect_form_channel(company: str, outcome: str) -> None:
    rows = list(csv.DictReader(PROSPECTS_CSV.open(encoding="utf-8")))
    if not rows:
        return
    fields = list(rows[0].keys())
    for col in ("preferred_channel", "form_status", "email_fallback"):
        if col not in fields:
            fields.append(col)
    for r in rows:
        if r["company"] != company:
            continue
        r["preferred_channel"] = "FORM"
        r["form_status"] = outcome
        # keep email as fallback only
        r["email_fallback"] = r.get("email_primary") or ""
        if outcome.startswith("SUBMITTED"):
            r["status"] = f"FORM {outcome.split()[-1] if ' ' in outcome else datetime.now(timezone.utc).date()}"
            r["next_action"] = "Wait for form reply"
        elif outcome.startswith("BLOCKED"):
            r["preferred_channel"] = "EMAIL"
            r["email_fallback"] = "yes"
            r["next_action"] = "Form blocked/WAF — validate email then send"
    with PROSPECTS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--discover", action="store_true")
    parser.add_argument("--submit", action="store_true")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--company", type=str, default="")
    parser.add_argument("--headed", action="store_true")
    args = parser.parse_args()
    if not args.discover and not args.submit:
        args.discover = True

    forms = [r for r in load_forms() if (r.get("channel") or "").upper() == "FORM"]
    if args.company:
        forms = [r for r in forms if args.company.lower() in r["company"].lower()]
    else:
        forms = [r for r in forms if (r.get("status") or "").upper() in {"READY", "RETRY"}]

    forms = forms[: args.limit]
    prospects = load_prospects()
    state = load_state()
    today = datetime.now(timezone.utc).date().isoformat()

    print(f"form_targets={len(forms)} submit={args.submit}", flush=True)
    ok_n = 0
    for row in forms:
        company = row["company"]
        if company in state.get("submitted", {}) and args.submit:
            print(f"SKIP already submitted {company}", flush=True)
            continue
        print(f"OPEN {company} {row['form_url']}", flush=True)
        result = process_one(row, prospects, submit=args.submit, headless=not args.headed)
        print(
            f"{'OK' if result['ok'] else 'FAIL'} {company} filled={result['filled']} "
            f"submitted={result.get('submitted')} reason={result['reason'][:180]}",
            flush=True,
        )
        append_log(
            f"- {today} {company}: ok={result['ok']} filled={result['filled']} "
            f"submitted={result.get('submitted')} reason={result['reason'][:200]}"
        )
        # update forms csv status
        all_forms = load_forms()
        for fr in all_forms:
            if fr["company"] == company:
                if result.get("submitted"):
                    fr["status"] = "SUBMITTED"
                    fr["last_action"] = f"Submitted {today}"
                    state.setdefault("submitted", {})[company] = {
                        "at": datetime.now(timezone.utc).isoformat(),
                        "url": row["form_url"],
                    }
                    mark_prospect_form_channel(company, f"SUBMITTED {today}")
                    ok_n += 1
                elif result["filled"] == 0:
                    fr["status"] = "BLOCKED_OR_COMPLEX"
                    fr["last_action"] = result["reason"][:180]
                    mark_prospect_form_channel(company, f"BLOCKED {today}")
                elif args.discover and not args.submit:
                    fr["status"] = "MAPPED"
                    fr["last_action"] = f"Mapped {result['filled']} fields"
                    state.setdefault("discovered", {})[company] = result.get("discover", {})
                    ok_n += 1
                else:
                    fr["status"] = "RETRY"
                    fr["last_action"] = result["reason"][:180]
        save_forms(all_forms)
        save_state(state)
        time.sleep(1.5)

    print(f"done ok={ok_n}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
