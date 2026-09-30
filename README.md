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

Shared styles are in `assets/css/styles.css` and shared behaviour in `assets/js/main.js`.

## Receiving form submissions

By default, both forms open the visitor's email app with the message pre-filled to `hello@novelasolutions.africa`.

To receive submissions directly in your inbox instead:

1. Create a free form at [formspree.io](https://formspree.io) (or a similar service).
2. Copy its endpoint URL, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into `formEndpoint` at the top of `assets/js/main.js`.

## Editing content

- **Contact details** (email, phone, WhatsApp) appear in each page's footer, the mobile menu, and on `contact.html`. Search for `+27000000000` / `hello@novelasolutions.africa` to update them everywhere.
- **Social links** on `contact.html` (LinkedIn, X) currently point to `#`.
- **Portfolio projects** are the `PROJECTS` array in `assets/js/main.js` (`art` is the short label drawn inside each project's artwork).

## Design system

Black canvas, one oversized wordmark per page, monospace UI labels, pill-shaped controls, and a single magenta primary action. Fonts (Google Fonts): Anton (wordmark), Inter Tight (text), Martian Mono (UI labels). All colour tokens are at the top of `assets/css/styles.css`.

## Deploying on GitHub Pages

Repository → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)`.
