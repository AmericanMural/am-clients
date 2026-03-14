# am-clients Repo Notes

Use this repo for client-facing web presentations and interactive review assets.

## Durable Repo Rules

- Keep the site static-first. Reach for Astro pages and content collections before adding heavier client-side architecture.
- Canonical presentation routes live at `/projects/<slug>`.
- Project entries own the content. Templates own the rendering.
- `room-loop` is the first stable presentation contract and expects exactly four walls in room order.
- The root route stays intentionally minimal. Do not turn it into a broad marketing homepage by accident.
- Cloudflare Pages is the likely deploy target later, but domain choice and deployment wiring stay out of scope until explicitly requested.

## Memory Routing

- Put repo-specific viewer rules, template contracts, and anti-regression notes in `memory/`.
- Put Diego workflow or business-context notes in Diego lane memory instead of this repo.
