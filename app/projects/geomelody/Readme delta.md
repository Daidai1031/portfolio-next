# README delta

Two parts:

1. **`Future Work` section** — drop in verbatim, anywhere after `What's Next` (or replace `What's Next` entirely if you prefer).
2. **In-place edits to existing sections** — short list at the bottom.

---

## (1) Drop-in `Future Work` section

```markdown
## Future Work

Three items that surfaced from review and aren't shipped yet. They're listed in the order I'd actually do them, not in order of size.

### Move off custom hardware → phone + Apple Watch

The current build relies on a bespoke wearable streaming heart-rate, noise, and motion over WiFi to a FastAPI service. That story is great for a project page and bad for getting it into anyone's hands. The next step is to retire the hardware loop:

- **Heart rate** — HealthKit / Apple Watch. Read the latest sample on demand; no continuous streaming needed since recommendations refresh per session, not per second.
- **Noise** — phone microphone. A 2–3 second RMS sample at session start is enough for the `S_noise` scalar the recommender wants. No recording is retained.
- **Motion** — phone IMU (`CMMotionManager` / `DeviceMotion` on web). The current `Still / Walking / Working` classifier already only needs coarse activity bins.

Architectural consequence: the FastAPI sensor service goes away. `recommend/route.ts` stops calling `/latest-sensor-data` and instead accepts `{ heart_rate, noise_level }` directly in the request body, fed from the client. Hardware-specific code (`firmware/`, the WiFi pairing flow) gets archived but not deleted — it's the more interesting build for a portfolio page.

This decision blocks App Store distribution because the alternative (BLE pairing flow + firmware OTA + battery warnings) is months of work for a feature most users would never set up.

### Discovery beyond your library ("Explore")

The current pick is always from tracks you've already saved. That's the core promise (*music you already love, matched to where you are*) and shouldn't change as the default. But there's a sibling experience worth offering: same context-matching engine, sourced from outside your library.

Approach: keep "from your library" as default. Add an `Explore` toggle on the results step that seeds [Spotify's recommendations endpoint](https://developer.spotify.com/documentation/web-api/reference/get-recommendations) with the current target audio profile + a few seed tracks from the just-played list, and labels each row `From your library` or `New for you`. Same UI, two sources.

The tension to be honest about: the more "Explore" results show up, the less the product is about *your* library — it becomes another mood-based recommender. So this stays a deliberate toggle, not a default.

### Collective intelligence

Right now GeoMelody learns nothing from anyone but the current session. Two specific features need a shared events table to be possible:

- **"Others in Library + Focused are listening to…"** — a small row under your results, surfacing what trends in the same `(scene, mood, activity)` slot.
- **Cold-start for thin libraries** — a user with 20 saved tracks can't get great recommendations from their library alone; a community-level prior would fill the gap.

Schema:

\`\`\`
events(user_hash, scene, mood, activity, track_id, action, ts)
  action ∈ {add, play, skip}
\`\`\`

Privacy: `user_hash` is a one-way hash of the Spotify user id; no PII, no playlist names, no listening history outside the GeoMelody session. Aggregates only.

This also unblocks a real feedback loop — `skip` and `play-through` events from this table get folded back into the Gemini prompt as negative/positive signals on subsequent picks. The current "no feedback loop" limitation is here, not in the recommender itself.
```

---

## (2) In-place edits to existing sections

### `Limitations` — remove the gallery line

Cards now live on the server and gallery loads from there with localStorage as a cache. **Delete** the line that reads roughly:

> *Gallery is per-device. Saved cards live in localStorage; switching browsers means starting over.*

If you want to be precise about what's still true, the replacement line is:

> *Card storage is in-memory on the server. Cards survive across browsers and devices for a given account, but a server restart clears them — production should point `cardStore.ts` at Vercel KV / Postgres.*

### `Stack` (or wherever you describe the architecture) — note hardware deprecation

Add a line under the hardware/sensor description:

> *Note: the custom hardware loop is being phased out. The next milestone reads heart-rate from HealthKit (Apple Watch), noise from the phone microphone, and motion from the phone IMU. The FastAPI sensor service retires with it.*

### Wherever scenes/moods are listed — bump the counts

Scenes: was 5, now **7** (added **Bedroom**, **Gym**).
Moods: was 4, now **6** (added **Sleepy**, **Meditative**).
Activities: unchanged (3).

If the README has a table of baselines (`LOCATION_BASELINES`), the new rows are:

| Scene | energy | dance | acoustic | valence | instr |
|---|---|---|---|---|---|
| Bedroom | 0.20 | 0.15 | 0.75 | 0.55 | 0.65 |
| Gym | 0.90 | 0.85 | 0.05 | 0.75 | 0.10 |

### `Project Structure` — add the new files

```
app/api/geomelody/
  cards/
    route.ts            # NEW — POST create, GET list
    [id]/route.ts       # NEW — GET (public), DELETE (owner)

app/projects/geomelody/
  _lib/
    cardStore.ts        # NEW — server-side store (in-memory, swap to KV later)
  c/[id]/page.tsx       # NEW — public card view
```

### `Memory Cards` (or whatever section describes cards) — note the new actions

The card step now has three actions: **Save**, **Share**, and **Download PNG**. Share creates a public URL of the form `/projects/geomelody/c/{id}` and offers it via the Web Share sheet on mobile, clipboard elsewhere. The gallery's preview modal now leads with **"Replay this moment"**, which restores the card's scene/mood and reloads its tracks into the results step (sensor stays live — it's a replay, not time-travel).