# DramaID Static Web (App-Store/Legal Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship a small, bilingual (Indonesian/English), fully static
website — Home, Privacy Policy, Terms of Service, DMCA Policy, Delete
Account, Support — so the mobile app has real URLs for `GET /app/config`'s
`legal.privacyUrl`/`legal.termsUrl`/`legal.helpUrl`, and so the app can be
submitted to the Google Play Store and Apple App Store.

**Architecture:** A brand-new Astro project (static output, zero client
JavaScript, zero API calls) in its own repository. One shared `Layout.astro`
carries the header, footer, language switcher, and the Miru design-token
CSS. Each of the 6 topics is one Astro Content Collection entry per
language (12 Markdown files total), rendered by 12 thin `.astro` page
files. Indonesian is the default locale at the root; English is
`/en`-prefixed, via Astro's built-in i18n routing.

**Tech Stack:** Astro 7.x, `@astrojs/sitemap` for sitemap generation, plain
CSS custom properties for the design tokens (no Tailwind/component
library — too small a surface to justify one), deployed to Vercel with
zero custom config (Vercel auto-detects static Astro output).

**Spec:** [`docs/superpowers/specs/2026-10-05-dramaid-static-web-design.md`](../specs/2026-10-05-dramaid-static-web-design.md)

## Global Constraints

- No API calls to `apps/backend` or any other service — this site is 100%
  static content, by design (see spec's "Out of scope").
- Indonesian (`id`) is the default locale, served unprefixed at the root
  (`/`, `/privacy`, …); English (`en`) is prefixed (`/en/`, `/en/privacy`, …).
- Dark theme only, using the Miru token values below verbatim — no light
  mode, no alternate palette.
- Drafted legal content is a starting point for the user's review, not
  final legal text. Every non-obvious drafting assumption (what data is
  collected, the support contact address, governing jurisdiction, etc.)
  is flagged with an HTML comment (`<!-- ASSUMPTION: ... -->`) directly
  above the relevant content in the Markdown source, so it's easy to find
  and correct without re-reading the whole file.
- No unit tests are written for this project — there is no non-trivial
  logic to unit-test. Each task's test step is `npm run build` succeeding
  (the realistic failure mode for a static content site: a missing
  content-collection entry, a bad frontmatter field, or a broken import).
  Task 8 adds the one piece of actual verification logic this project
  has: an internal-link checker script.
- Design tokens (exact values, from the user-supplied Miru reference):

  | Token | Value |
  |---|---|
  | `--accent-50` | `#FFF0F2` |
  | `--accent-100` | `#FFDCE1` |
  | `--accent-200` | `#FFB8C3` |
  | `--accent-300` | `#FA91A2` |
  | `--accent-400` | `#F06A80` |
  | `--accent-500` | `#E24E67` |
  | `--accent-600` | `#D63650` |
  | `--accent-700` | `#B82B44` |
  | `--accent-800` | `#8F2236` |
  | `--accent-900` | `#641929` |
  | `--accent-950` | `#3D0F19` |
  | `--bg` | `#0A0B0F` |
  | `--surface` | `#14161D` |
  | `--raised` | `#1C1F28` |
  | `--overlay` | `#262A35` |
  | `--border` | `#2A2E38` |
  | `--text-primary` | `#F4F5F7` |
  | `--text-secondary` | `#A2A6B0` |
  | `--text-muted` | `#656974` |
  | `--error` | `#FF7A45` |
  | `--success` | `#3CCB7F` |
  | `--warning` | `#F2B33D` |
  | `--info` | `#6FA8FF` |

---

### Task 1: Project scaffold, design tokens, shared layout

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `public/robots.txt`
- Create: `src/styles/tokens.css`
- Create: `src/layouts/Layout.astro`
- Create: `src/pages/index.astro` (temporary proof-of-build placeholder —
  Task 2 replaces this with the real, content-driven Home page)

**Interfaces:**
- Produces: `Layout.astro` — a default-export Astro component accepting
  props `{ title: string; description: string; locale: "id" | "en" }`,
  rendering `<html lang={locale}>`, a `<head>` with title/meta-description/
  charset/viewport, `tokens.css` imported, a header containing the site
  name and a language-switcher slot (built in Task 2, stubbed here as
  empty), a `<main><slot /></main>`, and a footer with a copyright line.
  Every later task's pages wrap their content in this layout.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "dramaid-static-web",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check-links": "node scripts/check-links.mjs"
  },
  "dependencies": {
    "astro": "^7.3.5",
    "@astrojs/sitemap": "^3.7.4"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Write `.gitignore`**

```
dist/
.astro/
node_modules/
.vercel/
```

- [ ] **Step 4: Write `astro.config.mjs`**

```javascript
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://dramaid.app",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "id",
        locales: { id: "id-ID", en: "en-US" },
      },
    }),
  ],
  i18n: {
    defaultLocale: "id",
    locales: ["id", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

(`site: "https://dramaid.app"` is a placeholder for the final domain —
`<!-- ASSUMPTION -->`-style flag: update it once the real domain is chosen,
since `@astrojs/sitemap` needs the real deployed origin to emit correct
absolute URLs.)

- [ ] **Step 5: Write `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://dramaid.app/sitemap-index.xml
```

- [ ] **Step 6: Write the design tokens**

Create `src/styles/tokens.css`:

```css
:root {
  --accent-50: #FFF0F2;
  --accent-100: #FFDCE1;
  --accent-200: #FFB8C3;
  --accent-300: #FA91A2;
  --accent-400: #F06A80;
  --accent-500: #E24E67;
  --accent-600: #D63650;
  --accent-700: #B82B44;
  --accent-800: #8F2236;
  --accent-900: #641929;
  --accent-950: #3D0F19;

  --bg: #0A0B0F;
  --surface: #14161D;
  --raised: #1C1F28;
  --overlay: #262A35;
  --border: #2A2E38;

  --text-primary: #F4F5F7;
  --text-secondary: #A2A6B0;
  --text-muted: #656974;

  --error: #FF7A45;
  --success: #3CCB7F;
  --warning: #F2B33D;
  --info: #6FA8FF;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
}

a { color: var(--accent-400); }
a:hover { color: var(--accent-300); }

h1, h2, h3 { line-height: 1.25; }

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.25rem;
}
```

- [ ] **Step 7: Write the shared layout**

Create `src/layouts/Layout.astro`:

```astro
---
import "../styles/tokens.css";

