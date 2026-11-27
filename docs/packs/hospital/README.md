# Hospital Sector Pack (`hospital` v0.1.0)

Companion to the Command Center requirements. Implementation: `@ai-pass/hospital-twin`.

- Workspace Command Center: `/workspace/hospital-twin`
- Marketing: `/hospital-twin`
- Synthetic banner on every screen (HR-9). Not clinical decision support (HR-10).
- Pseudonymous patient tokens only (HR-4).

## Contents

| Area | Coverage |
|---|---|
| Ontology | 23 classes, 18 relations |
| Modules (pilot) | capacity, admissions, ed, supply, equipment, staffing |
| KPIs | CAP/ADM/ED/OR/DX/STF/SUP/EQ/ALR certified set |
| Alerts | ICU, ED, boarding, turnaround, staffing, stock, equipment, oxygen, stale feed, bad data |
| Scenarios | surge, flu_ramp, equipment_failure, supply_shortage, staffing_gap, slow_cleaning, oxygen_drop, feed_outage, bad_data |
| Intents | 30 golden questions EN (+ AR/DE pattern matchers) |
| Roles | CEO, Medical Director, Nursing Supervisor, ED Lead, COO, Pharmacy, Maintenance, Wall, Admin |

## Tests

```bash
pnpm --filter @ai-pass/hospital-twin test
```
