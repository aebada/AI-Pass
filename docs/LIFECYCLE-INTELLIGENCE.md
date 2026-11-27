# Lifecycle Intelligence — full product lifecycle

First-party AI-Pass platform for **product ontologies and engineering knowledge graphs** spanning **concept → aftermarket** (Spread-class Lifecycle Intelligence).

## Full product lifecycle stages

| Stage | Phase | Focus |
|---|---|---|
| Concept | R&D | Intent, variants, constraints |
| Requirements | R&D | Gaps, conflicts, coverage |
| Design | R&D | Mechanics, electronics, software structure |
| Simulation & test | R&D | CAE / HIL / verification linked to requirements |
| Pilot production | Production | Early build issues and change sets |
| Series production | Production | BOM, process, supplier alignment |
| Field & warranty | Aftermarket | Tickets → components / software / requirements |
| Aftermarket & service | Aftermarket | Lessons learned back into the next cycle |

## Solutions

| App | Stages |
|---|---|
| Requirements Manager | Concept, requirements, aftermarket |
| Product Explorer | Design → series |
| Error Inspector | Simulation → field |
| Ticket Analyzer | Field, aftermarket |
| Build Your Own Solution (Studio) | Concept, design, series, aftermarket |

## Pipeline

Ingest → Map & trace → Resolve & version → Serve (API / MCP)

## Surfaces

| Surface | Path |
|---|---|
| Product | `/lifecycle` |
| Workspace | `/workspace/lifecycle` |
| Data Products | `/workspace/data-products` |
| APIs | `/api/v1/lifecycle/*` |
| Package | `@ai-pass/lifecycle-intelligence` |

## API map

- `GET/POST /api/v1/lifecycle` — snapshot (includes `lifecycleBoard` + stages)
- `GET/POST /api/v1/lifecycle/ontology` — list / extend entity & relation types
- `GET/POST /api/v1/lifecycle/mapping` — create, suggest, confirm, publish, ingest
- `GET/POST /api/v1/lifecycle/graph` — list/traverse/upsert nodes & edges
- `POST /api/v1/lifecycle/explore` — Product Explorer
- `GET /api/v1/lifecycle/requirements` — Requirements Manager
- `POST /api/v1/lifecycle/inspector` — Error Inspector
- `GET/POST /api/v1/lifecycle/tickets` — Ticket Analyzer

## Principle

Does **not** replace PLM. Maps data in place, serves one product truth across the full lifecycle to teams and agents.