interface Props {
  title: string;
  description: string;
  locale: "id" | "en";
}

const { title, description, locale } = Astro.props;
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} · DramaID</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={`${title} · DramaID`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <header style="background: var(--raised); border-bottom: 1px solid var(--border); padding: 1rem 0;">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
        <a href={locale === "id" ? "/" : "/en"} style="color: var(--text-primary); font-weight: 700; text-decoration: none; font-size: 1.1rem;">DramaID</a>
        <slot name="lang-switch" />
      </div>
    </header>
    <main class="container" style="padding: 2.5rem 1.25rem;">
      <slot />
    </main>
    <footer style="border-top: 1px solid var(--border); color: var(--text-muted); padding: 1.5rem 0; margin-top: 2rem;">
      <div class="container">
        <p>&copy; {new Date().getFullYear()} DramaID.</p>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 8: Write a temporary placeholder home page**

Create `src/pages/index.astro` (Task 2 replaces this with the real,
content-collection-driven version):

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="DramaID" description="DramaID" locale="id">
  <h1>Scaffold OK</h1>
</Layout>
```

- [ ] **Step 9: Install dependencies and verify the build**

Run: `npm install`
Run: `npm run build`
Expected: build succeeds, `dist/index.html` exists and contains
`Scaffold OK`.

- [ ] **Step 10: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .gitignore public/robots.txt src/styles/tokens.css src/layouts/Layout.astro src/pages/index.astro package-lock.json
git commit -m "chore: scaffold Astro project with Miru design tokens and base layout"
```

---

### Task 2: Content collection schema, i18n routing, language switcher, real Home page

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/pages/id/home.md`
- Create: `src/content/pages/en/home.md`
- Create: `src/components/LangSwitch.astro`
- Modify: `src/layouts/Layout.astro` (fill the `lang-switch` slot's caller
  side — pass a `currentPath` prop through so `LangSwitch` can compute the
  sibling-locale URL)
- Modify: `src/pages/index.astro` (replace the Task 1 placeholder with the
  real, content-collection-driven Home page)
- Create: `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Layout.astro` from Task 1 (`{ title, description, locale }`).
- Produces: the `pages` content collection (`getEntry("pages", id)` /
  `render(entry)`, both from `astro:content`), entry IDs shaped
  `"<locale>/<slug>"` (e.g. `"id/home"`, `"en/privacy"`) — every later
  task's page files use this exact ID shape to look up their entry.
  `LangSwitch.astro` — props `{ locale: "id" | "en"; slug: string }`
  (`slug` is the topic name without locale, e.g. `"privacy"`, or `""` for
  home) — every later task's pages pass their own `slug` to it.

- [ ] **Step 1: Define the content collection**

Create `src/content.config.ts`:

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { pages };
```

(Entries are addressed by their path relative to `base`, without the
extension — a file at `src/content/pages/id/home.md` has the collection ID
`"id/home"`.)

- [ ] **Step 2: Write the Home content (both languages)**

Create `src/content/pages/id/home.md`:

```markdown
---
title: "Beranda"
description: "DramaID — aplikasi untuk menonton drama Asia."
---

# DramaID

DramaID adalah aplikasi untuk menjelajahi dan menonton drama serta film
Asia. Halaman ini bukan aplikasinya — ini adalah situs pendukung yang
memuat kebijakan dan informasi yang dibutuhkan untuk publikasi aplikasi
di Google Play dan App Store.

<!-- ASSUMPTION: belum ada link store resmi; isi setelah aplikasi live. -->

## Tautan

- [Kebijakan Privasi](/privacy)
- [Ketentuan Layanan](/terms)
- [Kebijakan DMCA](/dmca)
- [Hapus Akun](/delete-account)
- [Bantuan & Kontak](/support)
```

Create `src/content/pages/en/home.md`:

```markdown
---
title: "Home"
description: "DramaID — an app for watching Asian dramas."
---

# DramaID

DramaID is an app for discovering and watching Asian dramas and movies.
This page is not the app itself — it's a supporting site carrying the
policies and information required to publish the app on Google Play and
the App Store.

<!-- ASSUMPTION: no official store links yet; fill in once the app is live. -->

## Links

- [Privacy Policy](/en/privacy)
- [Terms of Service](/en/terms)
- [DMCA Policy](/en/dmca)
- [Delete Account](/en/delete-account)
- [Support & Contact](/en/support)
```

- [ ] **Step 3: Write the language switcher**

Create `src/components/LangSwitch.astro`:

```astro
---
interface Props {
  locale: "id" | "en";
  slug: string; // "" for home, "privacy", "terms", "dmca", "delete-account", "support"
}

const { locale, slug } = Astro.props;
const idPath = slug ? `/${slug}` : "/";
const enPath = slug ? `/en/${slug}` : "/en";
---

<nav style="display: flex; gap: 0.75rem; font-size: 0.9rem;">
  <a href={idPath} aria-current={locale === "id" ? "page" : undefined} style={locale === "id" ? "color: var(--text-primary); font-weight: 700;" : "color: var(--text-secondary);"}>ID</a>
  <a href={enPath} aria-current={locale === "en" ? "page" : undefined} style={locale === "en" ? "color: var(--text-primary); font-weight: 700;" : "color: var(--text-secondary);"}>EN</a>
</nav>
```

- [ ] **Step 4: Wire the language switcher into the layout**

Modify `src/layouts/Layout.astro` — add a `slug` prop and pass it through
to a `LangSwitch` instance filling the `lang-switch` slot at the call site
(every page passes its own `slug`, so the layout itself stays generic):

Replace the `Props` interface and the header's `<slot name="lang-switch" />`:

```astro
---
import "../styles/tokens.css";
import LangSwitch from "../components/LangSwitch.astro";

interface Props {
  title: string;
  description: string;
  locale: "id" | "en";
  slug: string;
}

const { title, description, locale, slug } = Astro.props;
---
```

```astro
        <LangSwitch locale={locale} slug={slug} />
```

(replaces the `<slot name="lang-switch" />` line from Task 1 — the layout
now renders the switcher itself rather than expecting callers to fill a
slot, since every page needs the same `LangSwitch` wired to its own
`slug`, which is simpler as a direct prop than a slot).

- [ ] **Step 5: Write the real Home pages**

Replace `src/pages/index.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "id/home");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="id" slug="">
  <Content />
</Layout>
```

Create `src/pages/en/index.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "en/home");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="en" slug="">
  <Content />
</Layout>
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: FAILS before this step exists (there's no `en/home` entry yet
until Step 2 lands, and `src/pages/index.astro` referenced a content
entry that doesn't exist until Step 2's content lands) — the realistic
"red" for this project is exactly this: reference a collection entry
before it exists. Having written Step 2's content already, re-run:

Run: `npm run build`
Expected: PASS — `dist/index.html` and `dist/en/index.html` both exist and
contain "DramaID".

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/pages/id/home.md src/content/pages/en/home.md src/components/LangSwitch.astro src/layouts/Layout.astro src/pages/index.astro src/pages/en/index.astro
git commit -m "feat: content collection, i18n routing, language switcher, real Home page"
```

---

### Task 3: Privacy Policy

**Files:**
- Create: `src/content/pages/id/privacy.md`
- Create: `src/content/pages/en/privacy.md`
- Create: `src/pages/privacy.astro`
- Create: `src/pages/en/privacy.astro`

**Interfaces:**
- Consumes: `Layout.astro` (Task 1/2), the `pages` collection (Task 2).

- [ ] **Step 1: Write the page files (will fail to build — no content yet)**

Create `src/pages/privacy.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "id/privacy");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="id" slug="privacy">
  <Content />
</Layout>
```

Create `src/pages/en/privacy.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "en/privacy");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="en" slug="privacy">
  <Content />
</Layout>
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL — `getEntry("pages", "id/privacy")` resolves to `undefined`
at build time, and `render(undefined!)` throws.

- [ ] **Step 3: Write the content**

Create `src/content/pages/id/privacy.md`:

```markdown
---
title: "Kebijakan Privasi"
description: "Bagaimana DramaID mengumpulkan dan menggunakan data Anda."
---

# Kebijakan Privasi

_Terakhir diperbarui: 5 Oktober 2026_

<!-- ASSUMPTION: alamat kontak privasi di bawah pakai domain dramaid.app,
     sesuai default yang sudah dipakai backend (legal.privacyUrl dkk di
     GET /app/config). Ganti kalau domain resminya berbeda. -->

Kebijakan ini menjelaskan data apa yang dikumpulkan DramaID ("kami"),
untuk apa data itu digunakan, dan hak Anda atasnya.

## Data yang kami kumpulkan

- **Data akun**: saat Anda masuk lewat Google atau Apple, kami menerima
  alamat email dan nama tampilan dari penyedia tersebut. Kami tidak
  menerima atau menyimpan kata sandi akun Google/Apple Anda.
- **Aktivitas tontonan**: progres menonton, riwayat tontonan, dan daftar
  tontonan Anda ("My List"), supaya fitur lanjutkan-menonton bisa bekerja.
- **Komentar**: isi komentar yang Anda kirim pada episode, dan metadata
  terkait (waktu kirim, episode terkait).
- **Data teknis**: log server standar (alamat IP, jenis perangkat, versi
  aplikasi) untuk keamanan dan diagnosis masalah.

<!-- ASSUMPTION: belum ada iklan/analytics pihak ketiga yang terkonfirmasi
     di aplikasi — baris di bawah menyatakan demikian; perbaiki kalau ada
     SDK analytics/iklan yang sebenarnya dipakai. -->

Kami tidak menggunakan SDK iklan pihak ketiga, dan kami tidak menjual data
pribadi Anda kepada pihak ketiga mana pun.

## Bagaimana data digunakan

Data di atas digunakan untuk: menjalankan fitur inti aplikasi (login,
lanjutkan menonton, daftar tontonan, komentar), menjaga keamanan akun, dan
memperbaiki aplikasi berdasarkan laporan masalah.

## Metadata konten

DramaID menampilkan metadata (judul, sinopsis, poster) drama/film dari
sumber publik seperti MyDramaList, dan tautan episode dari penyedia
pihak ketiga. Data ini bukan data pribadi Anda dan tidak terkait akun
Anda.

## Penyimpanan dan retensi

Data akun dan aktivitas disimpan selama akun Anda aktif. Jika Anda
menghapus akun (lihat [Hapus Akun](/delete-account)), data terkait akun
Anda dihapus dari sistem kami, kecuali data yang wajib kami simpan untuk
kepatuhan hukum.

## Hak Anda

Anda bisa meminta salinan data Anda atau menghapus akun Anda kapan saja
lewat menu Pengaturan di aplikasi, atau lewat halaman
[Hapus Akun](/delete-account) jika Anda tidak bisa mengakses aplikasi.

## Kontak

Pertanyaan soal privasi: **privacy@dramaid.app**
```

Create `src/content/pages/en/privacy.md`:

```markdown
---
title: "Privacy Policy"
description: "How DramaID collects and uses your data."
---

# Privacy Policy

_Last updated: October 5, 2026_

<!-- ASSUMPTION: the contact address below uses the dramaid.app domain,
     matching the default already used by the backend (legal.privacyUrl
     etc. in GET /app/config). Update if the real domain differs. -->

This policy explains what data DramaID ("we") collects, what it's used
for, and your rights over it.

## Data we collect

- **Account data**: when you sign in with Google or Apple, we receive
  your email address and display name from that provider. We never
  receive or store your Google/Apple account password.
- **Watch activity**: your watch progress, watch history, and saved list
  ("My List"), so continue-watching works.
- **Comments**: the content of comments you post on episodes, and related
  metadata (post time, the episode it's on).
- **Technical data**: standard server logs (IP address, device type, app
  version) for security and troubleshooting.

<!-- ASSUMPTION: no confirmed third-party ad/analytics SDK in the app —
     the line below states that; correct it if one is actually in use. -->

We do not use third-party advertising SDKs, and we do not sell your
personal data to any third party.

## How data is used

The data above is used to: run the app's core features (login, continue
watching, saved list, comments), keep your account secure, and improve
the app based on reported issues.

## Content metadata

DramaID displays metadata (titles, synopses, posters) for dramas/movies
from public sources such as MyDramaList, and episode links from
third-party providers. This data is not your personal data and is not
tied to your account.

## Storage and retention

Account and activity data is kept while your account is active. If you
delete your account (see [Delete Account](/en/delete-account)), data tied
to your account is removed from our systems, except data we're legally
required to retain.

## Your rights

You can request a copy of your data or delete your account at any time
from the app's Settings menu, or via the [Delete Account](/en/delete-account)
page if you can't access the app.

## Contact

Privacy questions: **privacy@dramaid.app**
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS — `dist/privacy/index.html` and `dist/en/privacy/index.html`
both exist.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/id/privacy.md src/content/pages/en/privacy.md src/pages/privacy.astro src/pages/en/privacy.astro
git commit -m "feat: add Privacy Policy page (id/en)"
```

---

### Task 4: Terms of Service

**Files:**
- Create: `src/content/pages/id/terms.md`
- Create: `src/content/pages/en/terms.md`
- Create: `src/pages/terms.astro`
- Create: `src/pages/en/terms.astro`

**Interfaces:**
- Consumes: `Layout.astro`, the `pages` collection — same pattern as Task 3.

- [ ] **Step 1: Write the page files**

Create `src/pages/terms.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "id/terms");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="id" slug="terms">
  <Content />
