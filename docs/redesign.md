# September 2026 design update

The Astro site now uses the supplied `LaunchLegit site-optimized! (1)` design. Shared styles, navigation, footer, theme switching, and page layouts are extracted into reusable files.

## Pages and content

- Home, Services, About Us, Features, Contact, and Privacy Policy use the supplied layouts and copy.
- Blog and Case Studies use the existing Sanity content, images, metadata, and URLs. Blog slugs are left unchanged.
- The header and footer reuse the existing `public/logos/logo-ll.png` asset.
- The supplied Privacy Policy is still a draft, with its template notice retained and `noindex,follow` metadata. It should be replaced with the approved policy before launch.
- The homepage retains the supplied external Reuters hero-image URL. The other homepage images and the optimized shared logo are served locally.

## Booking

The site does not include an enquiry or booking form. Visitors can book a call through the existing Calendly section on the homepage or email `hello@launchlegit.com`.

## Verification

Run `npm run check`, `npm test`, `npm run test:components`, and `npm run test:redesign` after a production build. The redesign test checks routes, metadata, local assets, internal links, and booking links.

During this update, the existing workspace's `.astro` directory and Vite cache contained root-owned generated files. Verification and browser testing used a temporary copy at `/private/tmp/launchlegit-redesign-ec6nur8q` with the same source and dependencies. The original generated files were left intact. To restore builds in this checkout, an administrator can restore ownership of `.astro` and `node_modules/.vite` to the current user.
