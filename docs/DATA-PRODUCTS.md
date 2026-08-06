# Data Products

> **Data management as a data product** — catalog, ownership, quality, and contracts for datasets that feed Knowledge, Semantic Layer, and Apps.

See also: [Semantic Layer](./SEMANTIC-LAYER.md) · [Platform](./PLATFORM.md) · [Architecture](./ARCHITECTURE.md)

---

## Principles

1. **Product, not dump** — every dataset has a name, version, owner, schema, and consumers.
2. **Ownership** — accountable owner + optional steward; consumers declared on contracts.
3. **Quality** — scored dimensions (completeness, accuracy, timeliness, …) visible in the catalog.
4. **Contracts** — expectations (freshness, quality thresholds, schema version) with status (`active` / `violated` / …).
5. **Lineage (stub)** — upstream/downstream products + Knowledge Pipeline / Semantic Model ids.

**Positioning:** Data Products = managed, versioned, owned datasets as products feeding Knowledge / Semantic / Apps. Complementary to Knowledge Pipeline (ingest & RAG), not a replacement.

---

## Role in the stack

```text
Sources / ERP / CRM
        │
        ▼
  Data Products (catalog · owners · quality · contracts)
        │
        ├──► Knowledge Pipeline (ingest, enrich, RAG)
        ├──► Semantic Layer (metrics over gold products)
        └──► Apps / Agents (governed inputs)
```

| Concern | Knowledge Pipeline | Data Products |
|---------|--------------------|---------------|
| Focus | AI-ready context & retrieval | Dataset lifecycle as products |
| Artifact | Chunks, embeddings, graph | Schema, SLA, quality, owners |
| Consumer | Agents via RAG | Semantic Layer, Analysis, Apps |

---

## Package & module

| Item | Value |
|------|--------|
| Module ID | `data-products` |
| Route | `/workspace/data-products` |
| Package | `@ai-pass/data-products` |
| Icon | `database` |

Core types: `DataProduct`, `Schema`, `Owner`, `QualityScore`, `DataContract`, `LineageStub`. Repository: in-memory + `localStorage` (`ai-pass-data-products-catalog`).

---

## Relation to Knowledge Pipeline

- Knowledge connectors may ingest from a **published** data product (source URI stub).
- Lineage records `knowledgePipelineIds` so operators see which pipelines depend on a product.
- When a contract is `violated`, Knowledge / Semantic consumers should treat freshness as degraded (future LiveSync hook).

---

## MVP scope

- Workspace catalog cards with quality/status badges
- Create draft products; view ownership, schema, contracts, lineage stub
- Demo products: Customer 360, Invoice Facts, CRM Raw, ERP Extract
- No full warehouse / lakehouse integration

---

## Future (out of scope for MVP)

- Contract enforcement jobs + alerting
- Schema evolution / versioning UI
- Publish to Knowledge as a one-click pipeline
- Governance approval gates for production products
