import { NextResponse } from 'next/server'

const GEMINI_MODEL = 'gemini-2.5-flash'

// ── Schema (Gemini structured output) ───────────────────
const POEM_SCHEMA = {
  type: 'object',
  properties: {
    featured_titles: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: { type: 'string' },
    },
    lines: {
      type: 'array',
      minItems: 5,
      maxItems: 7,
      items: { type: 'string' },
    },
  },
  required: ['featured_titles', 'lines'],
  propertyOrdering: ['featured_titles', 'lines'],
} as const

// ── Types ───────────────────────────────────────────────
interface ReqBody {
  titles: string[]
  scene: string
  mood: string
  activity: string
  hr: number     // 0..1
  noise: number  // 0..1
}

// ── Bucket continuous sensor values into stable labels ──
//    LLMs handle labels much better than raw decimals
function bucketHr(hr: number): string {
  if (hr >= 0.65) return 'elevated'
  if (hr >= 0.40) return 'steady'
  return 'slow'
}

function bucketNoise(noise: number): string {
  if (noise >= 0.60) return 'loud'
  if (noise >= 0.30) return 'soft'
  return 'quiet'
}

// ── Prompt builder ──────────────────────────────────────
//    Treats condition as the *physical scene* of the poem,
//    not as metadata. This is the key to getting imagery
//    instead of "fits the vibe" praise.
function buildPrompt(b: ReqBody): string {
  const hrLabel = bucketHr(b.hr)
  const noiseLabel = bucketNoise(b.noise)
  const titleList = b.titles.map((t, i) => `${i + 1}. "${t}"`).join('\n')

  return `You are writing a 5–7 line poem about a real moment.

The listener has been in: a ${b.scene}.
They feel: ${b.mood}. They are: ${b.activity}.
Their heart rate: ${hrLabel} (raw ${b.hr.toFixed(2)} on 0..1).
The space around them: ${noiseLabel} (raw ${b.noise.toFixed(2)} on 0..1).

These are the songs they chose to keep from this moment:
${titleList}

Rules:
- The ${b.scene} is the physical setting. Use concrete sensory details of that place — light, surface, smell, sound.
- The ${b.mood} colors the language but is NEVER named directly. Show, don't label.
- Weave at least 3 song titles into the lines as phrases or images, not as quotations.
- Rhythm follows the body:
    - elevated heart rate → short lines, more enjambment, more sentence breaks
    - loud space → fragments, broken syntax, half-thoughts
    - slow + quiet → longer breaths, full sentences, settled cadence
- Each line is 4–10 words. No line is a question. No line ends with a comma.
- Write in lowercase except for proper nouns and the start of new sentences.
- Forbidden words: vibe, perfect, journey, embrace, fits, soul, magic, beautiful, ethereal, heart (the literal word).

Return JSON with:
  - "featured_titles": the 3–6 titles you actually wove in (exact strings from the list above)
  - "lines": the 5–7 lines of the poem`
}

// ── POST handler ────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
    }

    const body = (await req.json()) as ReqBody
    if (!Array.isArray(body.titles) || body.titles.length < 3) {
      return NextResponse.json({ error: 'Need at least 3 titles' }, { status: 400 })
    }

    const prompt = buildPrompt(body)
    console.log(`[api/poem] ${body.titles.length} titles, ${body.scene}/${body.mood}/${body.activity}, hr=${body.hr.toFixed(2)} noise=${body.noise.toFixed(2)}`)

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseSchema: POEM_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[api/poem] Gemini ${res.status}:`, errText)
      return NextResponse.json({ error: `Gemini ${res.status}: ${errText}` }, { status: 502 })
    }

    const data = await res.json() as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
    }
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!rawText) {
      return NextResponse.json({ error: 'Gemini returned empty', raw: data }, { status: 502 })
    }

    let parsed: { featured_titles: string[]; lines: string[] }
    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error('[api/poem] JSON parse failed. Raw:', rawText)
      return NextResponse.json({ error: 'Gemini returned invalid JSON', raw: rawText }, { status: 502 })
    }

    // Sanity-check featured_titles against input
    const titleSet = new Set(body.titles)
    const validFeatured = parsed.featured_titles.filter(t => titleSet.has(t))

    return NextResponse.json({
      featured_titles: validFeatured.length >= 3 ? validFeatured : parsed.featured_titles,
      lines: parsed.lines,
    })
  } catch (e: any) {
    console.error('[api/poem] Unexpected error:', e)
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}