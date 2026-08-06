# Invoice AI Mobile

Flutter client for the Invoice AI Financial Automation Platform (Phase 2–3).

## Screens

- **Login** — demo sign-in (`demo@example.com` / `demo-user`)
- **Dashboard** — stats + quick actions (API with offline fallback)
- **Portfolio** — invoice list
- **Upload** — file picker stub + upload API call
- **Chat** — query assistant with suggestion chips
- **Approvals** — pending approval queue (demo actions)

## Setup

```bash
cd apps/invoice-ai-mobile
flutter pub get
flutter run
```

With custom API URL:

```bash
flutter run --dart-define=INVOICE_AI_API_URL=https://api.example.com/api/v1/invoice-ai
```

## Configuration

Default API base: `lib/config.dart` (`INVOICE_AI_API_URL` dart-define or `http://localhost:8000/api/v1/invoice-ai`).

## Offline mode

When the API is unreachable, screens fall back to demo data in `lib/models/demo_data.dart`.

## Related Docs

- [Platform Architecture](../../docs/INVOICE-AI-PLATFORM.md)
- [API Catalog](../../docs/INVOICE-AI-API.md)
- [Deployment Guide](../../docs/DEPLOY-INVOICE-AI-PLATFORM.md)
