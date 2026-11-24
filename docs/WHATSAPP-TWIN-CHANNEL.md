# WhatsApp twin channel (Instinct-style)

Text your AI-Pass digital twin on **WhatsApp** — no new app UI. Same channel idea as Instinct: the chat you already use is the interface.

## What we added

| Piece | Path |
|---|---|
| Cloud API client | `packages/messaging-connectors` |
| Webhook (verify + inbound) | `/api/v1/messaging/whatsapp/webhook` |
| Send | `/api/v1/messaging/whatsapp/send` |
| Status | `/api/v1/messaging/whatsapp/status` |
| Workspace setup | `/workspace/connect/whatsapp` |
| Connect catalog | Messaging → WhatsApp Business (Cloud API) |

## Env (Meta Cloud API)

```bash
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=ai-pass-whatsapp-verify
WHATSAPP_BUSINESS_ACCOUNT_ID=...   # optional
WHATSAPP_APP_SECRET=...            # optional
WHATSAPP_GRAPH_VERSION=v21.0       # optional
```

Never commit tokens. Bind them as host/app secrets.

## Meta Developer setup

1. Create a Meta app with **WhatsApp** product.
2. Add a business phone number; copy **Phone number ID**.
3. Generate a permanent **access token** (System User recommended for production).
4. Webhook callback URL: `https://<your-host>/api/v1/messaging/whatsapp/webhook`
5. Verify token = `WHATSAPP_VERIFY_TOKEN`
6. Subscribe to `messages` field.

## Behaviour

- **Inbound:** Meta POSTs to webhook → twin session opens → acknowledgment reply (replace with agent/twin runtime).
- **Outbound:** `POST /api/v1/messaging/whatsapp/send` with `{ "to": "+49...", "text": "..." }`
- **Without tokens:** send/outreach **stubs** safely so demos and CI keep working.
- **Sales outreach:** WhatsApp channel uses the Cloud API when configured (`OutreachService`).

## Twin use cases

- Personal / employee twin chat on WhatsApp
- Approval gates (“confirm before irreversible action”) in-thread
- Proactive follow-ups when twin tasks complete
- Support AI and sales outreach over the same connector

## Docs

- Meta: https://developers.facebook.com/docs/whatsapp/cloud-api
- Connect UI: https://aipass.space/connect (after deploy)
