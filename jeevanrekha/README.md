# Jeevanरेखा — Road Accident Aid PWA

Offline-first, voice-guided first aid and triage tool for road accident bystanders in India. Two-file static PWA — no build step, no backend.

## Run locally

```
cd ~/Downloads/first-responder-pwa
python3 -m http.server 8080
```

Open `http://localhost:8080` in Chrome. Allow location when prompted.

## Install on a phone

1. Serve over HTTPS (any static host: Netlify drop, GitHub Pages, Cloudflare Pages).
2. On Android Chrome / iOS Safari, open the URL and choose "Add to Home Screen".
3. The app launches fullscreen and works fully offline after the first load.

## Files

- `index.html` — single-page React app (CDN React + Tailwind + Babel-standalone).
- `sw.js` — service worker, cache-first.
- `manifest.webmanifest` — PWA manifest.
- `icon.svg` — app icon.

## Features

- 5-question Scene Assessment Wizard with huge buttons.
- START triage engine → RED / YELLOW / GREEN / BLACK.
- 35 pre-baked first aid protocols spanning trauma, medical, environmental, bites/poison, and special populations.
- Accident-type-aware: wizard asks the incident type first (road / fire / water / fall / electric / medical / bite / poison / other) and biases the recommended protocol accordingly.
- Library filter chips for browsing protocols by incident type.

## Integrations (all feature-flagged in `config.js`)

| # | Feature | Backend used | Setup needed |
|---|---|---|---|
| 1 | **Multilingual** — English, Hindi, Marathi, Tamil, Telugu, Bengali | None | None — UI strings ship for all 6. Protocol text fully translated for EN + HI; other 4 fall back to English with a notice |
| 2 | **Nearest hospitals** (top 3, distance, call, navigate) | OpenStreetMap Overpass | None — free, CORS-friendly. Last result cached in `localStorage` for offline fallback |
| 3 | **Ambulance dispatch** — 108 / 112 / private | None — `tel:` links | Edit `privateAmbulance.phone` in `config.js` if you want a different provider |
| 4 | **Police + fire alert** — WhatsApp + 100 + 101 (fire button only on fire-type incidents) | None | None |
| 5 | **Blood request broadcast** — shows only for RED triage; 8 groups + Unknown | WhatsApp / SMS deep links | None |
| 6 | **Volunteer network** — registration screen + nearby (≤ 1.5 km) WhatsApp pings | Supabase | Add `supabase.url` + `supabase.anonKey` in `config.js` and create the `volunteers` table (schema below) |
| 7 | **Incident report** — auto-generated, print-to-PDF + copy + cloud save | Nominatim (reverse geocode) + Supabase (cloud copy, optional) | None for print/PDF/copy; same Supabase setup as #6 for cloud copy |
| 8 | **Video consult** — instant private video room with QR for remote doctor (only RED / YELLOW triage) | Jitsi Meet (no auth) | None |

### Substitutions vs the original spec
- **Google Places** → **OpenStreetMap Overpass**: browser CORS blocks direct Places calls and would expose the API key in client JS. Overpass is free, CORS-enabled and returns the same data fields.
- **Google Geocoding** → **OSM Nominatim** for the same reason.
- **Daily.co** → **Jitsi Meet**: Daily's room creation needs a server (Bearer key cannot live in client JS). Jitsi gives the same "tap to open private room with QR" UX with zero auth and free hosting.

### Supabase schema
Run in the SQL editor of your project:
```sql
create table volunteers (
  id uuid primary key default gen_random_uuid(),
  name text, phone text, lat double precision, lng double precision,
  skills text[], available boolean default true,
  last_active timestamptz default now()
);
create table incidents (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz, triage text, accident_type text,
  coords jsonb, answers jsonb, timeline jsonb,
  text text, address text,
  created_at timestamptz default now()
);
-- Enable RLS, then add permissive insert policies for the anon role
-- (or restrict as your privacy stance requires).
```

### Volunteer self-service (DPDPA 2023): update + delete

The volunteer self-screen lets the registered user toggle their availability and delete their own data. Both require these extra policies — without them the toggle silently fails and the delete UI tells the user to ask the project admin:

```sql
drop policy if exists "anon can update own volunteer" on volunteers;
drop policy if exists "anon can delete own volunteer" on volunteers;

create policy "anon can update own volunteer"
  on volunteers for update to anon using (true) with check (true);

create policy "anon can delete own volunteer"
  on volunteers for delete to anon using (true);
```

These are intentionally permissive: any client with the anon key can update or delete any volunteer row. For v2 you should gate on Supabase Auth (`auth.uid() = owner_id`) or a per-volunteer secret column so only the registering device can change its own row. v1 ships permissive because the data is purposely public (it has to be reachable in an emergency) and any malicious wipe is recoverable via re-registration.

### Disabling any integration
Flip the matching key in `config.js` `features` to `false`. The UI hides itself; existing flows are untouched.

## Filling in protocol translations (mr / ta / te / bn)

English and Hindi are human-authored. Marathi, Tamil, Telugu, Bengali are partially populated and the rest can be filled in by a one-time Node script that calls Google Cloud Translation.

**One-time setup (~10 minutes):**

1. Create / sign in to a Google Cloud project at https://console.cloud.google.com
2. **APIs & Services → Library** → search "Cloud Translation API" → **Enable**.
3. **APIs & Services → Credentials → Create credentials → API key**. Copy it.
4. (Recommended) Click the new key → **Restrict key** → **API restrictions** → select only "Cloud Translation API". Save.

Free tier covers 500,000 characters/month. The full job for this app is roughly 200,000 characters — well inside free.

**Run it:**

```bash
cd ~/Downloads/first-responder-pwa
export GOOGLE_TRANSLATE_API_KEY=AIza...your-key...
node generate-translations.mjs               # fills protocols missing from translations.js
node generate-translations.mjs --only=heatstroke,nosebleed   # specific protocols only
node generate-translations.mjs --force        # regenerate everything (overwrites)
```

Requires Node 18+ (uses built-in `fetch`). No npm install.

The script reads `protocols-source.json` (canonical English source), calls Google for each language, and **appends** new `T["id"] = {...}` blocks to `translations.js` before the mounter function. It will not overwrite hand-authored blocks unless you pass `--force` or `--only=`.

After running, bump the `CACHE` version in `sw.js` (e.g. `fr-v14` → `fr-v15`) so installed users pick up the new translations on next launch.

**Quality caveat:** Google Cloud Translation is good but not clinically verified. Have a native speaker / clinician proofread before deploying for real-world emergency use. The language picker shows an "AI-generated" notice to users for these languages.
- Per-step countdown timer, voice readout, persistent "DO NOT DO" panel.
- One-tap call to 108, or WhatsApp/SMS with GPS-prefilled message.
- Paramedic handover note with timeline of interventions.
- Local incident log in `localStorage`.
- English / हिन्दी toggle (UI + voice).
- Voice mute toggle.

## Safety note

This is a decision-support aid, not a substitute for professional medical care. Always call 108 (India ambulance) or 112 (single emergency number) immediately.
