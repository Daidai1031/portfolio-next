'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { loginWithSpotify, getAccessToken, logout } from './_lib/auth'
import { getLikedTracks, getTopTracks, Track } from './_lib/api'
import { scoreByGenres } from './_lib/recommend'
import { usePlayer } from './_lib/usePlayer'
import SelectStep, { CuratedTrack } from './_components/SelectStep'
import CardStep from './_components/CardStep'
import GalleryStep from './_components/GalleryStep'
import type { SavedCard } from './_lib/gallery'

type Step = 'source' | 'context' | 'results' | 'select' | 'cardType' | 'gallery'
type Source = 'liked' | 'top'
type TrackWithReason = Track & { reason?: string }

const GEOMELODY_FONT = "var(--font-cormorant-garamond), 'Cormorant Garamond', Georgia, 'Times New Roman', serif"

const SOURCES: { id: Source; label: string; desc: string }[] = [
  { id: 'liked', label: 'Liked Songs', desc: 'Your saved tracks' },
  { id: 'top', label: 'Top Tracks', desc: 'Your most played, last 6 months' },
]

const SCENES = ['Café', 'Library', 'Street', 'Subway', 'Park', 'Bedroom', 'Gym', 'Car']
const ACTIVITIES = ['Still', 'Walking', 'Working', 'Driving']
const MOODS  = ['Focused', 'Relaxed', 'Stressed', 'Energetic']

const IMU_MAP: Record<string, string> = {
  ACT_STILL:   'Still',
  ACT_WALKING: 'Walking',
  ACT_WORKING: 'Working',
  ACT_DRIVING: 'Driving',
}

const SEED_SIZE = 25

function sampleTracks<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr
  const a = [...arr]
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (a.length - i))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

type SensorSnapshot = {
  heart_rate: number
  noise_level: number
  imu_state: string
  activityLabel: string
  fetchedAt: number
}

async function fetchSensorSnapshot(): Promise<SensorSnapshot | null> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000'
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 2500)
  try {
    const res = await fetch(`${backendUrl}/latest-sensor-data`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as { heart_rate?: number; noise_level?: number; imu_state?: string }
    return {
      heart_rate:    data.heart_rate   ?? 0,
      noise_level:   data.noise_level  ?? 0,
      imu_state:     data.imu_state    ?? '',
      activityLabel: IMU_MAP[data.imu_state ?? ''] ?? 'Still',
      fetchedAt:     Date.now(),
    }
  } catch (e) {
    console.warn('[page] sensor fetch failed:', e)
    return null
  } finally {
    window.clearTimeout(timeoutId)
  }
}

// Normalize sensor values to 0..1 for downstream cards / palette / poem.
// HR: 50–130 BPM range. Noise: 0–100 dB. Values <= 1 are passed through
// (in case a backend version already normalizes).
function normalizeHr(raw: number): number {
  if (raw <= 1) return raw
  return Math.min(Math.max((raw - 50) / 80, 0), 1)
}
function normalizeNoise(raw: number): number {
  if (raw <= 1) return raw
  return Math.min(Math.max(raw / 100, 0), 1)
}

// Spotify /v1/me — used for the username watermark and per-user gallery key.
//
// IMPORTANT: we return null rather than a placeholder ID on any failure
// (network blip, missing field, etc.). The gallery uses the returned ID
// as its localStorage key, so silently falling back to "unknown" would
// orphan whatever cards a user saves during that broken session — next
// time they log in with a real ID, those cards would be invisible. Better
// to refuse to set userId at all; the Gallery button stays disabled until
// userId is real, and saveCard refuses to write under an empty userId.
async function fetchCurrentUser(): Promise<{ id: string; displayName: string } | null> {
  const token = getAccessToken()
  if (!token) return null
  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as { id?: string; display_name?: string }
    if (!data.id) return null
    return { id: data.id, displayName: data.display_name ?? 'You' }
  } catch (e) {
    console.warn('[page] /v1/me failed:', e)
    return null
  }
}