</Layout>
```

Create `src/pages/en/terms.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "en/terms");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="en" slug="terms">
  <Content />
</Layout>
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL — no `id/terms`/`en/terms` entries yet.

- [ ] **Step 3: Write the content**

Create `src/content/pages/id/terms.md`:

```markdown
---
title: "Ketentuan Layanan"
description: "Syarat penggunaan aplikasi DramaID."
---

# Ketentuan Layanan

_Terakhir diperbarui: 5 Oktober 2026_

Dengan menggunakan aplikasi DramaID ("Layanan"), Anda setuju dengan
ketentuan berikut.

## Tentang Layanan

DramaID adalah aplikasi yang membantu Anda menemukan dan menonton drama
serta film Asia. DramaID **tidak meng-host atau menyimpan file video**.
Metadata (judul, sinopsis, poster, episode) dikumpulkan dari sumber
publik, dan tautan untuk menonton diarahkan ke penyedia pihak ketiga.

<!-- ASSUMPTION: klausul di atas mencerminkan arsitektur sebenarnya
     (crawler cuma simpan metadata, player ambil link dari kisskh API
     langsung di device — lihat CLAUDE.md "crawler stops at metadata").
     Pastikan tetap akurat kalau arsitektur berubah. -->

## Akun

Anda bertanggung jawab menjaga kerahasiaan akses akun Anda. Anda harus
berusia minimal 13 tahun untuk membuat akun.

<!-- ASSUMPTION: batas usia 13 tahun adalah asumsi umum (mengikuti
     ketentuan umum COPPA-adjacent di banyak app store); konfirmasi
     kebijakan usia yang sebenarnya diinginkan. -->

## Perilaku pengguna

Anda setuju untuk tidak: mengunggah komentar yang melanggar hukum, kasar,
atau melanggar hak pihak lain; mencoba mengakses sistem kami tanpa izin;
atau menggunakan Layanan untuk tujuan ilegal.

Kami berhak menghapus komentar atau menangguhkan akun yang melanggar
ketentuan ini.

## Hak kekayaan intelektual

Konten pihak ketiga (video, judul, poster) yang ditautkan atau ditampilkan
di DramaID adalah milik pemilik hak ciptanya masing-masing. Lihat
[Kebijakan DMCA](/dmca) kami untuk proses pengaduan pelanggaran hak cipta.

## Batasan tanggung jawab

Layanan disediakan "sebagaimana adanya". Kami tidak bertanggung jawab atas
ketersediaan, keakuratan, atau kualitas konten dari penyedia pihak ketiga
yang ditautkan dari aplikasi.

## Perubahan ketentuan

Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan signifikan
akan diinformasikan lewat aplikasi.

## Hukum yang berlaku

<!-- ASSUMPTION: yurisdiksi Indonesia dipilih karena nama aplikasi dan
     audiens targetnya; konfirmasi kalau ini perlu diubah. -->

Ketentuan ini tunduk pada hukum Republik Indonesia.

## Kontak

**support@dramaid.app**
```

