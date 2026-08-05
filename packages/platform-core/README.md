# @ai-pass/platform-core

Workspace shell foundations for the AI-Pass OS: module registry, navigation sections, workspace services, and global search.

**Used by:** `apps/web` workspace layout and sidebar.  
**Docs:** [Platform](../../docs/PLATFORM.md), [AI OS](../../docs/AI-OS.md)

## Entry points

- `src/modules.ts` — platform module definitions  
- `src/navigation.ts` / `src/platform-navigation.ts` — nav builders  
- `src/global-search.ts` — cross-module search index  

## Build

```bash
pnpm --filter @ai-pass/platform-core build
```
