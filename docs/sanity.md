# LaunchLegit content editing

The Astro website stays at the repository root. `studio/` is an independent Sanity Studio connected to **LaunchLegit**, project **lwe89m68**, dataset **production**, organization **of2GOtAoL**. Only blog posts and homepage use cases are managed in Sanity.

The editor is deployed at **https://launchlegit-lwe89m68.sanity.studio/**. The two existing blog posts and French wellness case study have been imported and published. The local website now reads Sanity content. Automatic production website rebuilds still require the hosting provider's build hook.

## Local development

Use the Node version in `.nvmrc`:

```sh
nvm use
npm ci
npm ci --prefix studio
cp .env.example .env
npm run dev
```

Do not overwrite an existing `.env`. If npm reports root-owned cache files, append `--cache /tmp/launchlegit-npm-cache` to npm install/ci commands.

In another terminal, start the standalone Studio:

```sh
nvm use
npm run studio
```

Astro normally runs on `http://localhost:4321`, Studio on `http://localhost:3333`. Studio requires a Sanity account with access to this project. The website uses the Sanity JavaScript client at build time; Studio is not embedded in the website or included in its browser JavaScript.

### Login redirects to an Astro 404

The Sanity CLI's default login callback port is `4321`, which is also Astro's default port. The Studio `login` script sets `SANITY_CLI_CALLBACK_PORT=0` so the operating system assigns a separate available port for each login attempt.

Cancel the old terminal login with Ctrl+C, close the failed login tab, and run `npm --prefix studio run login` again. Use the fresh browser login flow and keep the terminal running until it reports **Login successful**. Old login links retain their original callback address and cannot use the newly assigned port. The temporary callback server is separate from the Studio editor at `http://localhost:3333`.

## Content source and configuration

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` | Defaults to `lwe89m68` |
| `PUBLIC_SANITY_DATASET` | Defaults to `production` |
| `SANITY_CONTENT_SOURCE` | `sanity` (code default) or explicitly `local` |
| `SANITY_API_READ_TOKEN` | Optional read-only token for a private dataset, kept in build secrets |
| `PUBLIC_SITE_URL` | Public site origin, used for canonical and social URLs |

The checked-in `.env.example` selects `sanity` to read published content. For migration preview, `local` mode renders `content/seed.json`, including the existing two articles and French wellness case study, and uses the existing local cover images. It never queries Sanity. `npm run dev:local` and `npm run build:local` select this mode explicitly.

**After importing, set `SANITY_CONTENT_SOURCE=sanity` in `.env` and the hosting environment.** In Sanity mode, API/authentication failures fail the build. There is no silent fallback to old content: an empty published dataset produces empty sections, and unpublished posts do not get article routes. This prevents removed content from reappearing.

The API version is pinned to `2026-09-05`. Queries use the published perspective and `useCdn: false` to obtain fresh content at build time. Ordinary editing does not require an API token in the website. Do not place tokens or build-hook URLs in `PUBLIC_` or `SANITY_STUDIO_` variables.

## Import existing website content

The seed preserves all article body text, headings, ordered and unordered lists, bold/italic formatting, and the booking link. It uses the article headings/categories as the shared metadata for both cards and detail pages. Reading time is calculated from the body at 200 words per minute. The existing URLs remain:

- `/blog/how-to-sell-on-tiktok-shop`
- `/blog/tiktok-shop-canada`
- `/#case-study`

Run these commands from the repository root after signing in to the account that owns the project:

```sh
nvm use
npm --prefix studio run login
npm --prefix studio run schema:deploy
npm --prefix studio run content:check
npm --prefix studio run content:import
npm --prefix studio run content:validate
```

`content:check` is a dry run. `content:import` uploads the existing cover images and creates the three missing documents as published content, since they were already public on the website. It lets Sanity generate document IDs. It checks `migrationSource` and blog slugs across both drafts and published documents before writing, so sequential reruns skip existing content and never overwrite an editor's changes. Run only one importer at a time.