Create `src/content/pages/en/terms.md`:

```markdown
---
title: "Terms of Service"
description: "Terms for using the DramaID app."
---

# Terms of Service

_Last updated: October 5, 2026_

By using the DramaID app (the "Service"), you agree to the following
terms.

## About the Service

DramaID is an app that helps you discover and watch Asian dramas and
movies. DramaID **does not host or store video files**. Metadata
(titles, synopses, posters, episodes) is gathered from public sources,
and watch links route to third-party providers.

<!-- ASSUMPTION: the clause above reflects the actual architecture (the
     crawler only stores metadata; the player fetches links straight from
     the kisskh API on-device — see CLAUDE.md "crawler stops at
     metadata"). Keep this accurate if the architecture changes. -->

## Accounts

You're responsible for keeping your account access confidential. You
must be at least 13 years old to create an account.

<!-- ASSUMPTION: the 13-years-old floor is a common baseline (adjacent to
     typical COPPA-style app-store conventions); confirm the actual
     intended age policy. -->

## User conduct

You agree not to: post comments that are unlawful, abusive, or infringe
others' rights; attempt to access our systems without authorization; or
use the Service for any illegal purpose.

We may remove comments or suspend accounts that violate these terms.

## Intellectual property

Third-party content (video, titles, posters) linked or displayed on
DramaID belongs to its respective rights holders. See our
[DMCA Policy](/en/dmca) for the copyright-complaint process.

## Limitation of liability

The Service is provided "as is." We are not responsible for the
availability, accuracy, or quality of content from third-party providers
linked from the app.

## Changes to these terms

We may update these terms from time to time. Significant changes will be
announced in the app.

## Governing law

<!-- ASSUMPTION: Indonesian jurisdiction chosen based on the app's name
     and target audience; confirm if this needs to change. -->

These terms are governed by the laws of the Republic of Indonesia.

## Contact

**support@dramaid.app**
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/id/terms.md src/content/pages/en/terms.md src/pages/terms.astro src/pages/en/terms.astro
git commit -m "feat: add Terms of Service page (id/en)"
```

