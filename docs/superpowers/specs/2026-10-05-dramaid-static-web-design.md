# DramaID static web: app-store/legal pages site

Date: 2026-10-05
Status: proposed

## Problem

DramaID's mobile app needs a small set of public web pages before it can be
submitted to the Google Play Store and Apple App Store: a privacy policy,
terms of service, a DMCA policy, and an account-deletion page, plus a
support/contact point. Apple in particular requires a reachable URL for
account deletion instructions and for the privacy policy; Google Play
requires a privacy policy URL.

The backend already promises these URLs to the client: `GET /app/config`
(contract 3.1) serves `legal.termsUrl`, `legal.privacyUrl`, and
`legal.helpUrl`, but today those default to placeholder addresses
(`https://dramaid.app/terms`, etc.) that resolve to nothing. This project
builds the pages those URLs are supposed to point to.

This is modeled on an existing sibling project,
[nusakomik-web](https://nusakomik-web.wahidev.dev/) (a brochure site for a
related comics-reader app): a handful of static, bilingual (Indonesian/
English) pages — About, Support, Privacy Policy, Terms of Service, DMCA
Policy, Delete Account — with no catalog, search, or dynamic content. That
site is the scope model: DramaID's version is not a content-discovery
catalog, just the pages the mobile app and the app stores need.

## Scope

**In scope:** six pages, each in Indonesian (default) and English:

1. Home — short "what is DramaID" landing page, links to the other five
2. Privacy Policy
3. Terms of Service
4. DMCA Policy
5. Delete Account — instructions for requesting account deletion
6. Support / Contact

Plus the supporting infrastructure: a shared layout (header, language
switcher, footer), basic SEO (meta/OG tags, sitemap, robots.txt, submission
to Google Search Console after launch), and a Vercel deployment.

**Out of scope** (this is the scope the user explicitly declined in favor of
the smaller option):

- Any drama catalog browsing, search, or detail pages fed by the DramaID
  API. The site has no runtime dependency on `apps/backend` at all.
- A CMS or admin UI for editing legal content — content is Markdown files
  in the repo, edited the same way code is.
- Analytics, cookie-consent banners, or any client-side JavaScript beyond
  what Astro's default static output needs (i.e., effectively none).

If the catalog-SEO scope is wanted later, it is a separate project: this
site's Astro foundation supports it, but building it now would be
speculative scope the user did not ask for.

## Design

### Repository and stack

New, separate repository at `dramaID-static-web` (sibling to the `system`
monorepo, not a workspace inside it — the two have no code or deploy
dependency on each other). Built with **Astro**, chosen over two
alternatives considered:

- *Plain static HTML* (what nusakomik-web itself appears to be): no build
  step, but 12 pages (6 topics × 2 languages) sharing one header/footer/
  color system means hand-duplicating markup in 12 files, with every future
  edit to the header or a color token requiring 12 manual edits.
- *Next.js*: appropriate if this grows into a full API-backed catalog site
  later, but brings a React runtime and SSR/routing machinery this
  all-static, no-API scope doesn't use.

Astro ships zero JavaScript to the client by default (good for SEO and load
time), supports a shared `Layout.astro` so the header/footer/design tokens
exist once, and has first-class static-site i18n routing and a Vercel
adapter/preset requiring no custom configuration.

### Visual design: the Miru token set

The user supplied a screenshot of an existing design-token reference
(labeled "Miru" — presumably the mobile app's own design system, sharing
its neutral ladder with a DramaID-specific rose accent). This site reuses
those tokens as CSS custom properties, not Tailwind or a component library
— there are only a handful of pages and no interactive components beyond a
language switcher, so a small `tokens.css` is proportionate.

