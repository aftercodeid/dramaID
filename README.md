# DramaID Static Web

The small, bilingual (Indonesian/English) legal and app-store-info site
for the DramaID mobile app: Home, Privacy Policy, Terms of Service, DMCA
Policy, Delete Account, and Support/Contact. No catalog, no CMS, no API
calls — pure static Astro output.

## Develop

```bash
npm install
npm run dev
```

## Build and verify

```bash
npm run build
npm run check-links
```

`check-links` walks the built `dist/` output and fails if any internal
link points at a page that doesn't exist — the one real verification
this project has (see `scripts/check-links.mjs`).

## Content

Page copy lives as Markdown in `src/content/pages/<locale>/<slug>.md`
(the `pages` content collection, `src/content.config.ts`). Every
non-obvious drafting assumption in that copy is flagged inline with an
`<!-- ASSUMPTION: ... -->` comment — stripped from the built HTML by the
`stripHtmlComments` remark plugin in `astro.config.mjs`, and mirrored in
full at `docs/content-assumptions.md`. Review that checklist before
relying on this site's drafted legal text for an actual app-store
submission.

Indonesian (`id`) is the default locale at the root (`/`, `/privacy`, …);
English (`en`) is `/en`-prefixed.