---

### Task 5: DMCA Policy

**Files:**
- Create: `src/content/pages/id/dmca.md`
- Create: `src/content/pages/en/dmca.md`
- Create: `src/pages/dmca.astro`
- Create: `src/pages/en/dmca.astro`

**Interfaces:**
- Consumes: `Layout.astro`, the `pages` collection — same pattern as Task 3.

- [ ] **Step 1: Write the page files**

Create `src/pages/dmca.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "id/dmca");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="id" slug="dmca">
  <Content />
</Layout>
```

Create `src/pages/en/dmca.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "en/dmca");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="en" slug="dmca">
  <Content />
</Layout>
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL — no `id/dmca`/`en/dmca` entries yet.

- [ ] **Step 3: Write the content**

Create `src/content/pages/id/dmca.md`:

```markdown
---
title: "Kebijakan DMCA"
description: "Proses pengaduan pelanggaran hak cipta untuk DramaID."
---

# Kebijakan DMCA

_Terakhir diperbarui: 5 Oktober 2026_

DramaID menghormati hak kekayaan intelektual pihak lain. **DramaID tidak
meng-host file video** — aplikasi menampilkan metadata dari sumber publik
dan tautan ke penyedia pihak ketiga. Jika Anda yakin konten yang ditautkan
dari DramaID melanggar hak cipta Anda, Anda bisa mengirimkan pengaduan
kepada kami.

