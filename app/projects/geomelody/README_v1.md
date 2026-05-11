# GeoMelody

> Context-aware background music, picked from your own Spotify library — read from sensors, not slider input.

GeoMelody surfaces the right *subset* of music you already love for the moment you're in. A quiet library, a noisy subway, a walk in the park — a small wearable reads where you are, and the app pulls a handful of tracks from your saved library that fit. And once the moment passes, you can keep it: the tracks you tapped during a session plus the sensor context they were heard in get composed into a card you can save.

[![GeoMelody demo](https://img.youtube.com/vi/H_VaBhs78sc/maxresdefault.jpg)](https://youtu.be/H_VaBhs78sc)

---

## The Idea

Most recommenders push tracks at you from outside your taste — Discover Weekly, viral hits, algorithmic radio. GeoMelody does the opposite. It stays inside a playlist you already love and surfaces the four or five tracks that fit *where you are right now*.

The first version asked you. Tap *Café · Working · Focused*, get five tracks. It worked, but it broke the premise. If you have to stop and tell the system how you feel, you've already left the moment.

So the second version reads it. A small wearable measures three things — heart rate, ambient noise, and motion — and pushes them to the app every five seconds. You set the scene and mood once; activity comes from the sensor automatically, and the recommendation updates as you move.

## How It Works

1. **Connect Spotify** (PKCE — no backend secret).
2. **Pick a source** — your liked songs or your top tracks of the last six months.
3. **Set context** — scene (Café · Library · Street · Subway · Park) and mood (Focused · Relaxed · Stressed · Energetic). Activity is detected from the IMU.
4. **Get five tracks** with a one-line reason for each. Tap to play; the Web Playback SDK streams them inline.
5. **Keep the moment** (optional) — tapping `+` curates a track for later, along with the sensor reading at that moment. With three or more curated, tap Share to compose a poem or word-cloud card from them. Saved cards land in a per-user gallery.

Behind the scenes the app samples 25 tracks from your library, computes a target audio profile from `(scene, activity, mood, sensor)`, and asks Gemini to pick the five best matches and write a short reason for each. Tracks already shown get filtered out so consecutive refreshes give you new picks until the pool resets.

## Memory Cards

A listening session ends and the moment dissolves with it. The five tracks you played in a café yesterday afternoon are still in your library, but the *afternoon* is gone. Memory Cards is a second mode that lets you keep one.

During recommendation, tapping `+` on any track adds it to a curated queue alongside the scene, mood, and sensor reading at that moment — not at card-generation time. A track tapped at HR 88 in a noisy subway carries those values forever, even if you tap a later track sitting quietly in a library. When you have three or more curated tracks, the Share button takes you into the card flow. Two formats:

- **Poem Card** — Gemini writes a 5–7 line poem using the song titles as imagery rather than as quotations. The rhythm follows the body: elevated heart rate produces short lines and enjambment, a loud environment produces fragments and half-thoughts, a slow-and-quiet reading produces longer sentences with settled cadence. Each card has three layouts; layout 1 highlights the song titles inside the verse in the palette's accent color.
- **Word Cloud Card** — the same song titles laid out in a spiral, sized by frequency, with the titles Gemini chose to feature drawn larger and in accent color. Three layouts: a horizontal mix, mixed orientations with vertical text, and a third with no vertical text and a larger maximum font size.

The palette is derived from the aggregate `(scene, mood)` of the curated tracks. Each scene has a base hue (Café warm sepia, Library cool slate, Subway electric indigo, Park forest green, Street muted brick) and the mood shifts saturation and lightness. All eight palette slots — backgrounds, surface, primary and soft foreground, accent and muted accent, divider — derive from those two inputs, so every variant of every card feels like the same set.

### Design decisions specific to cards

**Store data, not PNGs.** Saved cards live in localStorage as the data needed to re-render — selected tracks, condition, poem, palette inputs — not as a captured image. The card components themselves are the source of truth. When the design changes, old cards adopt the new design; the gallery never looks stale. As a side effect, each card costs only a few KB.

**Per-user gallery, keyed by Spotify ID.** localStorage is per-device. Keying by Spotify user ID (rather than a generic `'gallery'` key) means logging into a different account on the same browser shows that account's cards instead of mixing them. The tradeoff is explicit: switching devices loses your collection. For a single-user demo this is fine; a real product would need a backend table.

**Refuse to save under an unknown user.** The `/v1/me` fetch can fail (network blip, expired token, missing field). The early version fell back to a placeholder ID, which meant cards saved during a broken session were orphaned forever — next login with the real ID, those cards became invisible. The current code returns `null` on any failure, leaves `userId` empty, disables the Gallery button until the real ID arrives, and `saveCard` throws if asked to write under an empty ID.

**Sensor values normalized at curation time.** Each curated track stores its sensor reading as `{ hr, noise }` in `0..1`, normalized at the moment it was added. Heart rate clamps `50..130 bpm`; noise clamps `0..100 dB`. The card and the poem prompt both read these normalized values, so a card made now and a card made in three months will read consistently even if the device firmware changes its raw scale.

**Forbidden words in the poem prompt.** The first version of the prompt produced what you'd expect — *vibes*, *perfect*, *embrace*, *fits your mood*. Adding an explicit forbid-list (`vibe, perfect, journey, embrace, fits, soul, magic, beautiful, ethereal, heart`) shifted the output from praise to imagery. The prompt also treats the scene as the physical setting of the poem rather than metadata about it: *"The listener has been in: a Library. The Library is the physical setting. Use concrete sensory details of that place — light, surface, smell, sound."*

**Mixed-script handwriting.** Caveat covers Latin glyphs beautifully but has no CJK forms; a Chinese song title would render in the system default and look out of place next to handwritten English. Adding Long Cang to the font-family fallback chain (`'Caveat', 'Long Cang', 'Bradley Hand', cursive`) lets the browser fall through per-character — English titles render in Caveat, Chinese titles in Long Cang, automatically and without any string segmentation.

## Design Decisions

### Why an LLM, not audio features

The obvious plan was target vectors over Spotify's audio features (energy, valence, acousticness, instrumentalness), Euclidean distance, done.

Spotify deprecated `audio-features` for new applications in November 2024.

The first fallback was keyword scoring against artist genres — each scene mapped to a curated vocabulary (*Library* → `ambient · classical · instrumental · post-rock · minimal · drone · lo-fi`), tracks scored by overlap. Coarse, but it shipped. The real problem with this approach isn't sparseness — it's that artist genres are one-tag-fits-all. A jazz artist has the same genre tag whether a track is a 2 AM ballad or a daytime bossa nova.

The current version computes a target profile in code (still using `LOCATION_BASELINES` and the same `mood × heart_rate` modifiers from the original rule engine), then hands the seed list and the profile to Gemini and lets the model do the matching. This recovers most of what audio features gave us — Gemini knows what a song sounds like even when Spotify won't tell us — without the brittle keyword overlap.

The original feature-vector code (`ruleEngine.ts`, `euclidean.ts`) is still in the repo, unwired, as a record of the pivot.

### Why a wearable instead of asking the user

Self-report doesn't work for context. People are bad at rating their own arousal, and asking every few minutes is worse. A 30-bpm jump in heart rate while walking through a subway is a more honest *high-intensity moment* signal than a four-button chip group.

There's also a UX claim baked in: the app should be something you glance at, not something you operate. Activity inferred from the IMU instead of a chip group is one less tap, and it stays accurate when you start walking mid-track without you having to re-engage the UI.

### Why a thin in-memory backend

The FastAPI backend is one Python file, two endpoints, and a single global dict. The device pushes; the frontend pulls; nothing is persisted. This is deliberate — for a personal-scale demo with one device, a database would only add deployment surface area without improving anything users can see. When the project grows to multiple users or needs history (e.g. *what was I listening to during my run yesterday?*), the dict becomes a Postgres row keyed by device id, and nothing else has to change.

### Why client-side recommendation

Each call to `/api/geomelody/recommend` includes the seed track list. The route is stateless — no user store, no embeddings cache, no per-user model. The same endpoint works for any user the moment they OAuth, and adding context dimensions just means appending to the prompt. The cost is that we can't learn from skips or completions yet. That's the next thing to build.

## Stack

- **Hardware** — CircuitPython on a microcontroller, three sensors: MAX30102 (heart rate), an electret microphone (ambient noise), LSM6DS3 (6-axis IMU for motion classification).
- **Backend** — FastAPI, in-memory cache, push-from-device + pull-from-frontend.
- **Frontend** — Next.js 16 (App Router), client-rendered, Spotify Web API + Web Playback SDK, canvas-based DotOrb for the auth screen.
- **Recommender** — Gemini 2.5 Flash with structured JSON output for track picks; same model with a separate prompt and forbid-list for poem generation.
- **Cards** — 1080×1080 SVG/HTML composed at runtime, exported via `html-to-image`. Caveat + Long Cang for handwritten text, Cormorant Garamond for serif headlines.
- **Auth** — Spotify PKCE — no server secret, all in browser.

## Project Structure

```
backend/
  backend.py              # FastAPI sensor relay
firmware/
  code.py                 # CircuitPython main loop
  secrets.py              # WiFi + backend URL (gitignored)
app/
  api/geomelody/
    recommend/route.ts    # Gemini track picker, structured output
    poem/route.ts         # Gemini poem writer, structured output + forbid-list
    rerank/route.ts       # Cheaper second-pass model
    vision/route.ts       # Photo → scene/activity/mood (not wired)
  projects/geomelody/
    page.tsx              # Auth + 6-step flow + DotOrb + player + font injection
    callback/page.tsx     # OAuth redirect
    _lib/
      auth.ts             # PKCE
      api.ts              # Spotify wrappers
      recommend.ts        # Calls /api/geomelody/recommend
      poem.ts             # Calls /api/geomelody/poem
      usePlayer.ts        # Web Playback SDK hook
      cardHelpers.ts      # Title sanitization, mode/mean aggregation, date formatting
      palette.ts          # (scene, mood) → 8-color HSL palette
      timeOfDay.ts        # Hour bucket → handwritten phrase ("at golden hour", "in the small hours")
      wordCloud.ts        # Spiral layout, bbox collision, no d3
      gallery.ts          # Per-user localStorage CRUD, keyed by Spotify user ID
      ruleEngine.ts       # [unused] audio-feature target builder
      euclidean.ts        # [unused] feature-vector matcher
    _components/
      SelectStep.tsx      # Choose which curated tracks go into the card
      CardStep.tsx        # Preview, layout/type switcher, save-to-gallery + PNG export
      GalleryStep.tsx     # Saved-cards grid + preview modal
      cards/
        PoemCard.tsx      # 3 layouts, Gemini verse, layout-1 title highlighting
        WordCloudCard.tsx # 3 layouts, spiral cloud
        PlaylistCard.tsx  # [unused] earlier prototype
```

## Limitations

- The sensor card shows *live* as long as the backend has any cached data. There's no `last_seen` heartbeat yet — a device that died ten minutes ago still looks online.
- No feedback loop. Skipping or completing a track doesn't influence the next batch.
- Spotify Premium is required for in-app playback (Web Playback SDK constraint).
- The vision endpoint exists but isn't wired into the main flow.
- Tested against personal libraries of ~50–500 tracks. Larger libraries will need smarter sampling than uniform random over the unseen pool.
- **Gallery is per-device.** Cards live in localStorage; clearing browser data, switching browsers, or switching devices loses your collection. A small backend table keyed by Spotify user ID would fix this.
- **CJK fallback covers Chinese, not Japanese.** Long Cang's glyph set is Chinese; Japanese-language song titles (hiragana/katakana) fall through to the system default. Adding a Japanese handwritten face (Klee One, Yusei Magic) to the fallback chain would close this.

## What's Next

- `last_seen` heartbeat so the UI can degrade honestly when the device disconnects.
- Wire the vision endpoint — drop a photo, let the model override scene.
- Skip / play-through as a feedback signal feeding the next prompt.
- Battery-aware push interval on the device — longer when still, shorter when active.
- Server-side gallery storage so cards survive a cleared browser or a new device.

---

## Notes

- The dot orb on the auth screen reads the microphone but doesn't influence recommendations. It's there because the screen otherwise felt dead.
- An earlier prototype lives at `/playground/mood-music`. It uses server-side OAuth and the now-deprecated audio-features endpoint, and predates both the LLM pivot and the sensor pivot. Kept for reference, not maintained.