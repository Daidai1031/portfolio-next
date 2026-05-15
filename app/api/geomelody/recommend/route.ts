import { NextResponse } from 'next/server'

// ── Types ────────────────────────────────────────
interface TargetVector {
  energy: number
  danceability: number
  acousticness: number
  valence: number
  instrumentalness: number
}
interface SensorData { heart_rate: number; noise_level: number }
interface SeedTrack  { id: string; name: string; artist: string }
interface ReqBody {
  tracks: SeedTrack[]
  scene: string
  activity: string
  mood: string
  sensor?: Partial<SensorData> | null
}

// ── Model config ─────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-flash'
const DEFAULT_SENSOR: SensorData = { heart_rate: 0.40, noise_level: 0.20 }

// ── Response schema (Gemini structured output) ───
const RECOMMENDATION_SCHEMA = {
  type: 'object',
  properties: {
    recommendations: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          id:     { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['id', 'reason'],
        propertyOrdering: ['id', 'reason'],
      },
    },
  },
  required: ['recommendations'],
} as const

// ── Baselines per scene ──────────────────────────
// Bedroom: very low energy, high acousticness, mid valence — wind-down territory.
// Gym:     opposite of Bedroom — high energy, danceable, low acousticness.
const LOCATION_BASELINES: Record<string, TargetVector> = {
  Café:    { energy: 0.45, danceability: 0.40, acousticness: 0.60, valence: 0.70, instrumentalness: 0.30 },
  Library: { energy: 0.30, danceability: 0.20, acousticness: 0.50, valence: 0.50, instrumentalness: 0.85 },
  Street:  { energy: 0.70, danceability: 0.75, acousticness: 0.20, valence: 0.60, instrumentalness: 0.20 },
  Subway:  { energy: 0.85, danceability: 0.60, acousticness: 0.05, valence: 0.40, instrumentalness: 0.20 },
  Park:    { energy: 0.55, danceability: 0.50, acousticness: 0.80, valence: 0.85, instrumentalness: 0.60 },
  Bedroom: { energy: 0.20, danceability: 0.15, acousticness: 0.75, valence: 0.55, instrumentalness: 0.65 },
  Gym:     { energy: 0.90, danceability: 0.85, acousticness: 0.05, valence: 0.75, instrumentalness: 0.10 },
  Car:     { energy: 0.75, danceability: 0.70, acousticness: 0.15, valence: 0.65, instrumentalness: 0.25 },
}
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const finiteOrNull = (v: unknown) => typeof v === 'number' && Number.isFinite(v) ? v : null

function computeTargets(scene: string, activity: string, mood: string, sensor: SensorData): TargetVector {
  const baseline = LOCATION_BASELINES[scene]
  if (!baseline) throw new Error(`Unknown scene: ${scene}`)
  const t = { ...baseline }
  const { heart_rate: sHr, noise_level: sNoise } = sensor

  t.acousticness -= sNoise * 0.40
  t.energy       += sNoise * 0.15

  const highHr = sHr >= 0.65
  switch (mood) {
    case 'Focused':
      t.instrumentalness += highHr ? 0.20 : 0.10
      t.energy           -= highHr ? 0.15 : 0.05
      break
    case 'Relaxed':
      t.energy -= 0.20; t.danceability -= 0.15
      break
    case 'Stressed':
      t.energy  -= highHr ? 0.25 : 0.10
      t.valence += highHr ? 0.20 : 0.10
      break
    case 'Energetic':
      t.energy       += highHr ? 0.20 : 0.08
      t.danceability += highHr ? 0.15 : 0.08
      break
    case 'Sleepy':
      // Heaviest dampener — push toward ambient/acoustic and away from anything beat-heavy.
      t.energy           -= 0.35
      t.danceability     -= 0.30
      t.acousticness     += 0.20
      t.instrumentalness += 0.15
      t.valence          -= 0.05
      break
    case 'Meditative':
      // Like Sleepy but holds valence — calm rather than drowsy.
      t.energy           -= 0.25
      t.danceability     -= 0.25
      t.acousticness     += 0.25
      t.instrumentalness += 0.25
      break
  }
  switch (activity) {
    case 'Still':   t.danceability -= 0.10; break
    case 'Walking': t.danceability += 0.15; t.energy += 0.10; break
    case 'Working': t.instrumentalness += 0.10; t.energy -= 0.05; break
    case 'Driving': t.energy += 0.10; t.danceability += 0.10; break
  }
  return {
    energy: clamp(t.energy), danceability: clamp(t.danceability),
    acousticness: clamp(t.acousticness), valence: clamp(t.valence),
    instrumentalness: clamp(t.instrumentalness),
  }
}

