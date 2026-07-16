import { NextResponse } from 'next/server'

// ── Server-side proxy to the real TeaGuard Flask backend ────────────────
// Forwards to the actual detection pipeline (rule engine + LLM classifier +
// stylometric heuristic + max-based risk fusion). Proxying server-side keeps
// the Render URL and the Flask service's own GROQ_API_KEY / Flask-Limiter
// rate limiting out of the browser entirely.

export const maxDuration = 30 // Render free-tier cold starts can take ~20s

interface AnalyzeRequestBody {
  creator_id: string
  text: string
}

const MAX_TEXT_LENGTH = 2000

export async function POST(req: Request) {
  try {
    const backendUrl = process.env.TEAGUARD_API_URL
    if (!backendUrl) {
      return NextResponse.json({ error: 'TEAGUARD_API_URL not set' }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as Partial<AnalyzeRequestBody> | null
    const text = body?.text?.trim()

    if (!text) {
      return NextResponse.json({ error: 'Missing "text" field' }, { status: 400 })
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` },
        { status: 400 },
      )
    }

    const payload: AnalyzeRequestBody = {
      creator_id: body?.creator_id?.trim() || 'portfolio-demo',
      text,
    }

    const upstream = await fetch(`${backendUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(28_000),
    })

    const data = await upstream.json().catch(() => null)

    if (!upstream.ok) {
      // Forward Flask's own status/body as-is (e.g. 429 from Flask-Limiter)
      // so the UI reflects real backend behavior, not a generic proxy error.
      return NextResponse.json(
        data ?? { error: `Backend returned ${upstream.status}` },
        { status: upstream.status },
      )
    }

    return NextResponse.json(data)
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Backend timed out — it may be waking up from a cold start. Try again in a few seconds.' },
        { status: 504 },
      )
    }
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}