| Token | Value | Use |
|---|---|---|
| `--accent-400` | `#F06A80` | text links, icons, focus ring |
| `--accent-600` | `#D63650` | primary button / CTA fill |
| `--accent-700` | `#B82B44` | pressed state |
| `--accent-950` | `#3D0F19` | soft badge background (text on it uses `--accent-200`) |
| `--accent-50`…`--accent-950` | `#FFF0F2` → `#3D0F19` | full 11-step ramp, carried over verbatim for any future need |
| `--bg` | `#0A0B0F` | page background |
| `--surface` | `#14161D` | cards |
| `--raised` | `#1C1F28` | header/footer, sheets |
| `--overlay` | `#262A35` | pressed/selected state |
| `--border` | `#2A2E38` | hairlines |
| `--text-primary` | `#F4F5F7` | body text |
| `--text-secondary` | `#A2A6B0` | secondary text |
| `--text-muted` | `#656974` | metadata only, never body copy |
| `--error` | `#FF7A45` | — |
| `--success` | `#3CCB7F` | — |
| `--warning` | `#F2B33D` | — |
| `--info` | `#6FA8FF` | — |

The region-badge tokens (`region.KR`, `region.CN`, …) from the same
screenshot are catalog-specific (used for a series' country badge) and have
no use on a page set with no catalog content — they are not carried into
this project. If the catalog-SEO scope is built later, pull them from the
same source then.

Dark theme only — the reference screenshot is a dark palette with no
documented light counterpart, and nusakomik-web itself is dark-only, so
there is no light-mode requirement to reverse-engineer.

### i18n and routing

Indonesian is the default locale at the root (`/`, `/privacy`, `/terms`,
`/dmca`, `/delete-account`, `/support`); English is prefixed (`/en/`,
`/en/privacy`, …), using Astro's built-in i18n routing
(`i18n.defaultLocale: "id"`, `i18n.locales: ["id", "en"]`,
`i18n.routing.prefixDefaultLocale: false`). A small language switcher in
the header toggles between the current page's `id`/`en` counterpart.

Content lives in Astro Content Collections: one Markdown file per
page-per-language (`src/content/pages/id/privacy.md`,
`src/content/pages/en/privacy.md`, etc.), each with frontmatter for the
page title and meta description. This keeps legal text reviewable and
editable as plain text files — the user reviews/edits Markdown directly,
not Astro/JSX.

### Content authorship

The user has not supplied final legal text. This plan drafts all six
topics in both languages as a reasonable starting point for a drama
streaming/aggregation app (data collected, no account data sold, cookie
use, DMCA takedown process, account-deletion mechanics), with every
drafting assumption called out inline (as an HTML comment in the Markdown
source) so it's easy to find and correct. **These drafts are not legal
advice and must be reviewed before the site goes live** — this spec does
not claim otherwise, and the implementation plan's testing section will
not claim the drafted text is verified correct, only that it renders.

### SEO

- Per-page `<title>`, meta description, and Open Graph tags (from each
  Markdown file's frontmatter).
- `sitemap.xml` via Astro's official sitemap integration (auto-generated
  from the routes above).
- `robots.txt` allowing all crawlers (nothing on this site should be
  excluded from indexing — unlike an app, there's no private content here).
- Submission to Google Search Console is a manual post-deploy step (needs
  the live Vercel URL/custom domain and Search Console account access the
  implementer doesn't have) — out of scope for the implementation plan,
  listed as a post-deploy step like the content-flags plan's production
  rollout notes.

### Deployment

Vercel, connected directly to this repository with the Astro framework
preset (zero custom config needed — Vercel detects Astro and builds with
`astro build`). No environment variables are needed since the site has no
API calls.

### Testing

Honestly scoped to what a static content site can be tested for — there is
no application logic:

- `astro build` succeeds with no errors (this is close to the whole test
  surface: broken frontmatter, a bad import, or an unresolvable content
  collection reference all fail the build).
- An internal-link check (every `href` pointing at another page on this
  site resolves to a real route) — scriptable, catches the common mistake
  of linking `/en/privacy` before the English content collection entry
  exists.
- Manual visual review of all 12 pages against the Miru token set, in both
  languages, before launch.

There are no unit tests to write, because there is no non-trivial logic —
pretending otherwise would be the same kind of unearned test-coverage
claim the content-flags project's spec explicitly avoided.

## Out of scope (recap)

- Catalog browsing/search/detail pages fed by the DramaID API.
- CMS/admin UI.
- Analytics or cookie-consent tooling.
- Light theme.
- Region badge tokens (catalog-specific, unused here).
- Actually submitting to Google Search Console (manual, post-deploy, needs
  account access the implementer doesn't have).
- Final legal review/sign-off of the drafted policy text.
