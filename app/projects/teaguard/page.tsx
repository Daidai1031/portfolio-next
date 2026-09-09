'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, ShieldAlert, ShieldCheck, ExternalLink, X, ChevronLeft, Home, Search, Bell, UserRound, Plus } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'

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

// Copy rule: describe the text, not the author. The reference pattern's own
// mockup reads "Your comment is likely to be hurtful to others" — second-person
// copy that adjudicates intent is what the research links to the ~3% of users
// who escalate after being prompted. These strings point at a passage and leave
// the judgment to whoever wrote it.
const LABEL_COPY: Record<string, { title: string; desc: string }> = {
  privacy_risk: {
    title: 'This could identify someone',
    desc: 'It mentions details like a name, employer, or neighborhood.',
  },
  defamation_risk: {
    title: 'This reads as a serious accusation',
    desc: 'Claims like this can carry legal weight. You can edit it or post as-is.',
  },
  ai_generated: {
    title: 'Style check inconclusive',
    desc: "The signal here is weak, so this one goes to a human rather than being decided automatically.",
  },
}

const TONE_STYLES = {
  ok: { wrap: 'bg-gray-50 border-gray-200', title: 'text-gray-700', desc: 'text-gray-500' },
  prompt: { wrap: 'bg-orange-500 border-orange-500', title: 'text-orange-500', desc: 'text-orange-500/80' },
  hold: { wrap: 'bg-red-50 border-red-200', title: 'text-red-700', desc: 'text-red-600/80' },
} as const

function bannerFor(result: AnalyzeResult) {
  const tone: keyof typeof TONE_STYLES =
    result.overall_risk === 'high' ? 'hold' : result.overall_risk === 'medium' ? 'prompt' : 'ok'

  if (tone === 'ok') {
    return { tone, title: 'Looks good', desc: 'No risk signals detected — ready to post.' }
  }

  const primary = [...result.labels].sort((a, b) => b.confidence - a.confidence)[0]
  const copy = (primary && LABEL_COPY[primary.type]) || {
    title: 'Worth a second look',
    desc: 'Something here may be worth a rephrase before it goes live.',
  }
  if (tone === 'hold') {
    return { tone, title: copy.title, desc: `${copy.desc} A human moderator sees this one before it posts.` }
  }
  return { tone, ...copy }
}

function postButtonLabel(result: AnalyzeResult | null) {
  if (!result) return 'Post'
  if (result.overall_risk === 'high') return 'Send for review'
  if (result.overall_risk === 'medium') return 'Post anyway'
  return 'Post'
}

