# Lightspeed POS Messenger — mobile 393×852

## What this does
- `index.html` is the root/mobile UI.
- Initialize Connection starts Lightspeed Production OAuth V2.
- Requests `orders-api staff-api offline_access`.
- Loads businesses with `GET /o/op/data/businesses`.
- Loads recent shifts and extracts unique `deviceId` values.
- Sends a POS-screen message with `POST /o/op/1/printMsg` and `alsoToPrinter:false`.

## Important API limitation
The documented Print Message endpoint has no `deviceId` or `staffId` request field. Selecting/discovering a device therefore cannot target that individual register with this endpoint. The message is sent to its `businessLocationId`. The UI states this explicitly.

## Deploy without a local server
This package is set up for GitHub source + Netlify hosting/functions. GitHub Pages alone cannot securely hold a Production client secret.

1. Push this folder to a PRIVATE or public GitHub repository (there are no credentials in it).
2. Create a Netlify site from that repository.
3. In Netlify Environment Variables add:
   - `LS_CLIENT_ID`
   - `LS_CLIENT_SECRET`
   - `LS_REDIRECT_URI` = `https://YOUR-SITE.netlify.app/.netlify/functions/api?action=callback`
4. Register exactly that HTTPS redirect URI for the Lightspeed Production API client.
5. Deploy and open the Netlify URL on the phone.

## Token persistence — one production step still required
The included function demonstrates OAuth exchange and automatic refresh correctly, but its `memoryTokens` storage is intentionally non-persistent because serverless instances can restart. Before relying on this in production, replace `loadTokens()` and `saveTokens()` with a durable server-side store such as Netlify Blobs/KV/database. Store the latest refresh token after every refresh: Lightspeed refresh tokens rotate and each one can only be used once.

Do NOT put the client secret or refresh token in `index.html`, browser localStorage, GitHub Pages, or a downloadable `secret.txt`.
