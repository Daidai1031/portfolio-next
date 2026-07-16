'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ShieldAlert, ShieldCheck, ExternalLink, Menu, X, ChevronLeft } from 'lucide-react'

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

const LABEL_COPY: Record<string, { title: string; desc: string }> = {
  privacy_risk: {
    title: 'Personal info detected',
    desc: 'This might reveal who someone is — like a name, employer, or address.',
  },
  defamation_risk: {
    title: 'Serious accusation flagged',
    desc: 'This claim could be considered defamatory. Consider rephrasing before posting.',
  },
  ai_generated: {
    title: 'Looks AI-generated',
    desc: "This writing pattern looks automated, so it's routed to human review.",
  },
}

const TONE_STYLES = {
  good: { wrap: 'bg-gray-50 border-gray-200', title: 'text-gray-700', desc: 'text-gray-500' },
  warn: { wrap: 'bg-orange-50 border-orange-200', title: 'text-orange-700', desc: 'text-orange-600/80' },
  block: { wrap: 'bg-red-50 border-red-200', title: 'text-red-700', desc: 'text-red-600/80' },
} as const

function bannerFor(result: AnalyzeResult) {
  const tone: keyof typeof TONE_STYLES =
    result.overall_risk === 'high' ? 'block' : result.overall_risk === 'medium' ? 'warn' : 'good'

  if (tone === 'good') {
    return { tone, title: 'Looks good', desc: 'No risk signals detected — ready to post.' }
  }

  const primary = [...result.labels].sort((a, b) => b.confidence - a.confidence)[0]
  const copy = (primary && LABEL_COPY[primary.type]) || {
    title: 'Flagged for review',
    desc: 'This post was flagged for a closer look before it goes live.',
  }
  return { tone, ...copy }
}

function postButtonLabel(result: AnalyzeResult | null) {
  if (!result) return 'Post'
  if (result.overall_risk === 'high') return 'Submit for review'
  if (result.overall_risk === 'medium') return 'Post anyway'
  return 'Post'
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

  function selectPreset(preset: string) {
    setText(preset)
    setResult(null)
    setError(null)
  }

  const banner = result ? bannerFor(result) : null

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

      <main className="mx-auto grid max-w-[1280px] grid-cols-1 px-6 pt-32 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)] lg:gap-x-20 lg:px-10 lg:pt-40 lg:pb-32 xl:gap-x-28">
        {/* Breadcrumb */}
        <div className="mb-12 flex w-full flex-wrap items-center justify-center gap-2 text-sm text-gray-500 lg:col-span-2 lg:justify-start lg:mb-16">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-orange-500 transition-colors">Projects</Link>
          <span>/</span>
          <Link href="/projects/ai-software/teaguard" className="hover:text-orange-500 transition-colors">TeaGuard Provenance API</Link>
          <span>/</span>
          <span className="text-black">Live Demo</span>
        </div>

        <header className="mx-auto mb-12 max-w-xl text-center lg:col-start-1 lg:row-start-2 lg:mx-0 lg:mb-8 lg:self-end lg:text-left">
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-gray-400">
            Individual Project — Trust &amp; Safety
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            TeaGuard Provenance API
          </h1>
          <p className="max-w-lg text-base leading-8 text-gray-500 lg:text-lg">
            A multi-signal moderation pipeline for anonymous review apps. Below is a rough
            mock of how a flagged post would surface inside a real app&apos;s compose screen —
            the analysis itself hits the live Flask backend.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm lg:justify-start">
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

        {/* Preset chips */}
        <div className="mx-auto mb-10 w-full max-w-xl border-t border-gray-100 pt-8 text-center lg:col-start-1 lg:row-start-3 lg:mx-0 lg:mb-0 lg:self-start lg:text-left">
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-gray-400">
            Try a sample post
          </p>
          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => selectPreset(p.text)}
                className="text-xs font-medium tracking-wide px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white transition-colors duration-200"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Phone mockup ── */}
        <div className="relative w-full max-w-[320px] justify-self-center rounded-[2.75rem] border-[10px] border-black bg-black shadow-2xl sm:max-w-[360px] lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:self-center">
          <div className="relative flex h-[600px] flex-col overflow-hidden rounded-[2rem] bg-white p-3 sm:h-[650px]">
            {/* Dynamic island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-1 text-[11px] font-semibold text-black">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px]">📶</span>
                <span className="text-[10px]">🔋</span>
              </div>
            </div>

            {/* App header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
              <button className="flex items-center gap-0.5 text-gray-500 text-sm">
                <ChevronLeft size={16} /> Cancel
              </button>
              <span className="text-sm font-semibold">New Post</span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
                className="text-sm font-semibold text-orange-500 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : postButtonLabel(result)}
              </button>
            </div>

            {/* Compose body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] text-gray-400">
                  ?
                </div>
                <span className="text-xs font-medium text-gray-500">Anonymous</span>
              </div>

              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setResult(null); setError(null) }}
                placeholder="Share your experience…"
                maxLength={2000}
                rows={5}
                className="w-full resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />

              {loading && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" /> Checking your post…
                </p>
              )}

              {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
              )}

              <div className="flex-1" />

              {banner && (
                <div className={`mt-3 rounded-xl border p-3 flex items-start gap-2.5 ${TONE_STYLES[banner.tone].wrap}`}>
                  {banner.tone === 'good' ? (
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  ) : (
                    <ShieldAlert size={16} className={`mt-0.5 shrink-0 ${banner.tone === 'block' ? 'text-red-500' : 'text-orange-500'}`} />
                  )}
                  <div>
                    <p className={`text-xs font-semibold ${TONE_STYLES[banner.tone].title}`}>{banner.title}</p>
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${TONE_STYLES[banner.tone].desc}`}>{banner.desc}</p>
                  </div>
                </div>
              )}

              <p className="mt-3 text-right text-[10px] text-gray-300 tabular-nums">{text.length}/2000</p>
            </div>
          </div>
        </div>

        {loading && (
          <p className="mt-5 max-w-xs justify-self-center text-center text-xs leading-relaxed text-gray-400 lg:col-start-2 lg:row-start-4">
            First request can take ~20s — the backend runs on a free-tier server that sleeps when idle.
          </p>
        )}

        {/* Signal breakdown */}
        {result && (
          <div className="mx-auto mt-16 w-full max-w-2xl lg:col-span-2 lg:row-start-5 lg:mt-20">
            <p className="mb-3 text-xs uppercase tracking-wider text-gray-400 text-center">
              What TeaGuard actually returned
            </p>
            <div className="border border-gray-200 p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium tracking-wide px-3 py-1.5 bg-gray-100 text-gray-600">
                  Overall risk: {result.overall_risk}
                </span>
                <span className="text-xs text-gray-400">status: {result.status}</span>
              </div>

              {result.attribution && (
                <p className="mb-4 text-sm text-gray-600">
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
          </div>
        )}
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
