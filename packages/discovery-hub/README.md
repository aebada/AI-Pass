# @ai-pass/discovery-hub

AI Discovery Hub — searchable catalog for discovering, comparing, and connecting AI tools into Store, workflows, and agents. Designed as an enterprise catalog, not a static directory.

**Routes:** `/discover`, `/workspace/discover`  
**Docs:** [Discovery Hub](../../docs/DISCOVERY-HUB.md)

## Capabilities

- Tool search and taxonomy browsing  
- Side-by-side comparison and curated collections  
- Deals Hub and recommendation surfaces  
- Trust score mapping via Trust Engine  

## Entry points

- `createDiscoveryHub()` from `src/index.ts`  
- Services: discovery, search, collections, deals, analytics  

```bash
pnpm --filter @ai-pass/discovery-hub build
```
