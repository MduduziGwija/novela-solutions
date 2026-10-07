# Novela Solutions Africa — website

Static marketing site for Novela Solutions Africa. No build step: plain HTML, CSS and JavaScript, ready for GitHub Pages.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero, services, showcase, process, FAQ |
| `portfolio.html` | Filterable project gallery (data lives in `assets/js/main.js`) |
| `contact.html` | Contact details and message form |
| `talk.html` | 4-step project brief form (supports `?service=web\|system\|dashboard\|brand\|mobile\|other`) |
| `404.html` | Not-found page (GitHub Pages serves it automatically) |

Shared styles are in `assets/css/styles.css` and shared behaviour in `assets/js/main.js`. Every page loads them with a `?v=` version tag: after changing either file, update that tag in all pages (search for `?v=`) so browsers fetch the new copy instead of a cached one.

## Receiving form submissions

Both forms (Contact and the project brief) send to Formspree (`https://formspree.io/f/mgavqraq`, set as `formEndpoint` at the top of `assets/js/main.js`), which emails each enquiry to `mduduzigwija@gmail.com`. Replying in Gmail answers the client directly (`_replyto`), and a hidden `_gotcha` field catches spam bots. Manage the form, view past submissions and change the delivery address in the Formspree dashboard. The free plan allows 50 submissions a month.

If `formEndpoint` is emptied, the forms fall back to opening the visitor's email app with the message pre-filled.

## Analytics

The live site counts visits anonymously with [Umami](https://umami.is) (no cookies, no personal data), using the same Umami website as ImbizoConnect and the Leave Management demo. Visits appear in that dashboard under the `/novela-solutions/` paths. `data-domains="mduduzigwija.github.io"` means local copies are never counted.

Custom events (in `assets/js/main.js`, `track()`): `Brief sent`, `Contact form sent` (service/budget/timeline only), `Start project click`, `WhatsApp click`, `Email click`, `Phone click`, `GitHub click`, `Demo click`, `Portfolio filter`. Never add names, emails, phone numbers or message text to events.

## Adding your photo (from your phone)

1. Open https://github.com/MduduziGwija/novela-solutions/tree/main/assets/img in your phone's browser (or the GitHub app).
2. Tap **Add file → Upload files** and choose your photo.
3. The file must be named **`portrait.jpg`** (`.jpeg`, `.png` and `.webp` also work). Rename it first if needed. iPhone HEIC photos won't display in browsers, so upload a JPG.
4. Commit. The site switches from the illustrated portrait to your photo about a minute later.

A portrait (taller than wide), plain background, good light and head-and-shoulders framing works best; the site shows it black-and-orange and reveals full colour on hover.

## Editing content

- **Contact details** (email, phone, WhatsApp, GitHub) appear in each page's footer, the full-screen menu, and on `contact.html`. Search for `mduduzigwija@gmail.com` / `27670248700` to update them everywhere.
- **Portfolio projects** are the `PROJECTS` array in `assets/js/main.js`. Keep them real: `context` says where it was built, `tags` lists only tools actually used, and `art` is the short label drawn inside the artwork. Add `demo` with a URL to show a **Live demo** button on the card (`demoLabel` changes the wording, e.g. "Visit site").
- **Landing-page previews**: `preview: { img: 'name' }` on a project slides a browser window with `assets/img/previews/name.webp` over the artwork on hover (on phones, once the card is on screen) and scrolls it top to bottom. Use a full-page screenshot taken at 1280px wide, resized to 960px wide and capped at about 2400px tall, saved as WebP (around 100 to 150 KB). Add `dur` (seconds) to change the scroll speed. Leave `preview` off for private work.
- **Private projects**: `privateNote` shows a "Private to my work" label instead of a link, with the note as hover text.
- **Service illustrations** are inline SVGs inside each service row in `index.html`.

## Design system

Black canvas, one oversized wordmark per page, monospace UI labels, pill-shaped controls, and a single magenta primary action. Fonts (Google Fonts): Anton (wordmark), Inter Tight (text), Martian Mono (UI labels). All colour tokens are at the top of `assets/css/styles.css`.

## Deploying on GitHub Pages

Repository → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)`.
