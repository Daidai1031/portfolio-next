# GeoMelody

> Context-aware background music, picked from your own Spotify library — read from sensors, not slider input.

GeoMelody surfaces the right *subset* of music you already love for the moment you're in. A quiet library, a noisy subway, a walk in the park — a small wearable reads where you are, and the app pulls a handful of tracks from your saved library that fit.

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

Behind the scenes the app samples 25 tracks from your library, computes a target audio profile from `(scene, activity, mood, sensor)`, and asks Gemini to pick the five best matches and write a short reason for each. Tracks already shown get filtered out so consecutive refreshes give you new picks until the pool resets.

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
- **Frontend** — Next.js 14 (App Router), client-rendered, Spotify Web API + Web Playback SDK, canvas-based DotOrb for the auth screen.
- **Recommender** — Gemini 2.5 Flash with structured JSON output.
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
    recommend/route.ts    # Gemini picker, structured output
    rerank/route.ts       # Cheaper second-pass model
    vision/route.ts       # Photo → scene/activity/mood
  projects/geomelody/
    page.tsx              # Three-step flow + DotOrb + player
    callback/page.tsx     # OAuth redirect
    _lib/
      auth.ts             # PKCE
      api.ts              # Spotify wrappers
      recommend.ts        # Calls /api/geomelody/recommend
      usePlayer.ts        # Web Playback SDK hook
      ruleEngine.ts       # [unused] audio-feature target builder
      euclidean.ts        # [unused] feature-vector matcher
```

## Limitations

- The sensor card shows *live* as long as the backend has any cached data. There's no `last_seen` heartbeat yet — a device that died ten minutes ago still looks online.
- No feedback loop. Skipping or completing a track doesn't influence the next batch.
- Spotify Premium is required for in-app playback (Web Playback SDK constraint).
- The vision endpoint exists but isn't wired into the main flow.
- Tested against personal libraries of ~50–500 tracks. Larger libraries will need smarter sampling than uniform random over the unseen pool.

## What's Next

- `last_seen` heartbeat so the UI can degrade honestly when the device disconnects.
- Wire the vision endpoint — drop a photo, let the model override scene.
- Skip / play-through as a feedback signal feeding the next prompt.
- Battery-aware push interval on the device — longer when still, shorter when active.

---

## Notes

- The dot orb on the auth screen reads the microphone but doesn't influence recommendations. It's there because the screen otherwise felt dead.
- An earlier prototype lives at `/playground/mood-music`. It uses server-side OAuth and the now-deprecated audio-features endpoint, and predates both the LLM pivot and the sensor pivot. Kept for reference, not maintained.