## Cara mengirim pengaduan

Kirim email ke **dmca@dramaid.app** dengan informasi berikut:

1. Tanda tangan (fisik atau elektronik) pemilik hak cipta atau orang yang
   berwenang mewakilinya.
2. Identifikasi karya berhak cipta yang menurut Anda dilanggar.
3. Identifikasi lokasi konten di aplikasi DramaID (judul drama/episode,
   atau tautan/tangkapan layar).
4. Informasi kontak Anda (nama, alamat, telepon, email).
5. Pernyataan bahwa Anda dengan itikad baik yakin penggunaan konten
   tersebut tidak diizinkan oleh pemilik hak cipta, agennya, atau hukum.
6. Pernyataan bahwa informasi dalam pengaduan akurat, dan bahwa Anda
   berwenang bertindak atas nama pemilik hak cipta.

## Yang akan kami lakukan

Setelah menerima pengaduan yang lengkap, kami akan meninjau dan — jika
sesuai — menghapus atau menonaktifkan akses ke metadata/tautan terkait
di aplikasi kami dalam waktu wajar.

## Pengaduan balik (counter-notice)

Jika Anda yakin konten Anda dihapus secara keliru, Anda bisa mengirim
pengaduan balik ke alamat yang sama dengan: identifikasi konten yang
dihapus, pernyataan di bawah sumpah bahwa penghapusan itu keliru, dan
persetujuan terhadap yurisdiksi pengadilan yang berlaku.

## Pelanggar berulang

Kami dapat menangguhkan atau menghentikan akses pengguna yang berulang
kali menjadi subjek pengaduan hak cipta yang sah.

## Kontak

**dmca@dramaid.app**
```

Create `src/content/pages/en/dmca.md`:

```markdown
---
title: "DMCA Policy"
description: "Copyright complaint process for DramaID."
---

# DMCA Policy

_Last updated: October 5, 2026_

DramaID respects the intellectual property rights of others. **DramaID
does not host video files** — the app displays metadata from public
sources and links to third-party providers. If you believe content
linked from DramaID infringes your copyright, you can submit a complaint
to us.

## How to submit a complaint

Email **dmca@dramaid.app** with the following information:

1. A physical or electronic signature of the copyright owner or a person
   authorized to act on their behalf.
2. Identification of the copyrighted work you claim is infringed.
3. Identification of where the content appears in the DramaID app (the
   drama/episode title, or a link/screenshot).
4. Your contact information (name, address, phone, email).
5. A statement that you have a good-faith belief the use is not
   authorized by the copyright owner, its agent, or the law.
6. A statement that the information in the complaint is accurate, and
   that you are authorized to act on the copyright owner's behalf.

## What we'll do

Once we receive a complete complaint, we'll review it and — where
appropriate — remove or disable access to the related metadata/links in
our app within a reasonable time.

## Counter-notice

If you believe your content was removed in error, you can send a
counter-notice to the same address with: identification of the removed
content, a statement under penalty of perjury that the removal was a
mistake, and your consent to the jurisdiction of the applicable courts.

## Repeat infringers

We may suspend or terminate access for users who are repeatedly the
subject of valid copyright complaints.

## Contact

**dmca@dramaid.app**
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/id/dmca.md src/content/pages/en/dmca.md src/pages/dmca.astro src/pages/en/dmca.astro
git commit -m "feat: add DMCA Policy page (id/en)"
```

---

### Task 6: Delete Account

**Files:**
- Create: `src/content/pages/id/delete-account.md`
- Create: `src/content/pages/en/delete-account.md`
- Create: `src/pages/delete-account.astro`
- Create: `src/pages/en/delete-account.astro`

**Interfaces:**
- Consumes: `Layout.astro`, the `pages` collection — same pattern as Task 3.

- [ ] **Step 1: Write the page files**

Create `src/pages/delete-account.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "id/delete-account");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="id" slug="delete-account">
  <Content />
</Layout>
```

Create `src/pages/en/delete-account.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "en/delete-account");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="en" slug="delete-account">
  <Content />
</Layout>
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL — no `id/delete-account`/`en/delete-account` entries yet.

- [ ] **Step 3: Write the content**

Create `src/content/pages/id/delete-account.md`:

```markdown
---
title: "Hapus Akun"
description: "Cara menghapus akun DramaID Anda."
---

# Hapus Akun

Anda bisa menghapus akun DramaID Anda kapan saja. Berikut caranya.

## Lewat aplikasi (cara tercepat)

1. Buka aplikasi DramaID dan masuk ke **Pengaturan**.
2. Pilih **Profil** → **Hapus Akun**.
3. Konfirmasi penghapusan.

Akun dan data terkait (progres tontonan, daftar tontonan, komentar) akan
dihapus dari sistem kami.

<!-- ASSUMPTION: langkah di atas mengasumsikan menu disusun Pengaturan >
     Profil > Hapus Akun; sesuaikan kalau susunan menu sebenarnya beda.
     Endpoint backend-nya (DELETE /me) sudah ada per docs/api-contract.md
     bagian 3.10. -->

## Tidak bisa akses aplikasi?

Jika Anda tidak bisa masuk ke aplikasi (misalnya lupa cara masuk, atau
sudah uninstall), kirim email permintaan penghapusan akun ke:

**privacy@dramaid.app**

Sertakan alamat email yang terdaftar di akun Anda. Kami akan memproses
permintaan dalam waktu wajar setelah memverifikasi kepemilikan akun.

## Apa yang terjadi setelah dihapus

- Profil, progres tontonan, daftar tontonan, dan komentar Anda dihapus.
- Beberapa data mungkin tetap disimpan sebentar jika diwajibkan hukum,
  sesuai [Kebijakan Privasi](/privacy) kami.
- Penghapusan tidak bisa dibatalkan.
```

