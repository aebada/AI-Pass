# Command Center for Smart Hospitals — Product Backlog

Companion to SPEC / PACK / BRIEF. Machine-readable status: [`user-stories.csv`](./user-stories.csv) (141 stories).

## Vision

A voice-driven command center on a digital twin of the hospital: leaders ask in their own language, hear a short verified answer, and see the right dashboards; the system detects problems, explains causes, recommends and (with approval) performs operational fixes, and proves the result.

## Releases

| Code | Release | Content |
|---|---|---|
| A | POC Phase A | Monitor and ask: voice, boards, KPIs, alerts, forecasts, digest, demo kit (synthetic) |
| B | POC Phase B | Smart operations: incidents, playbooks, approvals, optimizers |
| P | Pilot | Real connectors, on-prem, security/legal sign-off |

## Live demo surfaces

- Command Center: `/workspace/hospital-twin/` — Twin map visuals, boards, Ask / Voice chatbot with mic + TTS
- Marketing: `/hospital-twin/`

## Story map

Ask (VC) → See (DV, KP) → Be warned (AL) → Look ahead (FI) → Understand why → Decide (AU) → Act (AU, OP) → Prove (DM) → Trust (SP, DC, NF)

Trust Must items never cut: VC-11, KP-01, KP-06, SP-02, SP-04, AU-03, AU-07, AU-09, AU-22.

## Status source of truth

Update `user-stories.csv` `status` (`implemented` | `partial` | `planned`) when acceptance criteria land. Requirements agents: `pnpm --filter @ai-pass/hospital-twin check:requirements`.