const Icon = {
  Plus:    ({ s = 14 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  Trash:   ({ s = 14 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>,
  Play:    ({ s = 12 }: { s?: number }) => <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  Pause:   ({ s = 12 }: { s?: number }) => <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>,
  Prev:    ({ s = 14 }: { s?: number }) => <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24"><path d="M18 20L8 12l10-8v16zM4 4h2v16H4z"/></svg>,
  Next:    ({ s = 14 }: { s?: number }) => <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4l10 8-10 8V4zM18 4h2v16h-2z"/></svg>,
  Edit:    ({ s = 13 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  ChevUp:  ({ s = 16 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>,
  ChevDn:  ({ s = 16 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>,
  Refresh: ({ s = 14 }: { s?: number }) => <svg width={s} height={s} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/></svg>,
}

function DotOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const volumeRef = useRef(0)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 260, H = 260
    const cx = W / 2, cy = H / 2
    const BASE_R = 70
    const DOT_COUNT = 800

    const dots: { theta: number; phi: number; offset: number }[] = []
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({ theta: 2 * Math.PI * Math.random(), phi: Math.acos(2 * Math.random() - 1), offset: Math.random() * Math.PI * 2 })
    }

    let mic: MediaStream | null = null
    let analyser: AnalyserNode | null = null
    let dataArray: Uint8Array<ArrayBuffer> | null = null

    navigator.mediaDevices?.getUserMedia({ audio: true }).then(stream => {
      mic = stream
      const audioCtx = new AudioContext()
      const source   = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      dataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
      source.connect(analyser)
    }).catch(() => {})

    let time = 0
    function draw() {
      ctx!.clearRect(0, 0, W, H)
      time += 0.02
      let vol = 0
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
        vol = sum / dataArray.length / 128
      }
      volumeRef.current += (vol - volumeRef.current) * 0.15
      const v = volumeRef.current
      const R = BASE_R + v * 40
      dots.forEach(d => {
        const noise = Math.sin(d.theta * 3 + time + d.offset) * Math.cos(d.phi * 2 + time * 0.7) * v * 18
        const r     = R + noise
        const x     = cx + r * Math.sin(d.phi) * Math.cos(d.theta)
        const y     = cy + r * Math.sin(d.phi) * Math.sin(d.theta)
        const depth = (Math.cos(d.phi) + 1) / 2
        const alpha = 0.05 + depth * 0.35 + v * 0.2
        const size  = 0.8  + depth * 0.8  + v * 0.6
        ctx!.beginPath()
        ctx!.arc(x, y, size, 0, Math.PI * 2)
        ctx!.fillStyle = v > 0.15 ? `rgba(249,115,22,${alpha})` : `rgba(0,0,0,${alpha})`
        ctx!.fill()
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      mic?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return <canvas ref={canvasRef} width={260} height={260} style={{ display: 'block', margin: '0 auto' }} />
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', minWidth: 0, padding: '6px 4px',
        borderRadius: '999px',
        border:      selected ? '1.5px solid #FF6900' : '1px solid #e0e0e0',
        background:  selected ? '#FF6900' : '#fff',
        color:       selected ? '#FF6900' : '#666',
        fontSize:    '11px',
        fontWeight:  selected ? 600 : 400,
        cursor:      'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
        lineHeight:  1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow:'ellipsis',
      }}
    >
      {label}
    </button>
  )
}

function formatTime(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function pickReasonTags(reason: string) {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'your', 'this', 'that', 'from', 'into',
    'fits', 'fit', 'you', 'its', 'it', 'a', 'an', 'to', 'of', 'in', 'on',
    'as', 'at', 'by', 'is', 'are', 'be', 'because', 'while', 'when', 'feel',
    'feels', 'track', 'song', 'music', 'moment', 'mood', 'scene', 'activity',
  ])
  const tags: string[] = []
  const words = reason.match(/[A-Za-z][A-Za-z-]{2,}/g) ?? []

  for (const word of words) {
    const normalized = word.toLowerCase()
    if (stopWords.has(normalized)) continue
    if (tags.some(tag => tag.toLowerCase() === normalized)) continue
    tags.push(word)
    if (tags.length === 2) break
  }

  return tags
}

function GeoMelodyTitle({ compact = false }: { compact?: boolean }) {
  const size = compact ? '28px' : '44px'
  return (
    <div aria-label="GeoMelody" style={{
      display: 'inline-flex', alignItems: 'baseline',
      fontFamily: GEOMELODY_FONT, fontSize: size, fontWeight: 700,
      lineHeight: compact ? 1.05 : 0.98, letterSpacing: 0,
      fontVariantLigatures: 'common-ligatures',
      fontFeatureSettings: '"ss01" 1, "cv01" 1',
    }}>
      <span style={{ color: '#111' }}>Geo</span>
      <span style={{ marginLeft: '2px', color: '#FF6900' }}>Melody</span>
    </div>
  )
}

function ButtonLoadingSweep() {
  return (
    <span aria-hidden style={{
      position: 'absolute', top: 0, bottom: 0, left: 0, width: '24%',
      background: 'rgba(255,255,255,0.12)', opacity: 0.75,
      animation: 'geomelody-button-block 0.85s linear infinite',
    }} />
  )
}

function PlaybackProgress({
  positionMs, durationMs, onSeek, dark = false, showTimes = false,
}: {
  positionMs: number; durationMs: number; onSeek: (positionMs: number) => void
  dark?: boolean; showTimes?: boolean
}) {
  const safeDuration = Math.max(durationMs, 0)
  const safePosition = Math.max(0, Math.min(positionMs, safeDuration || 0))
  const percent = safeDuration > 0 ? (safePosition / safeDuration) * 100 : 0
  const disabled = safeDuration <= 0

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', height: showTimes ? '18px' : '12px', display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: '100%', height: showTimes ? '6px' : '4px',
          borderRadius: '999px',
          background: dark ? 'rgba(255,255,255,0.18)' : '#e9e4dc',
          overflow: 'hidden',
          boxShadow: dark ? 'inset 0 0 0 1px rgba(255,255,255,0.04)' : 'inset 0 0 0 1px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            width: `${percent}%`, height: '100%', borderRadius: '999px',
            background: dark ? '#FF6900' : '#111', transition: 'width 0.2s linear',
          }} />
        </div>
        <div style={{
          position: 'absolute', left: `calc(${percent}% - ${showTimes ? 6 : 4}px)`,
          width: showTimes ? 12 : 8, height: showTimes ? 12 : 8, borderRadius: '50%',
          background: dark ? '#fff' : '#111',
          boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.18)',
          opacity: disabled ? 0 : 1, transition: 'left 0.2s linear', pointerEvents: 'none',
        }} />
        <input
          aria-label="Playback progress" type="range"
          min={0} max={Math.max(safeDuration, 1)} value={safePosition}
          disabled={disabled}
          onChange={(e) => onSeek(Number(e.currentTarget.value))}
          className="geomelody-progress-input"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: disabled ? 'default' : 'pointer' }}
        />
      </div>
      {showTimes && (
        <div style={{
          marginTop: '4px', display: 'flex', justifyContent: 'space-between',
          fontSize: '10px', color: dark ? 'rgba(255,255,255,0.55)' : '#aaa',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span>{formatTime(safePosition)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>
      )}
    </div>
  )
}

export default function GeoMelodyPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      window.location.href = window.location.href.replace('localhost', '127.0.0.1')
    }
  }, [])

  const [token,         setToken]         = useState<string | null>(null)
  const [step,          setStep]          = useState<Step>('source')
  const [source,        setSource]        = useState<Source | null>(null)
  const [library,       setLibrary]       = useState<Track[] | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [spotifyConnecting, setSpotifyConnecting] = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [scene,         setScene]         = useState('Café')
  const [manualActivity, setManualActivity] = useState('Still')
  const [mood,          setMood]          = useState('Focused')
  const [sensor,        setSensor]        = useState<SensorSnapshot | null>(null)
  const [sensorLoading, setSensorLoading] = useState(false)
  const [results,       setResults]       = useState<TrackWithReason[]>([])
  const [curatedTracks, setCuratedTracks] = useState<CuratedTrack[]>([])
  const [selectedForCard, setSelectedForCard] = useState<CuratedTrack[]>([])

  const [queue,          setQueue]          = useState<TrackWithReason[]>([])
  const [playHistory,    setPlayHistory]    = useState<TrackWithReason[]>([])
  const [shownHistory,   setShownHistory]   = useState<Set<string>>(new Set())
  const [playerExpanded, setPlayerExpanded] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const lastAutoAdvanceRef = useRef<string | null>(null)

  const [userId,   setUserId]   = useState<string>('')
  const [userName, setUserName] = useState<string>('')

  const player = usePlayer()
  const activity = sensor?.activityLabel ?? manualActivity
  const nowPlaying       = queue[0] ?? null
  const noPrevAvailable  = playHistory.length === 0
  const noNextAvailable  = queue.length <= 1 && results.length === 0

  useEffect(() => { setToken(getAccessToken()) }, [])

  useEffect(() => {
    setAccountOpen(false)
  }, [step])

  // Fetch Spotify identity once we have a token (for gallery key + watermark)
  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchCurrentUser().then(u => {
      if (cancelled || !u) return
      setUserId(u.id)
      setUserName(u.displayName)
    })
    return () => { cancelled = true }
  }, [token])

  // Inject Caveat + Long Cang (CJK fallback for handwritten text) + Schoolbell
  // once authed (cards & gallery thumbs use these). Renamed data attribute
  // so dev-mode HMR doesn't see the old `data-caveat` link and skip the
  // (now multi-family) injection.
  useEffect(() => {
    if (!token) return
    if (typeof document === 'undefined') return
    if (document.querySelector('link[data-geomelody-fonts]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Long+Cang&family=Schoolbell&display=swap'
    link.dataset.geomelodyFonts = 'true'
    document.head.appendChild(link)
  }, [token])

  useEffect(() => {
    if (queue.length === 0 || !player.ready) return
    const target = queue[0]
    if (player.currentTrackId !== target.id || player.endedTrackId === target.id) {
      lastAutoAdvanceRef.current = null
      player.playTrack(target.uri)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, player.ready, player.currentTrackId, player.endedTrackId])

  useEffect(() => {
    if (step !== 'results')        return
    if (results.length > 0)        return
    if (loading || sensorLoading)  return
    if (error)                     return
    if (!library)                  return
    console.log('[geomelody] Top 5 emptied - auto refreshing')
    runRecommend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length, step, loading, sensorLoading, error])

  async function runRecommend() {
    if (!library) return
    setLoading(true)
    setError(null)
    try {
      setSensorLoading(true)
      const snap = await fetchSensorSnapshot()
      setSensorLoading(false)
      setSensor(snap)
      const activity = snap?.activityLabel ?? manualActivity
      const recommendSensor = snap
        ? { heart_rate: normalizeHr(snap.heart_rate), noise_level: normalizeNoise(snap.noise_level) }
        : null

      const queueIds = new Set(queue.map(q => q.id))
      let pool = library.filter(t => !shownHistory.has(t.id) && !queueIds.has(t.id))

      if (pool.length < 5) {
        console.log('[geomelody] shownHistory exhausted, resetting')
        setShownHistory(new Set())
        pool = library.filter(t => !queueIds.has(t.id))
      }

      const seed = sampleTracks(pool, SEED_SIZE)
      const recs = await scoreByGenres(
        seed.map(t => ({ id: t.id, name: t.name, artist: t.artist, artistId: t.artistId })),
        scene, activity, mood, recommendSensor
      )
      const resultTracks = recs
        .map(r => ({ ...library.find(t => t.id === r.id)!, reason: r.reason }))
        .filter(Boolean) as TrackWithReason[]

      setResults(resultTracks)
      setShownHistory(prev => {
        const next = new Set(prev)
        resultTracks.forEach(t => next.add(t.id))
        return next
      })

      if (step !== 'results') setStep('results')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectSource(s: Source) {
    setSource(s)
    setLoading(true)
    setError(null)
    try {
      const tracks = s === 'liked' ? await getLikedTracks() : await getTopTracks()
      if (tracks.length === 0) {
        setError(s === 'liked'
          ? 'No liked songs found. Try Top Tracks instead.'
          : 'No top tracks found yet - try Liked Songs.')
        return
      }
      setLibrary(tracks)
      fetchSensorSnapshot().then(setSensor)
      setStep('context')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  function addToQueue(track: TrackWithReason) {
    setQueue(q => q.some(t => t.id === track.id) ? q : [...q, track])
    setResults(r => r.filter(t => t.id !== track.id))
    // Curated set is idempotent. Sensor values normalized to 0..1 here.
    setCuratedTracks(prev => {
      if (prev.some(t => t.id === track.id)) return prev
      return [...prev, {
        ...track,
        curatedAt: Date.now(),
        context: {
          scene, mood, activity,
          hr:    sensor ? normalizeHr(sensor.heart_rate)    : 0.4,
          noise: sensor ? normalizeNoise(sensor.noise_level) : 0.2,
        },
      }]
    })
  }

  function handleDisconnect() {
    logout()
    setToken(null); setLibrary(null); setResults([])
    setSource(null); setStep('source'); setSensor(null)
    setQueue([]); setPlayHistory([]); setShownHistory(new Set()); setPlayerExpanded(false)
    setCuratedTracks([]); setSelectedForCard([])
    setUserId(''); setUserName('')
    setAccountOpen(false)
  }

  function removeFromResults(track: TrackWithReason) {
    setResults(r => r.filter(t => t.id !== track.id))
  }

  function playNow(track: TrackWithReason) {
    setQueue(q => {
      const current = q[0]
      if (current && current.id !== track.id) {
        setPlayHistory(h => h[h.length - 1]?.id === current.id ? h : [...h, current])
      }
      const rest = q.slice(1).filter(t => t.id !== track.id)
      return [track, ...rest]
    })
    setResults(r => r.filter(t => t.id !== track.id))
  }

  function playPrevious() {
    const previous = playHistory[playHistory.length - 1]
    if (!previous) return
    setPlayHistory(h => h.slice(0, -1))
    setQueue(q => [previous, ...q.filter(t => t.id !== previous.id)])
  }

  function playNext() {
    setQueue(q => {
      const current = q[0]
      if (q.length > 1) {
        if (current) setPlayHistory(h => h[h.length - 1]?.id === current.id ? h : [...h, current])
        return q.slice(1)
      }
      if (results.length > 0) {
        const next = results[0]
        if (current) setPlayHistory(h => h[h.length - 1]?.id === current.id ? h : [...h, current])
        setResults(r => r.filter(t => t.id !== next.id))
        return [next]
      }
      return []
    })
  }
  // Re-enter the results step with a previously-saved card's tracks and
  // condition. We rehydrate scene/mood from the card (sensor stays live —
  // the replay is a *replay*, not a time-travel).
  function handleReplay(card: SavedCard) {
    setQueue([])
    setPlayHistory([])
    setShownHistory(new Set(card.selected.map(t => t.id)))
    setResults(card.selected.map(t => ({ ...t, reason: t.reason })))
    setScene(card.scene)
    setMood(card.mood)
    setStep('results')
    setAccountOpen(false)
    setPlayerExpanded(false)
  }

  useEffect(() => {
    if (!player.endedTrackId || player.endedTrackId !== nowPlaying?.id) return
    if (lastAutoAdvanceRef.current === player.endedTrackId) return
    lastAutoAdvanceRef.current = player.endedTrackId
    playNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.endedTrackId, nowPlaying?.id])

  const phone: React.CSSProperties = {
    width: '100%', maxWidth: '390px', minHeight: '844px', margin: '0 auto',
    background: '#fafaf8', display: 'flex', flexDirection: 'column',
    fontFamily: GEOMELODY_FONT, position: 'relative', overflow: 'hidden',
  }

  if (!token) {
    return (
      <>
        <div style={phone}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
            <DotOrb />
            <div style={{ marginTop: '-20px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>
                Context-Aware Music
              </div>
              <h1 style={{ margin: '0 0 14px', lineHeight: 1 }}>
                <GeoMelodyTitle />
              </h1>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6, margin: '0 0 40px' }}>
                Music from your library,<br />matched to your moment.
              </p>
              <button
                onClick={() => { setSpotifyConnecting(true); window.setTimeout(loginWithSpotify, 180) }}
                disabled={spotifyConnecting}
                style={{
                  position: 'relative', width: '100%', maxWidth: '280px', padding: '16px',
                  background: '#000', color: '#fff', border: 'none', borderRadius: 0,
                  fontSize: '15px', fontWeight: 600,
                  cursor: spotifyConnecting ? 'wait' : 'pointer',
                  letterSpacing: '0.02em', fontFamily: 'inherit', overflow: 'hidden',
                  opacity: spotifyConnecting ? 0.92 : 1,
                }}
              >
                {spotifyConnecting && <ButtonLoadingSweep />}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {spotifyConnecting ? 'Connecting...' : 'Connect Spotify'}
                </span>
              </button>
              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '12px' }}>Enjoy your personalized music experience</p>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes geomelody-button-block {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(430%); }
          }
        `}</style>
        <Script src="https://sdk.scdn.co/spotify-player.js" strategy="afterInteractive" />
      </>
    )
  }

  return (
    <>
      <div style={phone}>

        {/* Header */}
        <div style={{ padding: '56px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#bbb', textTransform: 'uppercase' }}>Context-Aware</div>
            <div style={{ lineHeight: 1.15 }}>
              <GeoMelodyTitle compact />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexShrink: 0, position: 'relative' }}>
            {step === 'results' && (
              <button
                onClick={() => setStep('select')}
                disabled={curatedTracks.length < 3}
                title={curatedTracks.length < 3
                  ? `Add at least 3 songs with + to share (${curatedTracks.length}/3)`
                  : 'Share a card from your queued songs'}
                style={{
                  background:   curatedTracks.length >= 3 ? '#FF6900' : 'transparent',
                  border:       curatedTracks.length >= 3 ? '1px solid #FF6900' : '1px solid #e0e0e0',
                  borderRadius: '999px', padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: curatedTracks.length >= 3 ? 600 : 500,
                  color:      curatedTracks.length >= 3 ? '#FF6900' : '#bbb',
                  cursor:     curatedTracks.length >= 3 ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                Share ({curatedTracks.length})
              </button>
            )}
            <button
              onClick={() => setAccountOpen(open => !open)}
              style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', color: '#888', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Account
            </button>
            {accountOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                width: '92px', padding: '3px',
                background: 'rgba(255,255,255,0.78)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 0,
                boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                zIndex: 30,
              }}>
                <button
                  onClick={() => {
                    if (!userId) return
                    setAccountOpen(false)
                    setStep('gallery')
                  }}
                  disabled={!userId}
                  style={{
                    width: '100%', padding: '7px 7px',
                    background: 'transparent', border: 'none', borderRadius: 0,
                    color: userId ? '#333' : '#bbb',
                    cursor: userId ? 'pointer' : 'not-allowed',
                    fontSize: '10.5px', textAlign: 'right', fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Gallery
                </button>
                <button
                  onClick={handleDisconnect}
                  style={{
                    width: '100%', padding: '7px 7px',
                    background: 'transparent', border: 'none', borderRadius: 0,
                    color: '#333', cursor: 'pointer',
                    fontSize: '10.5px', textAlign: 'right', fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Source */}
        {step === 'source' && (
          <div style={{ flex: 1, padding: '24px 24px 40px' }}>
            <DotOrb />
            <div style={{ marginTop: '-12px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '16px' }}>
                Choose source
              </div>
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', fontSize: '13px', marginBottom: '12px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #e0e0e0', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Loading...
                </div>
              )}
              {error && <p style={{ color: '#e24b4a', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#ebebeb', borderRadius: 0, overflow: 'hidden' }}>
                {SOURCES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSource(s.id)}
                    disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '16px', background: '#fff', border: 'none',
                      cursor: loading ? 'wait' : 'pointer', textAlign: 'left',
                      fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
                    }}
                  >
                    <div style={{
                      width: 44, height: 44,
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.id === 'liked' ? '#FF6900' : '#000', fontSize: '18px',
                    }}>
                      {s.id === 'liked' ? <Icon.Plus s={13} /> : <Icon.Next s={13} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{s.label}</div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{s.desc}</div>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Context */}
        {step === 'context' && (
          <div style={{ flex: 1, padding: '24px 24px 40px' }}>
            <button
              onClick={() => setStep('source')}
              style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              {source === 'liked' ? 'Liked Songs' : 'Top Tracks'} - {library?.length ?? 0} tracks
            </button>

            <DotOrb />

            <div style={{ marginTop: '-8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#777', textTransform: 'uppercase', marginBottom: '8px' }}>Location</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(SCENES.length, 4)}, minmax(0, 1fr))`,
                  gap: '6px', padding: '4px',
                  border: '1px solid #ece9e4', borderRadius: '18px', background: '#f4f1ec',
                }}>
                  {SCENES.map(s => <Chip key={s} label={s} selected={scene === s} onClick={() => setScene(s)} />)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#777', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Activity
                  <span style={{ marginLeft: '8px', fontSize: '9px', color: '#FF6900', letterSpacing: '0.1em' }}>
                    {sensor ? 'AUTO' : 'MANUAL'}
                  </span>
                </div>
                {sensor ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 6px', border: '1px solid #ece9e4', borderRadius: '18px', background: '#f4f1ec' }}>
                    <span style={{
                      padding: '6px 12px', borderRadius: '999px',
                      border: '1.5px solid #FF6900', background: '#FF6900',
                      color: '#FF6900', fontSize: '11px', fontWeight: 600,
                      lineHeight: 1.2, whiteSpace: 'nowrap',
                    }}>
                      {activity}
                    </span>
                    <span style={{ fontSize: '10px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      detected from sensor
                    </span>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${ACTIVITIES.length}, minmax(0, 1fr))`,
                    gap: '6px', padding: '4px',
                    border: '1px solid #ece9e4', borderRadius: '18px', background: '#f4f1ec',
                  }}>
                    {ACTIVITIES.map(a => (
                      <Chip key={a} label={a}
                        selected={manualActivity === a}
                        onClick={() => setManualActivity(a)} />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#777', textTransform: 'uppercase', marginBottom: '8px' }}>Your current mood</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(MOODS.length, 4)}, minmax(0, 1fr))`,
                  gap: '6px', padding: '4px',
                  border: '1px solid #ece9e4', borderRadius: '18px', background: '#f4f1ec',
                }}>
                  {MOODS.map(m => <Chip key={m} label={m} selected={mood === m} onClick={() => setMood(m)} />)}
                </div>
              </div>

              {error && <p style={{ color: '#e24b4a', fontSize: '13px' }}>{error}</p>}

              <button
                onClick={runRecommend}
                disabled={loading}
                style={{
                  position: 'relative', width: '100%', padding: '16px',
                  background: '#000', color: '#fff', border: 'none', borderRadius: 0,
                  fontSize: 0, fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  marginTop: '18px', fontFamily: 'inherit',
                  letterSpacing: '0.02em', opacity: loading ? 0.92 : 1,
                  overflow: 'hidden',
                }}
              >
                {loading && <ButtonLoadingSweep />}
                <span style={{ position: 'relative', zIndex: 1, fontSize: '15px' }}>
                  {loading ? 'Matching...' : 'Recommend'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '112px' }}>

              {/* Sensor card */}
              <div style={{ padding: '16px 24px 12px' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '6px',
                  background: '#fff', border: '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: sensor ? '#1ed760' : '#ddd', flexShrink: 0,
                    boxShadow: sensor ? '0 0 8px rgba(30,215,96,0.6)' : 'none',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Sensor {sensorLoading ? '- detecting...' : sensor ? '- live' : '- offline'}
                    </div>
                    {sensor ? (
                      <div style={{ fontSize: '11px', color: '#444', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span><span style={{ color: '#aaa' }}>HR</span> <strong>{Math.round(sensor.heart_rate)}</strong></span>
                        <span><span style={{ color: '#aaa' }}>Noise</span> <strong>{Math.round(sensor.noise_level)}</strong></span>
                        <span><span style={{ color: '#aaa' }}>IMU</span> <strong>{sensor.activityLabel}</strong></span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#aaa' }}>Backend unreachable - using defaults</div>
                    )}
                  </div>
                  <button
                    onClick={runRecommend}
                    disabled={loading || sensorLoading}
                    title="Re-read sensor & refresh recommendations"
                    style={{
                      flexShrink: 0, width: '32px', height: '32px',
                      borderRadius: '50%', border: '1px solid #e0e0e0',
                      background: '#fff', color: '#666',
                      cursor: (loading || sensorLoading) ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: (loading || sensorLoading) ? 'spin 0.8s linear infinite' : 'none',
                    }}
                  >
                    <Icon.Refresh />
                  </button>
                </div>

                {/* Context tags */}
                <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginTop: '10px', flexWrap: 'nowrap' }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '5px' }}>
                    {[
                      { label: 'Scene', value: scene },
                      { label: 'Mood', value: mood },
                    ].map(tag => (
                      <span key={tag.label} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        gap: '4px', minWidth: 0, minHeight: '26px',
                        padding: '4px 7px', borderRadius: '4px',
                        border: '1px solid #ece9e4', color: '#555',
                        background: '#f4f1ec',
                        fontSize: '10px', lineHeight: 1, overflow: 'hidden',
                      }}>
                        <span style={{ color: '#aaa', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{tag.label}</span>
                        <span style={{ color: '#444', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag.value}</span>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep('context')}
                    style={{
                      flexShrink: 0, minHeight: '28px', padding: '5px 11px',
                      borderRadius: '4px', border: '1px solid #111',
                      background: '#111', color: '#fff', cursor: 'pointer',
                      fontSize: '10px', fontWeight: 700, fontFamily: 'inherit',
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.16)',
                    }}
                  >
                    <Icon.Edit />
                    Edit
                  </button>
                </div>
              </div>

              {/* Top 5 header */}
              <div style={{ padding: '8px 24px 12px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '4px' }}>For you</div>
                <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                  {results.length} <span style={{ color: '#FF6900' }}>tracks</span>
                </div>
              </div>

              {loading && results.length === 0 && (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #e0e0e0', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  Finding new tracks...
                </div>
              )}

              {/* Track list */}
              <div>
                {results.map((track, i) => {
                  const isCurrent     = nowPlaying?.id === track.id
                  const isPlayingThis = isCurrent && player.isPlaying
                  const inQueue       = queue.some(t => t.id === track.id)
                  const reasonTags    = track.reason ? pickReasonTags(track.reason) : []

                  return (
                    <div
                      key={track.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 18px',
                        background: i === 0 ? '#FF6900' : 'transparent',
                        borderBottom: '0.5px solid #f0f0f0',
                      }}
                    >
                      <div style={{ color: '#ddd', fontSize: '11px', fontWeight: 700, width: '18px', textAlign: 'center', flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>

                      {track.image
                        ? <Image src={track.image} alt={track.name} width={40} height={40}
                            style={{ borderRadius: '4px', objectFit: 'cover', flexShrink: 0, filter: i === 0 ? 'none' : 'grayscale(1)' }} />
                        : <div style={{ width: 40, height: 40, borderRadius: '4px', background: '#f0f0f0', flexShrink: 0 }} />
                      }

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.artist}
                        </div>
                        {reasonTags.length > 0 && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap',
                            minWidth: 0, maxWidth: '100%', marginTop: '5px',
                          }}>
                            {reasonTags.map((tag, tagIndex) => (
                              <span
                                key={`${track.id}-${tag}`}
                                style={{
                                  maxWidth: tagIndex === 0 ? '92px' : '78px',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  padding: '3px 7px', borderRadius: '999px',
                                  border: tagIndex === 0 ? '1px solid #FF6900' : '1px solid #ece9e4',
                                  background: tagIndex === 0 ? '#FF6900' : '#f4f1ec',
                                  color: tagIndex === 0 ? '#FF6900' : '#666',
                                  fontSize: '9px', fontWeight: 700, lineHeight: 1,
                                  letterSpacing: '0.04em', textTransform: 'uppercase',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); addToQueue(track) }}
                        title="Add to queue"
                        disabled={inQueue}
                        style={{
                          flexShrink: 0, width: '30px', height: '30px',
                          borderRadius: '50%', border: '1px solid #e0e0e0',
                          background: inQueue ? '#FF6900' : '#fff',
                          color: inQueue ? '#FF6900' : '#666',
                          cursor: inQueue ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon.Plus />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromResults(track) }}
                        title="Remove from recommendations"
                        style={{
                          flexShrink: 0, width: '30px', height: '30px',
                          borderRadius: '50%', border: '1px solid #e0e0e0',
                          background: '#fff', color: '#999', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon.Trash />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); playNow(track) }}
                        disabled={!player.ready}
                        title={player.ready ? 'Play now' : 'Player loading...'}
                        style={{
                          flexShrink: 0, width: '30px', height: '30px',
                          borderRadius: '50%', border: 'none',
                          background: isPlayingThis ? '#1ed760' : '#000',
                          color: '#fff',
                          cursor: player.ready ? 'pointer' : 'not-allowed',
                          opacity: player.ready ? 1 : 0.4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon.Play s={11} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {error && (
                <div style={{ padding: '12px 24px', color: '#e24b4a', fontSize: '12px' }}>
                  {error}
                  <button
                    onClick={() => { setError(null); runRecommend() }}
                    style={{ marginLeft: '8px', background: 'none', border: '1px solid #e24b4a', color: '#e24b4a', borderRadius: '4px', padding: '2px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Mini player (sticky bottom) */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '92px', background: '#000', color: '#fff',
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px 0', zIndex: 5,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            }}>
              <div style={{ position: 'absolute', top: '8px', left: '14px', right: '14px' }}>
                <PlaybackProgress
                  positionMs={player.positionMs}
                  durationMs={player.durationMs}
                  onSeek={player.seek}
                  dark
                />
              </div>
              {nowPlaying?.image
                ? <Image src={nowPlaying.image} alt="" width={48} height={48}
                    style={{ borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 48, height: 48, borderRadius: '4px', background: '#222', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#555' }}>M</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nowPlaying ? nowPlaying.name : 'Nothing playing'}
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nowPlaying ? nowPlaying.artist : 'Tap play on a track above'}
                </div>
              </div>

              <button
                onClick={playPrevious}
                disabled={!player.ready || noPrevAvailable}
                title="Previous"
                style={{
                  flexShrink: 0, width: '32px', height: '32px',
                  borderRadius: '50%', border: '1px solid #333',
                  background: 'transparent', color: '#fff',
                  cursor: (!player.ready || noPrevAvailable) ? 'not-allowed' : 'pointer',
                  opacity: (!player.ready || noPrevAvailable) ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon.Prev s={12} />
              </button>

              <button
                onClick={() => player.togglePlay()}
                disabled={!player.ready || !nowPlaying}
                title="Play / Pause"
                style={{
                  flexShrink: 0, width: '36px', height: '36px',
                  borderRadius: '50%', border: 'none',
                  background: '#fff', color: '#000',
                  cursor: (player.ready && nowPlaying) ? 'pointer' : 'not-allowed',
                  opacity: (player.ready && nowPlaying) ? 1 : 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {player.isPlaying ? <Icon.Pause s={13} /> : <Icon.Play s={13} />}
              </button>

              <button
                onClick={playNext}
                disabled={!player.ready || noNextAvailable}
                title="Next"
                style={{
                  flexShrink: 0, width: '32px', height: '32px',
                  borderRadius: '50%', border: '1px solid #333',
                  background: 'transparent', color: '#fff',
                  cursor: noNextAvailable ? 'not-allowed' : 'pointer',
                  opacity: noNextAvailable ? 0.3 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon.Next s={12} />
              </button>

              <button
                onClick={() => setPlayerExpanded(true)}
                title="Show queue"
                style={{
                  flexShrink: 0, width: '32px', height: '32px',
                  borderRadius: '50%', border: '1px solid #333',
                  background: 'transparent', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon.ChevUp />
              </button>
            </div>

            {/* Expanded player sheet */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
              background: '#000', color: '#fff',
              transform: playerExpanded ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
              zIndex: 20, display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '12px 0 2px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <button
                  onClick={() => setPlayerExpanded(false)}
                  style={{
                    width: '40px', height: '4px', borderRadius: '2px',
                    background: '#333', border: 'none', cursor: 'pointer',
                  }}
                  aria-label="Collapse"
                />
              </div>
              <div style={{ padding: '0 16px 2px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <button
                  onClick={() => setPlayerExpanded(false)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    border: '1px solid #333', background: 'transparent', color: '#fff',
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                  aria-label="Close"
                >
                  <Icon.ChevDn s={20} />
                </button>
              </div>

              {nowPlaying ? (
                <>
                  <div style={{ padding: '8px 32px 18px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                    {nowPlaying.image
                      ? <Image src={nowPlaying.image} alt={nowPlaying.name} width={240} height={240}
                          style={{ borderRadius: '8px', objectFit: 'cover', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }} />
                      : <div style={{ width: 240, height: 240, borderRadius: '8px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: '#555' }}>M</div>
                    }
                  </div>

                  <div style={{ padding: '0 32px 14px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nowPlaying.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>{nowPlaying.artist}</div>
                  </div>

                  <div style={{ padding: '0 32px 18px', flexShrink: 0 }}>
                    <PlaybackProgress
                      positionMs={player.positionMs}
                      durationMs={player.durationMs}
                      onSeek={player.seek}
                      showTimes
                      dark
                    />
                  </div>

                  <div style={{ padding: '0 32px 18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
                    <button onClick={playPrevious} disabled={!player.ready || noPrevAvailable}
                      style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        border: '1px solid #333', background: 'transparent', color: '#fff',
                        cursor: (!player.ready || noPrevAvailable) ? 'not-allowed' : 'pointer',
                        opacity: (!player.ready || noPrevAvailable) ? 0.4 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Icon.Prev s={16} />
                    </button>
                    <button onClick={() => player.togglePlay()} disabled={!player.ready}
                      style={{
                        width: '60px', height: '60px', borderRadius: '50%', border: 'none',
                        background: '#fff', color: '#000',
                        cursor: player.ready ? 'pointer' : 'not-allowed',
                        opacity: player.ready ? 1 : 0.4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      {player.isPlaying ? <Icon.Pause s={20} /> : <Icon.Play s={20} />}
                    </button>
                    <button onClick={playNext} disabled={noNextAvailable}
                      style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        border: '1px solid #333', background: 'transparent', color: '#fff',
                        cursor: noNextAvailable ? 'not-allowed' : 'pointer',
                        opacity: noNextAvailable ? 0.4 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Icon.Next s={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px 32px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                  Nothing playing yet. Tap play on a track above.
                </div>
              )}

              <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #1f1f1f', padding: '14px 0 24px' }}>
                <div style={{ padding: '0 24px 10px', fontSize: '10px', letterSpacing: '0.18em', color: '#777', textTransform: 'uppercase' }}>
                  Up Next - {Math.max(queue.length - 1, 0)}
                </div>
                {queue.length <= 1 ? (
                  <div style={{ padding: '20px 24px', fontSize: '12px', color: '#777', textAlign: 'center' }}>
                    Queue is empty. Add tracks from above.
                  </div>
                ) : (
                  queue.slice(1).map((track, i) => (
                    <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 24px' }}>
                      <div style={{ color: '#555', fontSize: '11px', fontWeight: 600, width: '18px', flexShrink: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      {track.image
                        ? <Image src={track.image} alt="" width={36} height={36}
                            style={{ borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '4px', background: '#222', flexShrink: 0 }} />
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.artist}
                        </div>
                      </div>
                      <button
                        onClick={() => setQueue(q => q.filter(t => t.id !== track.id))}
                        title="Remove from queue"
                        style={{
                          flexShrink: 0, width: '26px', height: '26px',
                          borderRadius: '50%', border: '1px solid #333',
                          background: 'transparent', color: '#999', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon.Trash s={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {player.error && !playerExpanded && (
              <div style={{
                position: 'absolute', bottom: '100px', left: '24px', right: '24px',
                padding: '8px 12px', fontSize: '11px', color: '#e24b4a',
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px',
                zIndex: 6,
              }}>
                {player.error}
              </div>
            )}
          </>
        )}

        {step === 'select' && (
          <SelectStep
            curated={curatedTracks}
            onCancel={() => setStep('results')}
            onConfirm={(ids) => {
              setSelectedForCard(curatedTracks.filter(t => ids.includes(t.id)))
              setStep('cardType')
            }}
          />
        )}

        {step === 'cardType' && (
          <CardStep
            selected={selectedForCard}
            userId={userId}
            userName={userName}
            onBack={() => setStep('select')}
            onOpenGallery={userId ? () => setStep('gallery') : undefined}
          />
        )}

        {step === 'gallery' && (
          <GalleryStep
            userId={userId}
            userName={userName}
            onBack={() => setStep('results')}
            onReplay={handleReplay}
          />
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes geomelody-button-block {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(430%); }
          }
        `}</style>
      </div>

      <Script src="https://sdk.scdn.co/spotify-player.js" strategy="afterInteractive" />
    </>
  )
}
