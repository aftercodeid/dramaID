# Content Assumptions Checklist

Every legal/informational page in this site was drafted from reasonable
starting assumptions, not confirmed facts or reviewed legal advice. This
file is the single checklist of every assumption flagged inline (as an
HTML comment, stripped from the built site by `astro.config.mjs`'s
`stripHtmlComments` remark plugin) in the Markdown sources under
`src/content/pages/`. Review every row before relying on this site for
an actual app-store submission.

## Home

- `src/content/pages/id/home.md`, `src/content/pages/en/home.md`: no official app-store links yet; fill in once the app is live.

## Privacy Policy

- `src/content/pages/id/privacy.md`, `src/content/pages/en/privacy.md`:
  1. Contact address uses the `dramaid.app` domain placeholder (matches backend's `legal.privacyUrl` default in `GET /app/config`); update once the real domain is chosen.
  2. States no confirmed third-party ad/analytics SDK is in the app; correct if one is actually in use.

## Terms of Service

- `src/content/pages/id/terms.md`, `src/content/pages/en/terms.md`:
  1. The "DramaID does not host video files" clause reflects the current architecture (crawler stores metadata only, player fetches links on-device) — keep accurate if the architecture changes.
  2. The 13-year-old age floor is a general assumption (COPPA-adjacent convention); confirm the actual intended age policy.
  3. Indonesian governing-law jurisdiction was chosen based on app name/audience; confirm if this needs to change.

## DMCA Policy

- `src/content/pages/id/dmca.md`, `src/content/pages/en/dmca.md`:
  1. Contact address (`dmca@dramaid.app`) uses the same domain placeholder as other contacts; update if the real domain differs.
  2. The counter-notice/complaint process follows the US DMCA framework (17 U.S.C. §512), while the Terms designate Indonesian jurisdiction and no DMCA agent is registered with the U.S. Copyright Office (required for safe-harbor protection). Confirm with legal counsel whether this process is appropriate or should be adapted to Indonesia's own copyright mechanism (UU Hak Cipta).
  3. "Within a reasonable time" has no defined SLA; adjust if the team sets a specific target.

## Delete Account

- `src/content/pages/id/delete-account.md`, `src/content/pages/en/delete-account.md`:
  1. Assumes a Settings > Profile > Delete Account menu structure; adjust if the real menu layout differs. The backend endpoint (`DELETE /me`) already exists per `docs/api-contract.md` section 3.10.

## Support / Contact

- `src/content/pages/id/support.md`, `src/content/pages/en/support.md`:
  1. No official response-time SLA exists yet; the "2–3 business days" estimate should be adjusted once the team sets an official target.
