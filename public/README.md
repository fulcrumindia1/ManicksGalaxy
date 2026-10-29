# ManicksGalaxy — Social Branding & Favicon Kit

A cohesive social/website artwork set, exported for production. Created from original ManicksGalaxy promotional artwork and a companion SVG orbital favicon. The dramatic space scenes are **illustrative artwork**, not claims of an actual astronomical observation.

## Assets

| File | Size | Intended use |
| --- | --- | --- |
| `og-default-1200x630.png` | 1200×630 | Facebook, WhatsApp, LinkedIn, Discord, Telegram, general Open Graph |
| `og-planets-1200x630.png` | 1200×630 | Planet detail sharing |
| `og-galaxies-1200x630.png` | 1200×630 | Galaxy/deep-space article sharing |
| `x-card-1200x675.png` | 1200×675 | X/Twitter summary_large_image |
| `instagram-post-1080x1080.png` | 1080×1080 | Instagram feed square |
| `instagram-portrait-1080x1350.png` | 1080×1350 | Instagram portrait post |
| `instagram-story-1080x1920.png` | 1080×1920 | Instagram/Reels story cover |
| `youtube-thumbnail-1280x720.png` | 1280×720 | YouTube video thumbnail |
| `youtube-channel-banner-2560x1440.png` | 2560×1440 | YouTube channel branding; central text safe zone |
| `linkedin-cover-1584x396.png` | 1584×396 | LinkedIn personal cover (page header aspect can differ) |
| `facebook-cover-820x312.png` | 820×312 | Facebook page/profile cover (verify crop on mobile) |
| `x-header-1500x500.png` | 1500×500 | X profile header |
| `pinterest-pin-1000x1500.png` | 1000×1500 | Pinterest vertical pin |
| `favicon.svg` | Vector | Modern browser favicon |
| `favicon.ico` | 16/32/48/64 | Legacy fallback favicon |
| `favicon-16x16.png` / `favicon-32x32.png` | 16/32 | Browser tabs |
| `apple-touch-icon.png` | 180×180 | iOS touch icon |
| `android-chrome-192x192.png` / `android-chrome-512x512.png` | 192/512 | PWA icons |
| `maskable-icon-512x512.png` | 512×512 | Android maskable PWA icon |
| `site.webmanifest` | JSON | PWA metadata |

WebP alternatives are supplied for most social graphics; use PNG for broad compatibility.

## Install in Vite + React

Copy social PNG/WebP to `public/brand/social/` and favicon/icon files to `public/brand/icons/`. Also copy `site.webmanifest` to `public/`. Update `index.html` in the site's `<head>` and **replace `https://YOUR-DOMAIN.example`** with the real deployed production domain:

```html
<title>ManicksGalaxy — Explore the Universe in 3D</title>
<meta name="description" content="Explore planets, moons, galaxies and constellations in an immersive interactive planetarium." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="ManicksGalaxy" />
<meta property="og:title" content="ManicksGalaxy — The Universe, Made Explorable" />
<meta property="og:description" content="Travel through the solar system, explore galaxies and experience an interactive 3D planetarium." />
<meta property="og:image" content="https://YOUR-DOMAIN.example/brand/social/og-default-1200x630.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="ManicksGalaxy cinematic space exploration promotional artwork" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="ManicksGalaxy — The Universe, Made Explorable" />
<meta name="twitter:description" content="Explore planets, galaxies and constellations in 3D." />
<meta name="twitter:image" content="https://YOUR-DOMAIN.example/brand/social/x-card-1200x675.png" />
<link rel="icon" type="image/svg+xml" href="/brand/icons/favicon.svg" />
<link rel="shortcut icon" href="/brand/icons/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/brand/icons/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#030817" />
```

**Important:** The Open Graph image URL must be an absolute, public HTTPS URL. Instagram feed and Stories are **upload assets**, not `og:image` sizes. For per-object social previews, use server-rendered metadata for the object URL; client-only hash routing such as `/#/object/io` cannot provide independent OG tags to social crawlers. Verify the deployed results with Facebook Sharing Debugger, LinkedIn Post Inspector, and X Card Validator equivalents.

## Reuse by platform

- Threads: use `instagram-post-1080x1080.png` or portrait.
- TikTok/Reels cover: use `instagram-story-1080x1920.png` (check platform-specific UI safe areas before posting).
- Facebook/LinkedIn/WhatsApp/Discord/Telegram link previews: use `og-default-1200x630.png`.
- Individual planets/galaxies can use the two thematic OG variations with per-route server metadata.

All graphics and icons in this package are files that exist in the bundle. The source artwork is creative promotional imagery; avoid representing it as direct space observation.
