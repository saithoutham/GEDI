# GEDI Screening Platform

React/Vite build of the Global Early Detection Initiative screening platform.

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Environment Variables

The locator uses `/api/places` with OpenStreetMap/Nominatim/Overpass data. No Google Maps key is required.

Set these in Vercel only if the related feature is needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-side Supabase API routes only.
- `GEMINI_API_KEY` for `/api/geai`.

## Verification

- `npm run build`
- `npm run lint`
- Lighthouse JSON reports are saved as:
  - `lighthouse-prod-home.json`
  - `lighthouse-prod-assessment.json`
  - `lighthouse-prod-guide.json`
  - `lighthouse-prod-locate.json`
  - `lighthouse-prod-research.json`

Scores from the production preview:

| Route | Performance | Accessibility | LCP |
| --- | ---: | ---: | ---: |
| `/` | 98 | 96 | 2.0s |
| `/assessment` | 98 | 96 | 2.0s |
| `/guide` | 98 | 95 | 2.0s |
| `/locate` | 98 | 96 | 2.0s |
| `/research` | 98 | 96 | 2.0s |

## Remaining Human Content

Open content and integration items live in `TODO.md`.
