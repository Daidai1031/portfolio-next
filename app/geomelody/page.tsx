'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { loginWithSpotify, getAccessToken, logout } from '@/lib/geomelody/auth'
import { getUserPlaylists, getPlaylistTracks, Track, Playlist } from '@/lib/geomelody/api'
import { recommendWithClaude } from '@/lib/geomelody/recommend'

type Step = 'playlist' | 'context' | 'results'
type TrackWithReason = Track & { reason?: string }

function DotOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const volumeRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 260, H = 260
    const cx = W / 2, cy = H / 2
    const BASE_R = 70
    const DOT_COUNT = 800

    // 生成球面上的点
    const dots: { theta: number; phi: number; offset: number }[] = []
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        theta: 2 * Math.PI * Math.random(),
        phi: Math.acos(2 * Math.random() - 1),
        offset: Math.random() * Math.PI * 2,
      })
    }

    let mic: MediaStream | null = null
    let analyser: AnalyserNode | null = null
    let dataArray: Uint8Array | null = null

    navigator.mediaDevices?.getUserMedia({ audio: true }).then(stream => {
      mic = stream
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      dataArray = new Uint8Array(analyser.frequencyBinCount)
      source.connect(analyser)
    }).catch(() => {})

    let time = 0
    function draw() {
      ctx!.clearRect(0, 0, W, H)
      time += 0.02

      // 读取音量
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
        // 音量驱动的随机扰动
        const noise = Math.sin(d.theta * 3 + time + d.offset) * Math.cos(d.phi * 2 + time * 0.7) * v * 18
        const r = R + noise

        const x = cx + r * Math.sin(d.phi) * Math.cos(d.theta)
        const y = cy + r * Math.sin(d.phi) * Math.sin(d.theta)

        // 深度感
        const depth = (Math.cos(d.phi) + 1) / 2
        const alpha = 0.05 + depth * 0.35 + v * 0.2
        const size = 0.8 + depth * 0.8 + v * 0.6

        ctx!.beginPath()
        ctx!.arc(x, y, size, 0, Math.PI * 2)
        ctx!.fillStyle = v > 0.15
          ? `rgba(249,115,22,${alpha})`
          : `rgba(0,0,0,${alpha})`
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

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={260}
      style={{ display: 'block', margin: '0 auto' }}
    />
  )
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '20px',
        border: selected ? '1.5px solid #f97316' : '1px solid #e0e0e0',
        background: selected ? '#fff7f0' : '#fff',
        color: selected ? '#f97316' : '#666',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}

const SCENES   = ['Café','Library','Street','Subway','Park']
const ACTIVITIES = ['Still','Working','Walking']
const MOODS    = ['Focused','Relaxed','Stressed','Energetic']

const sceneMap: Record<string, string>    = { 'Café':'cafe','Library':'library','Street':'street','Subway':'subway','Park':'park' }
const activityMap: Record<string, string> = { 'Still':'stationary','Working':'working','Walking':'walking' }
const moodMap: Record<string, string>     = { 'Focused':'focused','Relaxed':'relaxed','Stressed':'stressed','Energetic':'energetic' }

