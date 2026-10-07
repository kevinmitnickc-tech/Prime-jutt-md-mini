# Prime Jutt MD Mini — WhatsApp Cloud API starter

This is a small starter project with:
- A neon-green dashboard
- A `/health` status endpoint
- A Meta WhatsApp Cloud API webhook
- Basic text commands: `!menu`, `!owner`, and `!ping`
- Webhook signature validation using your Meta app secret

## Important
This starter uses Meta's official WhatsApp Business Platform Cloud API. It does **not** pair a regular personal WhatsApp account by QR or pairing code. Do not share your WhatsApp OTP, access token, app secret, or session files with anyone.

## Requirements
- Node.js 18 or newer
- A Meta developer app configured for WhatsApp Cloud API
- A WhatsApp Business Account / phone number ID
- An access token and app secret
- A public HTTPS server for the webhook

## Run locally
1. Copy `.env.example` to `.env`.
2. Fill in the values from your Meta developer dashboard.
3. Install dependencies: `npm install`
4. Start: `npm start`
5. Open `http://localhost:3000`

Node does not automatically load `.env`. For local testing, use your preferred environment-variable loader or set variables in your terminal. Do not commit `.env` to GitHub.

## Webhook setup
In your Meta app's WhatsApp webhook configuration:
- Callback URL: `https://YOUR_PUBLIC_HOST/webhook`
- Verify token: the same value as `VERIFY_TOKEN`
- Subscribe to the `messages` field

Use a public HTTPS host for webhook testing. The host must run the Node server persistently enough to receive webhook requests. The dashboard itself can be hosted separately, for example as a frontend project.

## Environment variables
- `VERIFY_TOKEN`: a secret phrase you create for Meta webhook verification
- `APP_SECRET`: Meta app secret, used to verify webhook signatures
- `WHATSAPP_TOKEN`: WhatsApp Cloud API access token
- `PHONE_NUMBER_ID`: phone number ID shown in Meta's WhatsApp setup
- `GRAPH_API_VERSION`: use the current Graph API version shown in Meta's documentation

## Test commands
Send a WhatsApp message to the configured business number:
- `hi`
- `menu`
- `!menu`
- `!owner`
- `!ping`

The sample only replies to those exact commands. For production, add logging, rate limits, opt-in/consent handling, error monitoring, and any applicable privacy notices. Follow Meta's messaging rules and use approved templates when required.