Create `src/content/pages/en/delete-account.md`:

```markdown
---
title: "Delete Account"
description: "How to delete your DramaID account."
---

# Delete Account

You can delete your DramaID account at any time. Here's how.

## In the app (fastest)

1. Open the DramaID app and go to **Settings**.
2. Select **Profile** → **Delete Account**.
3. Confirm the deletion.

Your account and related data (watch progress, saved list, comments)
will be removed from our systems.

<!-- ASSUMPTION: the steps above assume a Settings > Profile > Delete
     Account menu structure; adjust if the real menu layout differs. The
     backend endpoint (DELETE /me) already exists per docs/api-contract.md
     section 3.10. -->

## Can't access the app?

If you can't sign into the app (forgot how you signed in, already
uninstalled it, etc.), email an account-deletion request to:

**privacy@dramaid.app**

Include the email address on your account. We'll process the request
within a reasonable time after verifying account ownership.

## What happens after deletion

- Your profile, watch progress, saved list, and comments are removed.
- Some data may be retained briefly where legally required, per our
  [Privacy Policy](/en/privacy).
- Deletion cannot be undone.
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/id/delete-account.md src/content/pages/en/delete-account.md src/pages/delete-account.astro src/pages/en/delete-account.astro
git commit -m "feat: add Delete Account page (id/en)"
```

---

### Task 7: Support / Contact

**Files:**
- Create: `src/content/pages/id/support.md`
- Create: `src/content/pages/en/support.md`
- Create: `src/pages/support.astro`
- Create: `src/pages/en/support.astro`

**Interfaces:**
- Consumes: `Layout.astro`, the `pages` collection — same pattern as Task 3.

- [ ] **Step 1: Write the page files**

Create `src/pages/support.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "id/support");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="id" slug="support">
  <Content />
</Layout>
```

Create `src/pages/en/support.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getEntry, render } from "astro:content";

const entry = await getEntry("pages", "en/support");
const { Content } = await render(entry!);
---

<Layout title={entry!.data.title} description={entry!.data.description} locale="en" slug="support">
  <Content />
</Layout>
```

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL — no `id/support`/`en/support` entries yet.

- [ ] **Step 3: Write the content**

Create `src/content/pages/id/support.md`:

```markdown
---
title: "Bantuan & Kontak"
description: "Cara menghubungi tim DramaID."
---

# Bantuan & Kontak

Ada pertanyaan, masalah teknis, atau masukan soal aplikasi DramaID? Kami
senang mendengarnya.

**Email**: support@dramaid.app

<!-- ASSUMPTION: belum ada SLA waktu respons resmi; baris di bawah
     menyatakan estimasi umum, sesuaikan kalau tim punya target resmi. -->

Kami biasanya membalas dalam 2–3 hari kerja.

## Pertanyaan umum

- **Lupa cara masuk ke akun?** Coba masuk ulang lewat metode yang sama
  (Google atau Apple) yang Anda pakai saat pertama kali daftar.
- **Ingin menghapus akun?** Lihat halaman [Hapus Akun](/delete-account).
- **Menemukan konten yang melanggar hak cipta?** Lihat
  [Kebijakan DMCA](/dmca).
```

Create `src/content/pages/en/support.md`:

```markdown
---
title: "Support & Contact"
description: "How to reach the DramaID team."
---

# Support & Contact

Questions, technical issues, or feedback about the DramaID app? We'd
love to hear from you.

**Email**: support@dramaid.app

<!-- ASSUMPTION: no official response-time SLA exists yet; the line below
     is a general estimate — adjust if the team sets an official target. -->

We typically reply within 2–3 business days.

## Common questions

- **Forgot how to sign in?** Try signing in again with the same method
  (Google or Apple) you used when you first registered.
- **Want to delete your account?** See the [Delete Account](/en/delete-account)
  page.
- **Found content that infringes copyright?** See our
  [DMCA Policy](/en/dmca).
```

- [ ] **Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/pages/id/support.md src/content/pages/en/support.md src/pages/support.astro src/pages/en/support.astro
git commit -m "feat: add Support & Contact page (id/en)"
```

---

### Task 8: 404 page, internal link checker, final SEO pass

**Files:**
- Create: `src/pages/404.astro`
- Create: `scripts/check-links.mjs`

**Interfaces:**
- Consumes: `Layout.astro`. `check-links.mjs` consumes the built
  `dist/` directory (run after `npm run build`) — it has no runtime
  dependency on any other task's exports, just the final HTML output.
- Produces: `npm run check-links` (wired in Task 1's `package.json`) —
  exits non-zero and prints every broken internal link if any page's
  `<a href="...">` pointing at this site resolves to a path with no
  matching file under `dist/`.

- [ ] **Step 1: Write the 404 page**

Create `src/pages/404.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="404" description="Halaman tidak ditemukan." locale="id" slug="">
  <h1>404</h1>
  <p>Halaman tidak ditemukan. <a href="/">Kembali ke beranda</a>.</p>