function sensorFromBody(raw?: Partial<SensorData> | null): SensorData {
  const hr = finiteOrNull(raw?.heart_rate)
  const noise = finiteOrNull(raw?.noise_level)
  if (hr == null || noise == null) return DEFAULT_SENSOR

  return {
    heart_rate: clamp(hr),
    noise_level: clamp(noise),
  }
}

function buildPrompt(
  targets: TargetVector,
  tracks: SeedTrack[],
  sensor: SensorData,
  scene: string,
  activity: string,
  mood: string,
): string {
  const tracksJson = JSON.stringify(
    tracks.map(t => ({ id: t.id, name: t.name, artist: t.artist }))
  )

  return `You are the GeoMelody Engine — a music recommendation system.
Select exactly 5 tracks from the seed list that best match the target audio profile.

== Sensor Context ==
Location  : ${scene}
Activity  : ${activity}
Mood      : ${mood}
S_hr      : ${sensor.heart_rate.toFixed(2)}  (heart rate arousal, 0.0–1.0)
S_noise   : ${sensor.noise_level.toFixed(2)} (environment noise, 0.0–1.0)

== Target Audio Profile (pre-computed) ==
energy           : ${targets.energy.toFixed(4)}
danceability     : ${targets.danceability.toFixed(4)}
acousticness     : ${targets.acousticness.toFixed(4)}
valence          : ${targets.valence.toFixed(4)}
instrumentalness : ${targets.instrumentalness.toFixed(4)}

== Seed List (${tracks.length} tracks) ==
${tracksJson}

== Instructions ==
1. Select 5 unique tracks from the seed list. Each one must come from the list above — do not invent tracks.
2. For each selection, return the EXACT "id" string from the seed list (copy it verbatim — do not modify, shorten, or guess).
3. Choose tracks whose genre, style, and energy best fit the target audio profile.
4. The "reason" field must be max 8 words. Be concrete about how sensor → music maps.
   Good: "High noise; this track cuts through."
   Better: "Loud subway; punchy bass holds focus."
   Bad: "It fits the vibe."
5. Do not repeat ids. All 5 ids must be distinct.`
}

// ── POST handler ─────────────────────────────────
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
    }

    const { tracks, scene, activity, mood, sensor: sensorInput } = (await req.json()) as ReqBody
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: 'No tracks provided' }, { status: 400 })
    }
    console.log(`[api/recommend] Received ${tracks.length} seed tracks`)

    const sensor  = sensorFromBody(sensorInput)
    const targets = computeTargets(scene, activity, mood, sensor)
    const prompt  = buildPrompt(targets, tracks, sensor, scene, activity, mood)

    const seedsInPrompt = (prompt.match(/"id":/g) ?? []).length
    console.log(`[api/recommend] Prompt length: ${prompt.length} chars`)
    console.log(`[api/recommend] Seed tracks in prompt: ${seedsInPrompt}`)

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema: RECOMMENDATION_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      return NextResponse.json({ error: `Gemini ${geminiRes.status}: ${errText}` }, { status: 502 })
    }

    const data = await geminiRes.json() as {
      candidates?: {
        content?: { parts?: { text?: string }[] }
        finishReason?: string
      }[]
      usageMetadata?: {
        promptTokenCount?: number
        candidatesTokenCount?: number
        thoughtsTokenCount?: number
        totalTokenCount?: number
      }
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const finishReason = data.candidates?.[0]?.finishReason

    if (!rawText) {
      return NextResponse.json({ error: 'Gemini returned empty response', raw: data }, { status: 502 })
    }

    let parsed: { recommendations: { id: string; reason: string }[] }
    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error('[api/recommend] JSON parse failed. Raw:', rawText)
      return NextResponse.json({
        error: 'Gemini returned invalid JSON',
        raw: rawText,
        finishReason,
        usage: data.usageMetadata,
      }, { status: 502 })
    }

    const seedIds = new Set(tracks.map(t => t.id))
    const seen = new Set<string>()

    const results = parsed.recommendations
      .filter(rec => {
        if (!seedIds.has(rec.id)) {
          console.warn(`[recommend] Gemini returned id not in seed list: ${rec.id}`)
          return false
        }
        if (seen.has(rec.id)) return false
        seen.add(rec.id)
        return true
      })
      .map(rec => ({ id: rec.id, reason: rec.reason }))
      .slice(0, 5)

    if (results.length === 0) {
      return NextResponse.json({ error: 'No matching tracks from seed list' }, { status: 502 })
    }
    return NextResponse.json({
      results,
      debug: {
        sensor,
        targets,
        seedCount:      tracks.length,
        promptChars:    prompt.length,
        seedsInPrompt,
        geminiReturned: parsed.recommendations.length,
        matched:        results.length,
      },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
