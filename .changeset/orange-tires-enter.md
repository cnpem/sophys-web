---
"@sophys-web/spu-ui": minor
---

Sync the sample card UI based on the type monitored via websocket.
Samples in the store that are not compatible with the current card type will be removed from the store and the UI will be updated accordingly. This focus on representing the state of the cards in the sample environment and not the database. The state update is triggered by a bluesky plan "Detect cards" that checks the sample environment and updates the card names and types based on a QR code scan in each of the physical cards.