The migration intentionally targets only `lwe89m68/production`. It does not modify unrelated documents. Do not rerun it to restore content after intentionally deleting all versions of an imported document: the corresponding seed document would be recreated.

Check the imported content in Studio, change `SANITY_CONTENT_SOURCE` to `sanity`, then run `npm run build` and preview the generated pages before deploying the website. The historical article copy has been preserved, not updated or independently fact-checked.

## Editor workflow

**Blog Posts:** Create a post, fill in the title, URL slug, summary, category, publication date, cover image and alt text, and article body. Search/sharing fields are optional and default to the title and summary. The body supports paragraphs, headings, subheadings, quotes, lists, bold, italic, links and captioned images. Keep a published slug unchanged to preserve inbound links; a slug change requires a hosting redirect from the old URL. The publication date controls display and sorting, not scheduled publishing.

**Use Cases:** Fill in the brand origin, industry, target market, challenge, deliverables and outcome. Enable **Show on homepage** and use **Display order** to arrange multiple cases (lower numbers first). Cases use the existing homepage layout; this phase does not add separate case detail URLs.

Saving edits creates a draft. Use **Publish** to make changes available to the website's next build. Unpublishing or deleting content removes it on the next successful website deployment. Local mode does not display Studio changes.

## Studio deployment and CORS

```sh
npm --prefix studio run deploy
```

The deployment application ID is saved in `studio/sanity.cli.ts`, so this updates the existing LaunchLegit editor. If Studio reports a CORS error, add its exact local or deployed origin in the project's API/CORS settings with credentials enabled. Build-time Astro queries do not need the public website added as a browser CORS origin.

## Automatic website rebuilds

Create a build/deploy hook for the website's production branch in its hosting dashboard. Set the website's deployment root to this repository, build command to `npm run build`, output to `dist`, Node version to 24.8 or newer, and `SANITY_CONTENT_SOURCE=sanity`. Set `PUBLIC_SITE_URL` to the production origin. The frontend deployment only needs the root dependencies; Studio deploys separately.

In the Sanity project's API → Webhooks settings, create:

| Setting | Value |
| --- | --- |
| Name | LaunchLegit website rebuild |
| URL | The hosting provider's build-hook URL |
| Dataset | `production` |
| Method | `POST` |
| Triggers | Create, Update, Delete |
| Filter | `_type in ["blogPost", "useCase"]` |
| Projection | `{ "documentId": _id, "documentType": _type }` |
| Draft events | Disabled |
| Version events | Disabled |

Keep the build-hook URL private. Standard hosting deploy hooks accept this POST directly; if the chosen host requires a different authentication or payload format, configure that provider's supported trigger instead. A custom receiver must verify Sanity's webhook signature. No custom receiver is needed for a host-managed build hook.

Test one publish and one unpublish after the hook is connected. Confirm a successful delivery in Sanity's webhook logs, a successful website build, and the expected change on the public site. Changes appear after the build/deployment completes. Sanity documents deletion/unpublishing events and draft exclusions in its [webhook guide](https://www.sanity.io/docs/content-lake/webhooks); the [Astro rendering guide](https://www.sanity.io/docs/astro/static-and-server-rendering) describes the static-build workflow.

## Validation and future changes

```sh
npm run sanity:typegen
npm run check
npm --prefix studio run check
npm test
npm run build:local
npm run test:built
npm run studio:build
```

Immediately after importing, `npm run build && npm run test:published` also checks the real Sanity-backed output, including CDN image URLs. Those assertions compare against the migration seed; update them when intentionally changing the imported articles in Studio.

TypeGen scans `src/lib/sanity/queries.ts` and writes `src/lib/sanity/sanity.types.ts`; commit the generated types after schema/query changes. The frontend TypeScript config excludes Studio so each application resolves its own dependencies. The built-content tests expect local seed content and check actual rendered HTML, URLs, metadata, lists, the booking link, and case study text.

Live draft preview, visual editing, site-wide CMS settings and separate use case pages are outside this initial integration.
