# K-Series POS Messenger — GitHub Pages POC

A deliberately browser-only proof of concept for Lightspeed K-Series.

## Files
- `index.html` — entire application.

## Before deploying
1. Put `index.html` at the root of the `POST-NOTE` GitHub Pages repository. The deployed URL is `https://damiancarroll-ai.github.io/POST-NOTE/`.
2. Enable GitHub Pages for the repository.
3. Register this **exact** redirect URI for your Lightspeed OAuth client: `https://damiancarroll-ai.github.io/POST-NOTE/`. The app is hard-coded to use this callback.
4. Ensure the OAuth client is allowed these scopes: `orders-api`, `staff-api`, `financial-api`, `offline_access`.
5. Open the site and log in with the static test login supplied in the project brief.
6. Paste the test client secret into Configuration and press **SAVE TEST SECRET LOCALLY**.
7. Press **INITIALIZE CONNECTION** and authorize Lightspeed.

## Important browser-only limitation
The app performs the OAuth token exchange and K-Series API requests directly from browser JavaScript. This requires Lightspeed's relevant endpoints to permit requests from your GitHub Pages origin via CORS. If the browser reports a CORS error, a static GitHub Pages-only implementation cannot bypass it; a server-side proxy (for example Cloudflare) is required.

## What the app does
- Static local login.
- OAuth2 authorization-code initialization.
- Stores access + refresh tokens in localStorage.
- Refreshes an expiring access token and immediately stores the replacement refresh token.
- Discovers businesses/locations using `GET /f/data/businesses`.
- Discovers recent `deviceId` values from `GET /staff/v1/businessLocations/{businessLocationId}/shift`.
- Discovers active POS users using `GET /staff/v1/businessLocations/{businessLocationId}/userTypes/POS`.
- Sends a POS-screen message using `POST /o/op/1/printMsg?businessLocationId=...` with `alsoToPrinter:false`.

## Targeting note
Lightspeed's documented Print Message endpoint accepts `businessLocationId`, `message`, and `alsoToPrinter`. It does not document a `deviceId` or `staffId` recipient parameter. Therefore device/user discovery is displayed for context only; the message is sent to the selected business location.

## Environment
This build is configured for Lightspeed **production** because the supplied client ID/authorization URL is production-oriented. If the OAuth client is actually a trial client, change the three endpoint constants in `CONFIG` to the trial hosts documented by Lightspeed.
