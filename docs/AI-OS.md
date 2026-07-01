# AI Pass — AI Operating System

AI Pass is an **Enterprise AI Operating System**: a unified workspace where agents, skills, automations, marketplace apps, and vertical solutions share a common **runtime foundation**.

---

## Runtime as Foundation

Every AI capability — chat, agents, workflows, marketplace apps, invoice processing — executes through the same pipeline:

1. **Plan** what to do
2. **Route** to the right skill, model, or automation (via Tool Router + Provider Hub)
3. **Execute** with sandboxing and wallet metering
4. **Evaluate** for confidence and compliance (`NEEDS_INFO` when uncertain)
5. **Compose** structured output

Full details: [Runtime Architecture](./RUNTIME-ARCHITECTURE.md)

---

## OS Shell

The workspace (`/workspace`) is the OS shell. Modules appear in the sidebar via `platform-core` navigation:

- **Execution** — plan and monitor agent runs
- **Playground** — model chat + runtime plan/execute
- **Automation** — visual workflow builder
- **Skills** — marketplace skill library
- **Providers** — model catalog and BYOK
- **Monitoring** — credits, latency, trust metrics
- **Wallet** — universal AI credits

---

## Membership & Wallet

One membership, every model. New users receive **5,000 free credits** on wallet initialization (`WalletService.initializeNewUser`).

All usage is recorded through the wallet with module attribution (`runtime-core`, `marketplace`, `playground`, etc.).

---

## Extension Points

| Want to… | Use |
|----------|-----|
| Run an agent task | `getExecutionEngine().execute()` |
| Add a skill | `SkillsRuntimeService.register()` |
| Run a marketplace app | `MarketplaceAppExecutor.run()` |
| Add workflow automation | `AutomationEngine.register()` + LiveSync triggers |
| Support a new device | Implement `DeviceExecutionAdapter` |
| Computer/UI actions | `ActionEngine.execute()` (simulation by default) |

---

## Related Docs

- [Architecture](./ARCHITECTURE.md)
- [Platform](./PLATFORM.md)
- [Universal Membership](./UNIVERSAL-MEMBERSHIP.md)
