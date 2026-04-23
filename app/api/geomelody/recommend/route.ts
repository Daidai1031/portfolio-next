import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
  const { tracks, scene, activity, mood } = await req.json()

  const trackList = tracks
    .map((t: any, i: number) => `${i + 1}. [${t.id}] "${t.name}" by ${t.artist}`)
    .join('\n')

  const prompt = `You are a music recommendation engine.
The user context:
- Location: ${scene}
- Activity: ${activity}
- Mood: ${mood}

From this list, pick the 5 most suitable tracks for this context.
Return ONLY a JSON array, no markdown, no extra text:
[{"id":"track_id","reason":"one short sentence why"}]

Tracks:
${trackList}`

  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Gemini API error:', res.status, err)
    return NextResponse.json({ error: err }, { status: 500 })
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'

  try {
    const cleaned = text.replace(/```json|```/g, '').trim()
    const recommendations = JSON.parse(cleaned)
    return NextResponse.json(recommendations)
  } catch {
    return NextResponse.json([])
  }
}