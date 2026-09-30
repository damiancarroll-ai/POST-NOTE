# POS note 002

GitHub Pages proof-of-concept for Lightspeed K-Series V1 Production OAuth and Print Message.

## Deployment
Upload `index.html` to the root of the `POST-NOTE` GitHub repository.

GitHub Pages URL / OAuth redirect URI:
`https://damiancarroll-ai.github.io/POST-NOTE/`

## OAuth
- Client ID: `devp-prod-lightspeed-cc7392163da2e2aea797228591a7e0de`
- Authorize: `https://api.lsk.lightspeed.app/oauth/authorize`
- Token: `https://api.lsk.lightspeed.app/oauth/token`
- Scopes: `orders-api financial-api`
- No `staff-api` scope or Staff API calls are present.

## API operations used
1. `GET /f/data/businesses` — obtain businesses/business locations accessible to the authorized token.
2. `POST /o/op/1/printMsg?businessLocationId=...` — send the message to the selected location.

## Device limitation
The documented Print Message API does not provide an endpoint to list POS devices and does not accept a `deviceId` recipient. Therefore POS note 002 cannot implement truthful per-device discovery or multi-select device targeting using only this API. The recipient is the selected `businessLocationId`.

The message body contains the local browser date/time at the top and `Thank you from Management Team` at the bottom. The Print checkbox controls `alsoToPrinter`.
