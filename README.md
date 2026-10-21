# Service Momentum: demo account

A static, click-through demo of the Service Momentum Command Center for a made-up business, Coastal Comfort HVAC.

Every customer, address, phone number, and dollar amount here is fictional. Phone numbers use the reserved 555-01xx range. The demo has no backend and doesn't connect to any real account or database.

## Personalized preview links

Add URL params and the demo shows the prospect's own version, entirely in the browser (no backend, nothing stored on a server):

`https://rcummins1025-lab.github.io/sm-demo/?biz=Choo%20Air&owner=Matthew&town=Island%20Park&state=NY`

- `biz` business name (max 48 chars), `owner` first name (24), `town` main town (32), optional `state` (2 letters) and `trade` (`mini-split`, `hvac`, `plumbing`).
- Params are kept in sessionStorage and added to every internal link. All text is inserted as plain text, never HTML.
- About 40% of the sample customers move to the given town; the rest stay generic. With no params the demo is plain Coastal Comfort HVAC.
- Optional, for a more personal preview:
  - `services` comma list of the prospect's own service names (max 4, 40 chars each). Each sample customer gets one of them on Service history, Schedule and the customer pages.
  - `towns` comma list of nearby towns (max 6, 32 chars each). The other ~60% of sample customers rotate through these instead of the default NH/MA towns.
  - `color` brand hex without `#` (3 or 6 digits). Used for the monogram, banner accent, goal bar and Add-a-lead button; it is darkened automatically until white text passes 4.5:1 contrast. Invalid values are ignored.
  - With none of these the demo renders exactly as before. Everything stays labeled as sample data.
  - Example: `?biz=Shelter%20Air%20LLC&owner=Kimberly&town=Cold%20Spring&state=NY&services=Mini-split%20deep%20cleaning%2CBoiler%20repair&towns=Beacon%2CGarrison%2CFishkill&color=004438`
- `/make/` builds a link from a small form. The link preview card (Open Graph) is the same generic image for everyone, because static hosting can't tailor it per link.
