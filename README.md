# Service Momentum: demo account

A static, click-through demo of the Service Momentum Command Center for a made-up business, Coastal Comfort HVAC.

Every customer, address, phone number, and dollar amount here is fictional. Phone numbers use the reserved 555-01xx range. The demo has no backend and doesn't connect to any real account or database.

## Personalized preview links

Add URL params and the demo shows the prospect's own version, entirely in the browser (no backend, nothing stored on a server):

`https://rcummins1025-lab.github.io/sm-demo/?biz=Choo%20Air&owner=Matthew&town=Island%20Park&state=NY`

- `biz` business name (max 48 chars), `owner` first name (24), `town` main town (32), optional `state` (2 letters) and `trade` (`mini-split`, `hvac`, `plumbing`).
- Params are kept in sessionStorage and added to every internal link. All text is inserted as plain text, never HTML.
- About 40% of the sample customers move to the given town; the rest stay generic. With no params the demo is plain Coastal Comfort HVAC.
- `/make/` builds a link from a small form. The link preview card (Open Graph) is the same generic image for everyone, because static hosting can't tailor it per link.
