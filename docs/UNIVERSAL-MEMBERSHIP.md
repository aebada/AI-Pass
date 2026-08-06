# Universal AI Membership — PRD Summary

## Vision

**AI Pass = Netflix/Spotify of AI.** One membership unlocks every major model. One wallet tracks all spend. Users never juggle API keys or per-provider subscriptions.

## Problem

Teams today subscribe to OpenAI, Anthropic, Google, Mistral, and more separately. Developers wire ad-hoc SDK calls. Finance has no unified view. Governance cannot enforce model policy.

## Solution

### Universal Membership

Four tiers with a clear feature matrix:

| | Free | Professional | Power | Enterprise |
|---|:---:|:---:|:---:|:---:|
| Daily requests | 50 | 500 | Unlimited | Unlimited |
| Monthly credits | 500 | 5,000 | 25,000 | Custom |
| Model access | Open/free | Premium | All + frontier | All + private |
| Playground | Limited | Full + compare | + benchmark | Full |
| Agent Studio | — | ✓ | ✓ | ✓ |
| Multi-agent | — | — | ✓ | ✓ |
| Governance | — | — | — | ✓ |

### Provider Hub (mandatory abstraction)

All AI traffic flows through `@ai-pass/provider-hub`:

- **ModelCatalog** — 26+ models across 14 providers (static demo data; production syncs from provider APIs)
- **RoutingEngine** — task-aware selection with membership tier gates and org policy
- **Auth** — managed keys (membership), BYOK, or hybrid per provider
- **Fallback** — health-aware routing when a provider is degraded

### AI Wallet

Every `streamChat`, `complete`, and `executeRequest` records:

- Provider, model, credits, estimated USD cost
- Monthly budget progress
- Spend breakdown by provider (dashboard parity)

### Workspace surfaces

- `/workspace/playground` — chat any model, side-by-side compare, benchmark tab
- `/workspace/providers` — searchable catalog, health status, BYOK form
- `/workspace/wallet` — credits, spend chart, execution history
- `/workspace/membership` — plan comparison with Universal Membership positioning

### Enterprise org controls (scaffold)

`OrgMembershipPolicy`:

- Allowed providers list
- Blocked model IDs
- Monthly org budget
- Per-user daily limits
- Approval threshold for high-cost runs

UI: `/workspace/settings/org`

### Cross-platform notes

**Flutter (mobile):** Import `MembershipTier`, `WalletSummary`, `UsageRecord` from `@ai-pass/shared`. Call backend APIs that use Provider Hub server-side; never embed provider keys in the app binary.

**Tauri (desktop):** Same packages as web (`provider-hub`, `membership`, `wallet`). BYOK keys stored in OS keychain via Tauri plugin (future).

### Technical debt

Modules that previously called `@ai-pass/ai-core` directly have been refactored:

- `apps/web/src/components/ChatPanel.tsx` → provider-hub ✅
- `apps/web/src/lib/useInlineCompletion.ts` → provider-hub ✅
- `packages/agent/src/agent-loop.ts` → provider-hub ✅

`@ai-pass/ai-core` remains the **internal** provider implementation layer — only `provider-hub` may import it from feature code.

### Success metrics

- 100% of new AI features route through Provider Hub
- Wallet records on every inference call
- Membership gate before model execution
- Single landing-page message: **"One Membership. Every AI Model."**