export default function GeoMelodyPage() {
  const [token, setToken]                       = useState<string | null>(null)
  const [step, setStep]                         = useState<Step>('playlist')
  const [playlists, setPlaylists]               = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [library, setLibrary]                   = useState<Track[] | null>(null)
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState<string | null>(null)
  const [scene, setScene]                       = useState('Café')
  const [activity, setActivity]                 = useState('Still')
  const [mood, setMood]                         = useState('Focused')
  const [results, setResults]                   = useState<TrackWithReason[]>([])

  useEffect(() => { setToken(getAccessToken()) }, [])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getUserPlaylists()
      .then(p => { setPlaylists(p); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [token])

  async function handleSelectPlaylist(playlist: Playlist) {
    setSelectedPlaylist(playlist)
    setLoading(true)
    setError(null)
    try {
      const tracks = await getPlaylistTracks(playlist.id)
      setLibrary(tracks)
      setStep('context')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRecommend() {
    if (!library) return
    setLoading(true)
    setError(null)
    try {
      const recommendations = await recommendWithClaude(
        library.map(t => ({ id: t.id, name: t.name, artist: t.artist })),
        scene, activity, mood
      )
      const resultTracks = recommendations
        .map(r => ({
          ...library.find(t => t.id === r.id)!,
          reason: r.reason,
        }))
        .filter(Boolean)
      setResults(resultTracks)
      setStep('results')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const phone: React.CSSProperties = {
    width: '100%',
    maxWidth: '390px',
    minHeight: '844px',
    margin: '0 auto',
    background: '#fafaf8',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    position: 'relative',
    overflowX: 'hidden',
  }

  if (!token) {
    return (
      <div style={phone}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
          <DotOrb />
          <div style={{ marginTop: '-20px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>
              Context-Aware Music
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-1px', margin: '0 0 12px', lineHeight: 1.1 }}>
              Geo<span style={{ color: '#f97316' }}>Melody</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6, margin: '0 0 40px' }}>
              Music from your library,<br />matched to your moment.
            </p>
            <button
              onClick={loginWithSpotify}
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '16px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: 'inherit',
              }}
            >
              Connect Spotify
            </button>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '12px' }}>Requires Spotify Premium</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={phone}>
      {/* Header */}
      <div style={{ padding: '56px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#bbb', textTransform: 'uppercase' }}>Context-Aware</div>
          <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
            Geo<span style={{ color: '#f97316' }}>Melody</span>
          </div>
        </div>
        <button
          onClick={() => { logout(); setToken(null); setLibrary(null); setResults([]); setStep('playlist') }}
          style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: '#888', cursor: 'pointer', marginTop: '8px', fontFamily: 'inherit' }}
        >
          Disconnect
        </button>
      </div>

      {/* Step 1 — Playlist */}
      {step === 'playlist' && (
        <div style={{ flex: 1, padding: '24px 24px 40px' }}>
          <DotOrb />
          <div style={{ marginTop: '-12px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '16px' }}>
              Choose playlist
            </div>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', fontSize: '13px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #e0e0e0', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Loading…
              </div>
            )}
            {error && <p style={{ color: '#e24b4a', fontSize: '13px' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#ebebeb', borderRadius: '16px', overflow: 'hidden' }}>
              {playlists.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlaylist(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: '#fff', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'background 0.1s',
                  }}
                >
                  {p.image
                    ? <Image src={p.image} alt={p.name} width={44} height={44} style={{ borderRadius: '8px', objectFit: 'cover', filter: 'grayscale(1)' }} />
                    : <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#f0f0f0', flexShrink: 0 }} />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{p.total} tracks</div>
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

      {/* Step 2 — Context */}
      {step === 'context' && (
        <div style={{ flex: 1, padding: '24px 24px 40px' }}>
          <button
            onClick={() => setStep('playlist')}
            style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            {selectedPlaylist?.name}
          </button>

          <DotOrb />

          <div style={{ marginTop: '-8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '10px' }}>Where</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SCENES.map(s => <Chip key={s} label={s} selected={scene === s} onClick={() => setScene(s)} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '10px' }}>Activity</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ACTIVITIES.map(a => <Chip key={a} label={a} selected={activity === a} onClick={() => setActivity(a)} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '10px' }}>Mood</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {MOODS.map(m => <Chip key={m} label={m} selected={mood === m} onClick={() => setMood(m)} />)}
              </div>
            </div>

            <button
              onClick={handleRecommend}
              style={{
                width: '100%', padding: '16px', background: '#000', color: '#fff',
                border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', marginTop: '8px', fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              Recommend →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Results */}
      {step === 'results' && (
        <div style={{ flex: 1, padding: '24px 0 40px' }}>
          <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setStep('context')}
              style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontFamily: 'inherit' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[scene, mood].map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', border: '1px solid #e0e0e0', color: '#888' }}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: '0 24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase', marginBottom: '4px' }}>For you</div>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.3px' }}>
              {results.length} <span style={{ color: '#f97316' }}>tracks</span>
            </div>
          </div>

          <div>
            {results.map((track, i) => {
              const isTop = i === 0
              return (
                <div
                  key={track.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 24px',
                    background: isTop ? '#fff7f0' : 'transparent',
                    borderBottom: '0.5px solid #f0f0f0',
                  }}
                >
                  <div style={{ color: '#ddd', fontSize: '11px', fontWeight: 700, width: '18px', textAlign: 'center', flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {track.image
                    ? <Image src={track.image} alt={track.name} width={48} height={48}
                        style={{ borderRadius: '10px', objectFit: 'cover', flexShrink: 0, filter: isTop ? 'none' : 'grayscale(1)' }} />
                    : <div style={{ width: 48, height: 48, borderRadius: '10px', background: '#f0f0f0', flexShrink: 0 }} />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{track.artist}</div>
                    {track.reason && (
                      <div style={{ fontSize: '11px', color: '#f97316', marginTop: '4px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {track.reason}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '24px 24px 0' }}>
            <button
              onClick={() => setStep('context')}
              style={{
                width: '100%', padding: '14px', background: 'transparent',
                border: '1px solid #e0e0e0', borderRadius: '14px',
                fontSize: '14px', color: '#666', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Change context
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}