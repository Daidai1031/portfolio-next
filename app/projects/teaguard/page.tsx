'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ShieldAlert, ShieldCheck, ExternalLink, Menu, X } from 'lucide-react'

const NAV_PADDING = "clamp(24px, 10vw, 144px)";

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
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-50 text-orange-600',
  high: 'bg-red-50 text-red-600',
}

export default function TeaGuardDemoPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="min-h-screen bg-white text-black">
      {/* Top navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="py-4 lg:py-6" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg lg:text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            <div className="hidden md:flex items-center gap-8 lg:gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">Projects</Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
              <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            <Link href="/projects" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link href="/about" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/about#connect" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-2xl px-6 pt-32 pb-24 lg:pt-44 lg:pb-32">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-orange-500 transition-colors">Projects</Link>
          <span>/</span>
          <Link href="/projects/ai-software/teaguard" className="hover:text-orange-500 transition-colors">TeaGuard Provenance API</Link>
          <span>/</span>
          <span className="text-black">Live Demo</span>
        </div>

        <header className="mb-14">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">
            Individual Project — Trust &amp; Safety
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            TeaGuard Provenance API
          </h1>
          <p className="text-gray-500 leading-relaxed">
            A multi-signal content moderation pipeline for anonymous review platforms —
            combining an LLM classifier, a regex rule engine, and a stylometric heuristic
            to flag privacy risk, defamation risk, and AI-generated text. This is the real
            backend, running live.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <a
              href="https://github.com/Daidai1031/teaguard-trust-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-500 transition-colors"
            >
              View source <ExternalLink size={14} />
            </a>
            <Link href="/projects/ai-software/teaguard" className="text-gray-500 hover:text-orange-500 transition-colors">
              Read the write-up →
            </Link>
          </div>
        </header>

        <div className="border-t border-gray-200 pt-10">
          <p className="mb-3 text-xs uppercase tracking-wider text-gray-400">
            Try a preset, or write your own
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setText(p.text)}
                className="text-xs font-medium tracking-wide px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white transition-colors duration-200"
              >
                {p.name}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write a review to analyze…"
            maxLength={2000}
            rows={5}
            className="w-full border border-gray-200 p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-400 tabular-nums">{text.length}/2000</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-orange-500 transition-colors duration-200 disabled:opacity-30 disabled:hover:bg-black"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>

          {loading && (
            <p className="mt-3 text-xs text-gray-400">
              First request can take ~20s — the backend runs on a free-tier server that sleeps when idle.
            </p>
          )}

          {error && (
            <div className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-10 border border-gray-200 p-6">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {result.overall_risk === 'low' ? (
                  <ShieldCheck size={18} className="text-gray-400" />
                ) : (
                  <ShieldAlert size={18} className="text-orange-500" />
                )}
                <span
                  className={`text-xs font-medium tracking-wide px-3 py-1.5 ${
                    RISK_STYLES[result.overall_risk] ?? RISK_STYLES.low
                  }`}
                >
                  Overall risk: {result.overall_risk}
                </span>
                <span className="text-xs text-gray-400">status: {result.status}</span>
              </div>

              {result.attribution && (
                <p className="mb-5 text-sm text-gray-600">
                  Attribution: <span className="font-medium text-black">{result.attribution}</span>
                  {typeof result.confidence === 'number' && (
                    <span className="text-gray-400"> ({(result.confidence * 100).toFixed(0)}% confidence)</span>
                  )}
                </p>
              )}

              <div className="space-y-px">
                {result.labels.map((label) => (
                  <div
                    key={label.type}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-black">{label.type.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500">
                      {(label.confidence * 100).toFixed(0)}% · {label.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer
        className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/projects" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← Back to Projects</Link>
        </div>
      </footer>
    </div>
  )
}
