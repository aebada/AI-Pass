# Knowledge Graph

> Entity-relationship **structure** over knowledge — nodes, edges, and graph queries that ground RAG and feed the Semantic Layer.

See also: [Knowledge Pipeline](./KNOWLEDGE-PIPELINE.md) · [Semantic Layer](./SEMANTIC-LAYER.md) · [Data Products](./DATA-PRODUCTS.md) · [Platform](./PLATFORM.md) · [Architecture](./ARCHITECTURE.md)

---

## Role in the stack

```text
Data Products ──► Knowledge Pipeline ──► Knowledge Graph ──► Semantic Layer ──► Analysis / Agents
                         │                      │                   │
                         └────────── RAG / corpus / entities ───────┘
```

| Layer | What it owns |
|-------|----------------|
| **Knowledge Pipeline** | Ingest, chunks, embeddings — *context corpus* |
| **Knowledge Graph** | Entities & relationships — *structure* |
| **Semantic Layer** | Metrics, dimensions — *business meaning* |
| **Analysis / Agents** | Queries and actions over certified meaning + graph context |

**Positioning:** Knowledge Graph = entity-relationship visualization and lightweight graph queries. It does **not** replace a graph DB; it catalogs demo/tenant graphs agents and RAG can traverse for multi-hop context.

---

## Package & module

| Item | Value |
|------|--------|
| Module ID | `knowledge-graph` |
| Route | `/workspace/knowledge-graph` |
| Legacy | `/workspace/knowledge/graph` (redirects) |
| Package | `@ai-pass/knowledge-graph` |
| Icon | `network` |
| Nav order | `4.2` (Knowledge → Knowledge Graph → Semantic → Data Products) |

Core types: `GraphNode`, `GraphEdge`, `EntityType`, `GraphQuery`, `GraphSnapshot`. Store: in-memory + `localStorage` (`ai-pass-knowledge-graph`). Query helpers: `getNeighbors`, `getNodesByType`, `expandNeighbors`, `queryGraph`.

---

## How it connects

1. **Knowledge Pipeline → Graph** — entities extracted from docs/ERP/CRM land as nodes; chunk/source ids on `knowledgeSourceIds`.
2. **Graph → Semantic Layer** — company / invoice / product nodes align with semantic entities; relationships inform metric grain.
3. **Graph → RAG** — neighbor expansion supplies multi-hop context (e.g. invoice → policy → company) for retrieval-augmented answers.
4. **Data Products → Graph** — gold products (Customer 360, invoices) seed or refresh entity instances.

---

## MVP scope

- Workspace UI: overview counts, SVG demo graph, entity list with type filter, neighbor panel
- Seed demo: companies, people, invoices, products, policies, documents
- No Neo4j / Cypher engine, no live ETL

---

## Future (out of scope for MVP)

- Live sync from Knowledge Pipeline extractors
- Cypher-like query language + persisted graph DB
- GraphRAG retrieval path wired into agent tools
