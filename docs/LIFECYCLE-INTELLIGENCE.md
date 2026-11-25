# Lifecycle Intelligence — ontology & knowledge graph

First-party AI-Pass platform for **building product ontologies and engineering knowledge graphs** (Spread.ai-class Lifecycle Intelligence).

## Features

| Feature | What it does |
|---|---|
| Product ontology | Schema across requirements, SW, HW, production, service |
| Knowledge graph | Versioned nodes/edges with full provenance |
| Agentic data mapping | Rules → AI suggest → engineer confirm → ingest |
| Pipeline | Ingest → map & trace → resolve & version → serve (API/MCP) |
| Requirements Manager | Gaps / conflicts / coverage |
| Product Explorer | NL questions with evidence paths |
| Error Inspector | Defect/ticket → root components & requirements |
| AI Studio apps | Configure apps on the product twin |
| PLM Connect | Teamcenter, Windchill, 3DEXPERIENCE, requirements, test |

## Surfaces

| Surface | Path |
|---|---|
| Product | `/lifecycle` |
| Workspace | `/workspace/lifecycle` |
| APIs | `/api/v1/lifecycle/*` |
| Package | `@ai-pass/lifecycle-intelligence` |

## API map

- `GET/POST /api/v1/lifecycle` — snapshot / create ontology|dataset
- `GET/POST /api/v1/lifecycle/ontology` — list / extend entity & relation types
- `GET/POST /api/v1/lifecycle/mapping` — create, suggest, confirm, publish, ingest
- `GET/POST /api/v1/lifecycle/graph` — list/traverse/upsert nodes & edges
- `POST /api/v1/lifecycle/explore` — Product Explorer
- `GET /api/v1/lifecycle/requirements` — Requirements Manager
- `POST /api/v1/lifecycle/inspector` — Error Inspector

## Principle

Does **not** replace PLM. Maps data in place, serves one product truth to teams and agents.
