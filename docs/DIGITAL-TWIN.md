# Digital Twin

Personalized AI assistant per user on AI-Pass — text + voice, calendar awareness, consent-governed memory, and day planning.

## Architecture

```
Browser (static Next.js)
  ├── /workspace/twin          — full chat UI + sidebar
  ├── DigitalTwinWidget.tsx    — floating widget for other pages
  └── Web Speech API           — STT/TTS (client-only, no Node on prod)

API (dev: Next.js routes | prod: Laravel stubs)
  POST /api/v1/twin/chat
  GET/POST /api/v1/twin/memory
  GET    /api/v1/twin/calendar/events

packages/digital-twin
  ├── DigitalTwinService       — orchestration
  ├── TwinMemoryStore          — per-user memory by category
  ├── TwinPersonality          — system prompt builder
  ├── CalendarConnector        — Google stub + mock demo
  └── provider-hub bridge      — all AI via @ai-pass/provider-hub
```

Production is static Next.js on Hostinger with Laravel/PHP auth. Chat UI runs client-side; API calls hit Laravel endpoints in `services/auth-api/routes/api.php` (stubs) or the Node dev server for full provider-hub AI.

## Package: `@ai-pass/digital-twin`

| Module | Purpose |
|--------|---------|
| `DigitalTwinService` | Chat, plan-my-day, calendar, memory CRUD |
| `TwinMemoryStore` | Categories: private, business, medical, connections, integrations |
| `TwinPersonality` | Builds system prompt from profile + memory + schedule |
| `MockCalendarConnector` | Demo schedule for dev/static |
| `GoogleCalendarStubConnector` | OAuth URL stub → Laravel |
| `TWIN_TIER_LIMITS` | Membership-gated feature matrix |

## Membership tiers (Digital Twin)

Mapped to universal AI Pass membership tiers:

| Twin tier | Membership | Price | Messages/mo | Speech | Calendar | Memory categories |
|-----------|------------|-------|-------------|--------|----------|-------------------|
| Free | `free` | $0 | 50 | — | — | — |
| Starter | `professional` | $19/mo* | 500 | ✓ | 1 | — |
| Pro | `power` | $49/mo* | Unlimited | ✓ | Multi | ✓ |
| Enterprise | `enterprise` | Custom | Unlimited | ✓ | Multi | ✓ + medical vault, WhatsApp stub, team twins |

\*Twin Starter/Pro pricing aligns with twin feature bundles; platform membership prices may differ — see `/workspace/membership`.

Features in `@ai-pass/shared`: `digital_twin`, `digital_twin_speech`, `digital_twin_calendar`, `digital_twin_memory`, `digital_twin_integrations`, `digital_twin_enterprise`.

## Privacy

- **Consent gates**: Each memory category (private, business, medical, connections, integrations) requires explicit user consent in the UI.
- **Medical vault**: Enterprise tier only; encrypted at rest (roadmap: dedicated vault storage).
- **No training on user data**: Twin context is scoped per request via provider-hub; not used for model training.
- **WhatsApp**: Stub only — integration roadmap documented, not implemented.

## Calendar OAuth roadmap {#calendar-oauth}

1. **Phase 1 (current)**: Mock calendar for demo; Google OAuth URL stub at `GET /api/v1/twin/calendar/oauth/google` (Laravel).
2. **Phase 2**: Laravel Google OAuth with `GOOGLE_CALENDAR_CLIENT_ID` / secret; store refresh tokens per user.
3. **Phase 3**: Sync events to twin context; work calendar (Microsoft 365) connector.
4. **Phase 4**: Proactive reminders and meeting prep briefs.

Configure in Laravel `.env` (future):

```env
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=https://auth.ai-pass.com/api/v1/twin/calendar/oauth/google/callback
```

## Dev setup

```bash
pnpm install
pnpm --filter @ai-pass/digital-twin build
pnpm --filter @ai-pass/web dev
```

Open [http://localhost:3000/workspace/twin](http://localhost:3000/workspace/twin).

For live AI (not local fallback responses), set provider keys or `PROVIDER_HUB_LIVE=1`.

## API reference

### POST `/api/v1/twin/chat`

```json
{ "message": "Plan my day" }
```

Response:

```json
{
  "reply": "...",
  "messagesRemaining": 49,
  "creditsUsed": 1,
  "suggestedActions": ["Add focus block"]
}
```

### GET `/api/v1/twin/memory`

Returns `{ entries, limits, usage }`.

### POST `/api/v1/twin/memory`

Consent: `{ "action": "consent", "category": "private", "consentGranted": true }`

Upsert: `{ "category": "business", "key": "role", "value": "...", "consentGranted": true }`

### GET `/api/v1/twin/calendar/events`

Returns `{ date, events, connections, googleOAuthUrl }`.

## Floating widget

Import on any workspace page:

```tsx
import { DigitalTwinWidget } from '@/app/workspace/twin/components/DigitalTwinWidget';

<DigitalTwinWidget tierLabel="Starter" />
```

## Stub vs working

| Feature | Status |
|---------|--------|
| Text chat | ✓ Working (provider-hub when keys set; local fallback otherwise) |
| Speech STT/TTS | ✓ Browser Web Speech API (Starter+) |
| Mock calendar / plan my day | ✓ Working |
| Google Calendar OAuth | Stub (Laravel JSON response) |
| WhatsApp integration | Stub in memory category only |
| Medical vault | Enterprise flag + consent UI |
| Laravel production API | Stub responses |
| Node dev API routes | Full `@ai-pass/digital-twin` service |