</Layout>
```

(A single bilingual-agnostic 404 is enough here — Astro serves this file
for any unmatched path regardless of locale prefix, and a 404 page isn't
one of the six content topics the spec scopes, so it doesn't need a
content-collection entry or an `/en/404` counterpart.)

- [ ] **Step 2: Write the link-checker script**

Create `scripts/check-links.mjs`:

```javascript
import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "..", "dist");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function existsAsRoute(href) {
  // Internal links only; ignore external/mailto/anchor links.
  if (!href.startsWith("/")) return true;
  const clean = href.split("#")[0].split("?")[0];
  const candidates = [
    join(distDir, clean, "index.html"),
    join(distDir, `${clean}.html`),
  ];
  return candidates;
}

const htmlFiles = await walk(distDir);
const broken = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const hrefMatches = html.matchAll(/href="([^"]+)"/g);
  for (const [, href] of hrefMatches) {
    if (!href.startsWith("/")) continue; // external/mailto/anchor
    const candidates = existsAsRoute(href);
    const { existsSync } = await import("node:fs");
    const found = candidates.some((c) => existsSync(c));
    if (!found) broken.push({ file: file.replace(distDir, "dist"), href });
  }
}

if (broken.length > 0) {
  console.error(`Found ${broken.length} broken internal link(s):`);
  for (const { file, href } of broken) {
    console.error(`  ${file} -> ${href}`);
  }
  process.exit(1);
}

console.log(`All internal links OK (${htmlFiles.length} pages checked).`);
```

- [ ] **Step 3: Run the full build and the link checker**

Run: `npm run build && npm run check-links`
Expected: build succeeds (13 pages: 6 topics × 2 languages + 404), and
`check-links` prints `All internal links OK (13 pages checked).` with
exit code 0.

If any link is broken, the script's output names the exact file and
`href` — fix the mismatched path in that page/content file and re-run.

- [ ] **Step 4: Commit**

```bash
git add src/pages/404.astro scripts/check-links.mjs
git commit -m "feat: add 404 page and internal link checker"
```

---

## Self-Review

**Spec coverage:**
- 6 topics × 2 languages → Tasks 2 (Home), 3 (Privacy), 4 (Terms), 5
  (DMCA), 6 (Delete Account), 7 (Support).
- Shared layout + Miru tokens → Task 1.
- i18n routing (`id` default at root, `en` prefixed) → Task 1's
  `astro.config.mjs`, Task 2's page structure.
- Language switcher → Task 2.
- SEO: meta/OG tags → Task 1's `Layout.astro` (applies to every page via
  every later task). Sitemap → Task 1's `astro.config.mjs` integration.
  `robots.txt` → Task 1. Google Search Console submission is explicitly
  out of scope for this plan (needs live deploy + account access neither
  task nor implementer has) — listed below as a post-deploy step.
- Content authorship with flagged assumptions → every content file in
  Tasks 2–7 carries `<!-- ASSUMPTION: ... -->` comments.
- Testing scoped honestly (build success + link checker, no fabricated
  unit tests) → every task's test step is `npm run build`; Task 8 adds
  the one real verification script the spec promises.
- Vercel deployment: zero-config static detection means there's no task
  needed for it — it's a post-deploy, not an implementation step (see
  below).

**Placeholder scan:** no "TBD"/"handle it later" — every step has literal
file content. The `<!-- ASSUMPTION -->` comments are a deliberate, spec-
mandated content feature, not a plan placeholder.

**Type consistency:** every page file across Tasks 2–7 follows the exact
same three-line pattern (`getEntry("pages", "<locale>/<slug>")` →
`render(entry!)` → `<Layout ... slug="<slug>">`), and every content file's
frontmatter matches the `z.object({ title: z.string(), description:
z.string() })` schema from Task 2 exactly — no task invents a different
field name.

## Post-Deploy Steps (not part of any task — need the user's own access)

1. **Choose and configure the real domain**, replacing the
   `https://dramaid.app` placeholder in `astro.config.mjs`'s `site` field
   and `public/robots.txt`'s sitemap line.
2. **Connect the repo to Vercel** (vercel.com/new, import this repo,
   accept the auto-detected Astro static preset — no env vars needed).
3. **Point the backend's `legal.*` env vars** (`LEGAL_PRIVACY_URL`,
   `LEGAL_TERMS_URL`, `LEGAL_HELP_URL` in `apps/backend`'s config, per
   `configuration.ts`) at the real deployed URLs, so `GET /app/config`
   stops serving placeholder addresses.
4. **Submit the sitemap to Google Search Console** once the site is live
   at its real domain.
5. **Legal review** of the drafted Privacy Policy, Terms of Service, and
   DMCA Policy content before relying on them for an actual app-store
   submission — this plan drafts reasonable starting text, not reviewed
   legal advice (see every `<!-- ASSUMPTION -->` comment for what to
   check first).
