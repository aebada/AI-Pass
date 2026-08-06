# Semantic Layer

> Governed **business meaning** — metrics, entities, and dimensions — sitting between Knowledge and Analysis so agents and analytics share one definition of truth.

See also: [Data Products](./DATA-PRODUCTS.md) · [Platform](./PLATFORM.md) · [Architecture](./ARCHITECTURE.md)

---

## Role in the stack

```text
Data Products ──► Knowledge Pipeline ──► Knowledge Graph ──► Semantic Layer ──► Analysis / Agents / Apps
                         │                      │                   │
                         └────────── RAG / corpus / entities ───────┘
```

| Layer | What it owns |
|-------|----------------|
| **Knowledge** | Documents, chunks, embeddings — *context corpus* |
| **Knowledge Graph** | Entities & relationships — *structure* (see [KNOWLEDGE-GRAPH.md](./KNOWLEDGE-GRAPH.md)) |
| **Semantic Layer** | Metrics, entities, dimensions — *business meaning* |
| **Analysis** | Dashboards, reports, insights — *consumption* |
| **Agents / Apps** | Actions that must use certified definitions |

**Positioning:** Semantic Layer = governed business meaning (metrics/entities) for agents & analytics. It does **not** replace a warehouse; it catalogs definitions agents and Analysis can trust.

---

## Package & module

| Item | Value |
|------|--------|
| Module ID | `semantic-layer` |
| Route | `/workspace/semantic` |
| Package | `@ai-pass/semantic-layer` |
| Icon | `layers` |

Core types: `MetricDefinition`, `Entity`, `Dimension`, `SemanticModel`. Catalog store: in-memory + `localStorage` (`ai-pass-semantic-catalog`).

---

## How it connects

1. **Knowledge → Semantic** — metrics can reference knowledge docs (`knowledgeRefIds`); entities can bind knowledge sources.
2. **Semantic → Analysis** — Analysis depends on certified metrics instead of ad-hoc SQL strings.
3. **Semantic → Agents** — agents resolve “ARR”, “DSO”, etc. through the catalog so prompts and tools share definitions.
4. **Data Products → Semantic** — gold products (e.g. Customer 360) back entity/metric grain; lineage stubs point at semantic models.

---

## MVP scope

- Workspace UI: metrics list, entities, define-metric form (persisted locally)
- Seed demo model: Revenue semantic model
- No warehouse dialect, no live query engine

---

## Future (out of scope for MVP)

- Certified metric promotion workflow + Governance hooks
- Compile metrics to warehouse SQL / dbt
- LiveSync events: `semantic.metric.updated`
- Trust Center attestation of certified metrics
