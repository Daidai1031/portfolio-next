'use client'

import { useState } from 'react'
import { Loader2, ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react'

// ── Types (mirrors the Flask backend's /submit response shape) ──────────
interface RiskLabel {
  type: string
  confidence: number
  action: string
}
interface AnalyzeResult {
  attribution?: string
  confidence?: number
  overall_risk: 'low' | 'medium' | 'high'
  status: string
  labels: RiskLabel[]
}
interface ApiError {
  error: string
}

const PRESETS = [
  {
    name: 'Benign review',
    text: 'We grabbed coffee and talked about hiking for two hours. Would meet again — easy conversation, showed up on time.',
  },
  {
    name: 'Privacy risk',
    text: 'She works at Mount Sinai as a nurse and lives a few blocks from 42nd Street.',
  },
  {
    name: 'Defamation risk',
    text: "Total scammer, don't trust him — he's a known stalker in this area.",
  },
  {
    name: 'Indirect identification',
    text: 'He is the only bartender at the rooftop bar on 57th Street, hard to miss.',
  },
] as const

const RISK_STYLES: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
}

export default function TeaGuardDemoPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/teaguard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = (await res.json()) as AnalyzeResult | ApiError
      if (!res.ok) {
        setError('error' in data ? data.error : `Request failed (${res.status})`)
        return
      }
      setResult(data as AnalyzeResult)
    } catch {
      setError('Network error — the backend may be waking up from a cold start.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10">
        <p className="mb-2 text-sm text-neutral-500">Individual Project — Trust &amp; Safety</p>
        <h1 className="text-3xl font-semibold tracking-tight">TeaGuard Provenance API</h1>
        <p className="mt-3 text-neutral-600">
          A multi-signal content moderation pipeline for anonymous review platforms —
          combining an LLM classifier, a regex rule engine, and a stylometric heuristic
          to flag privacy risk, defamation risk, and AI-generated text. This is the real
          backend, running live.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <a
            href="https://github.com/Daidai1031/teaguard-trust-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-orange-600 hover:underline"
          >
            View source <ExternalLink size={14} />
          </a>
          <a href="/projects/hci/teaguard" className="text-neutral-500 hover:underline">
            Read the write-up →
          </a>
        </div>
      </header>

      <section className="mb-6">
        <p className="mb-2 text-sm font-medium text-neutral-700">Try a preset, or write your own:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setText(p.text)}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:border-orange-400 hover:text-orange-600"
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or write a review to analyze…"
        maxLength={2000}
        rows={5}
        className="w-full rounded-lg border border-neutral-300 p-4 text-sm focus:border-orange-400 focus:outline-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-neutral-400">{text.length}/2000</span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm text-white disabled:opacity-40"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      {loading && (
        <p className="mt-3 text-xs text-neutral-400">
          First request can take ~20s — the backend runs on a free-tier server that sleeps when idle.
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-lg border border-neutral-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            {result.overall_risk === 'low' ? (
              <ShieldCheck size={18} className="text-neutral-500" />
            ) : (
              <ShieldAlert size={18} className="text-orange-600" />
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                RISK_STYLES[result.overall_risk] ?? RISK_STYLES.low
              }`}
            >
              Overall risk: {result.overall_risk}
            </span>
            <span className="text-xs text-neutral-400">status: {result.status}</span>
          </div>

          {result.attribution && (
            <p className="mb-4 text-sm text-neutral-600">
              Attribution: <span className="font-medium">{result.attribution}</span>
              {typeof result.confidence === 'number' && (
                <span className="text-neutral-400"> ({(result.confidence * 100).toFixed(0)}% confidence)</span>
              )}
            </p>
          )}

          <div className="space-y-2">
            {result.labels.map((label) => (
              <div
                key={label.type}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{label.type.replace(/_/g, ' ')}</span>
                <span className="text-neutral-500">
                  {(label.confidence * 100).toFixed(0)}% · {label.action.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