export default function TeaGuardDemoPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      <SiteHeader />

      <main className="mx-auto grid max-w-[1400px] grid-cols-1 px-6 pt-32 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)] lg:gap-x-12 lg:pl-10 lg:pr-0 lg:pt-44 lg:pb-32 xl:gap-x-16">
        {/* Breadcrumb */}
        <div className="mb-12 flex w-full flex-wrap items-center justify-center gap-2 text-sm text-gray-500 lg:col-span-2 lg:justify-start lg:mb-20">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-orange-500 transition-colors">Projects</Link>
          <span>/</span>
          <Link href="/projects/ai-digital-products/teaguard" className="hover:text-orange-500 transition-colors">TeaGuard Provenance API</Link>
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
            A compose-time prompt for anonymous review apps — an implementation of the{' '}
            <a
              href="https://www.prosocialdesign.org/library/preliminary-flagging-before-posting"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-orange-500"
            >
              preliminary flagging before posting
            </a>{' '}
            pattern, backed by a multi-signal pipeline. Below is a rough mock of how the
            prompt would surface in a real compose screen; the analysis itself hits the
            live Flask backend.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm lg:justify-start">
            <a
              href="https://github.com/Daidai1031/teaguard-trust-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-500 transition-colors"
            >
              View source <ExternalLink size={14} />
            </a>
            <Link href="/projects/ai-digital-products/teaguard" className="text-gray-500 hover:text-orange-500 transition-colors">
              Read the write-up →
            </Link>
          </div>
        </header>

        {/* Preset chips */}
        <div className="mx-auto mb-10 w-full max-w-xl border-t border-gray-100 pt-8 text-center lg:col-start-1 lg:row-start-3 lg:mx-0 lg:mb-0 lg:self-start lg:text-left lg:mt-8">
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
        <div className="relative w-full max-w-[300px] justify-self-center rounded-[3rem] border-[12px] border-black bg-black shadow-[0_40px_90px_-25px_rgba(0,0,0,0.4)] sm:max-w-[340px] lg:col-start-2 lg:row-start-2 lg:mt-2 lg:justify-self-end lg:self-start">
          <div className="relative flex h-[610px] flex-col overflow-hidden rounded-[2.25rem] bg-white sm:h-[660px]">
            {/* Dynamic island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20" />

            {/* Status bar */}
            <div className="flex items-center justify-between px-7 pt-4 pb-1 text-[11px] font-semibold text-black">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px]">📶</span>
                <span className="text-[10px]">🔋</span>
              </div>
            </div>

            {/* App header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button className="flex items-center gap-0.5 text-gray-400 text-[13px] font-medium">
                <ChevronLeft size={16} /> Cancel
              </button>
              <span className="text-[13px] font-semibold tracking-tight">New Post</span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
                className="rounded-full bg-orange-500 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:bg-gray-100 disabled:text-gray-300"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : postButtonLabel(result)}
              </button>
            </div>

            {/* Compose body */}
            <div className="relative flex flex-1 flex-col overflow-y-auto px-4 pb-3 pt-3.5">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[12px] font-semibold text-gray-400">
                  ?
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Anonymous</p>
                  <p className="text-[10px] text-gray-400">Posting to Campus Reviews</p>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => { setText(e.target.value); setResult(null); setError(null) }}
                placeholder="Share your experience…"
                maxLength={2000}
                rows={5}
                className="w-full resize-none text-[13.5px] leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none"
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

              <p className="mb-1 text-right text-[10px] text-gray-300 tabular-nums">{text.length}/2000</p>
            </div>

            {/* Floating result card — mirrors an in-app notification popup */}
            {banner && (
              <div className="absolute inset-x-3 bottom-[4.75rem] z-20 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.18)]">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      banner.tone === 'ok' ? 'bg-gray-100' : banner.tone === 'hold' ? 'bg-red-50' : 'bg-orange-500'
                    }`}
                  >
                    {banner.tone === 'ok' ? (
                      <ShieldCheck size={16} className="text-gray-400" />
                    ) : (
                      <ShieldAlert size={16} className={banner.tone === 'hold' ? 'text-red-500' : 'text-orange-500'} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] font-semibold ${TONE_STYLES[banner.tone].title}`}>{banner.title}</p>
                      <button
                        onClick={() => setResult(null)}
                        className="mt-0.5 shrink-0 text-gray-300 transition-colors hover:text-gray-400"
                        aria-label="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className={`mt-0.5 text-[11.5px] leading-relaxed ${TONE_STYLES[banner.tone].desc}`}>{banner.desc}</p>
                  </div>
                </div>
                {/* Edit is the primary action, but the author can always move
                    forward — a prompt that can't be dismissed is a filter. */}
                {banner.tone !== 'ok' && (
                  <div className="mt-2.5 flex items-center gap-2 border-t border-gray-50 pt-2.5">
                    <button
                      onClick={() => { setResult(null); textareaRef.current?.focus() }}
                      className="flex-1 rounded-full bg-orange-500 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-orange-500"
                    >
                      Edit post
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      {banner.tone === 'hold' ? 'Send for review' : 'Post anyway'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom tab bar */}
            <div className="flex items-center justify-around border-t border-gray-100 bg-white px-2 pb-2 pt-2">
              {[
                { icon: Home, label: 'Home', active: false },
                { icon: Search, label: 'Explore', active: false },
                { icon: Plus, label: 'Post', active: true },
                { icon: Bell, label: 'Alerts', active: false },
                { icon: UserRound, label: 'Profile', active: false },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 px-2">
                  <div className={`flex h-7 w-9 items-center justify-center rounded-full ${active ? 'bg-orange-500' : ''}`}>
                    <Icon size={15} className={active ? 'text-white' : 'text-gray-300'} />
                  </div>
                  <span className={`text-[9px] font-medium ${active ? 'text-orange-500' : 'text-gray-300'}`}>{label}</span>
                </div>
              ))}
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
              Raw API response
            </p>
            <p className="mx-auto mb-5 max-w-md text-center text-xs leading-relaxed text-gray-400">
              The backend&apos;s own vocabulary, unmapped — the prompt above translates it
              before an author ever sees it.
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
        className="site-footer py-14 lg:py-20"
        style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}
      >
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row lg:gap-8">
          <p className="site-footer-signature">Dingran Dai © {new Date().getFullYear()}</p>
          <Link href="/projects" className="site-footer-link">← Back to Projects</Link>
        </div>
      </footer>
    </div>
  )
}
