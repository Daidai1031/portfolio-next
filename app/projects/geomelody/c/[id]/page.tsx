// app/projects/geomelody/c/[id]/page.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchCardById, type SavedCard } from '../../_lib/gallery'
import { getPalette } from '../../_lib/palette'
import { formatDate } from '../../_lib/cardHelpers'
import PoemCard from '../../_components/cards/PoemCard'
import WordCloudCard from '../../_components/cards/WordCloudCard'

const CARD_SIZE = 1080
const PREVIEW_W = 360

const GEOMELODY_FONT =
  "var(--font-cormorant-garamond), 'Cormorant Garamond', Georgia, 'Times New Roman', serif"

export default function PublicCardPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [card, setCard] = useState<SavedCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inject the same handwritten font set Cards use so the share view
  // matches the in-app look. Without this the share recipient sees a
  // very different card from the screenshot.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.querySelector('link[data-geomelody-fonts]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Long+Cang&display=swap'
    link.dataset.geomelodyFonts = 'true'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    fetchCardById(id)
      .then(c => {
        if (cancelled) return
        if (!c) setError('not_found')
        else setCard(c)
      })
      .catch(err => {
        if (!cancelled) setError(err?.message ?? 'failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const palette = card ? getPalette(card.scene, card.mood) : null
  const previewScale = PREVIEW_W / CARD_SIZE

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette
          ? `linear-gradient(180deg, ${palette.bg2} 0%, #fafaf8 60%)`
          : '#fafaf8',
        fontFamily: GEOMELODY_FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px 60px',
      }}
    >
      {/* Header */}
      <Link
        href="/projects/geomelody"
        style={{
          textDecoration: 'none',
          marginBottom: '24px',
          display: 'inline-flex',
          alignItems: 'baseline',
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: 0,
          fontVariantLigatures: 'common-ligatures',
        }}
        aria-label="GeoMelody"
      >
        <span style={{ color: '#111' }}>Geo</span>
        <span style={{ marginLeft: '2px', color: '#FF6900' }}>Melody</span>
      </Link>

      {loading && (
        <div style={{ color: '#aaa', fontSize: '13px' }}>Loading the moment…</div>
      )}

      {error === 'not_found' && <NotFound />}
      {error && error !== 'not_found' && (
        <div style={{ color: '#e24b4a', fontSize: '13px' }}>Could not load: {error}</div>
      )}

      {card && palette && (
        <>
          {/* Card preview */}
          <div
            style={{
              width: PREVIEW_W,
              height: PREVIEW_W,
              overflow: 'hidden',
              boxShadow:
                '0 18px 50px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)',
              background: '#fff',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: CARD_SIZE,
                height: CARD_SIZE,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              {card.cardType === 'poem' ? (
                <PoemCard
                  selected={card.selected}
                  condition={card.condition}
                  palette={palette}
                  poem={card.poem}
                  date={card.createdAt}
                  userName={card.userName}
                  layout={card.layout ?? 1}
                />
              ) : (
                <WordCloudCard
                  selected={card.selected}
                  condition={card.condition}
                  palette={palette}
                  poem={card.poem}
                  date={card.createdAt}
                  userName={card.userName}
                  layout={card.layout ?? 1}
                />
              )}
            </div>
          </div>

          {/* Caption */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#888',
              letterSpacing: '0.06em',
              textAlign: 'center',
            }}
          >
            {formatDate(card.createdAt)} · {card.scene} · {card.mood}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#aaa',
            }}
          >
            shared by {card.userName}
          </div>

          {/* Track list */}
          <div
            style={{
              marginTop: '32px',
              width: '100%',
              maxWidth: '420px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                color: '#888',
                textTransform: 'uppercase',
                marginBottom: '12px',
                paddingLeft: '4px',
              }}
            >
              {card.selected.length} tracks · open in Spotify
            </div>
            <div
              style={{
                background: '#fff',
                border: '1px solid #f0f0f0',
              }}
            >
              {card.selected.map((track, i) => (
                <a
                  key={track.id}
                  href={`https://open.spotify.com/track/${track.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderBottom:
                      i < card.selected.length - 1 ? '0.5px solid #f0f0f0' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {track.image ? (
                    <Image
                      src={track.image}
                      alt=""
                      width={40}
                      height={40}
                      style={{
                        borderRadius: '4px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '4px',
                        background: '#f0f0f0',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#111',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {track.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#aaa',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {track.artist}
                    </div>
                  </div>
                  <SpotifyIcon />
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: '40px',
              textAlign: 'center',
              maxWidth: '320px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
              GeoMelody picks music from <em>your</em> Spotify library<br />
              that fits the moment you&apos;re in.
            </div>
            <Link
              href="/projects/geomelody"
              style={{
                display: 'inline-block',
                marginTop: '14px',
                padding: '12px 24px',
                background: '#000',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              Try it →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <div
      style={{
        marginTop: '40px',
        padding: '32px 24px',
        background: '#fff',
        border: '1px solid #f0f0f0',
        maxWidth: '420px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '24px', color: '#FF6900', marginBottom: '12px' }}>✦</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>
        This moment isn&apos;t here anymore
      </div>
      <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.55 }}>
        The card may have been deleted, or the link is wrong.
      </div>
      <Link
        href="/projects/geomelody"
        style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 18px',
          background: '#000',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        Open GeoMelody
      </Link>
    </div>
  )
}

function SpotifyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#1ed760"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.42c-.18.3-.57.39-.87.21-2.4-1.47-5.42-1.8-8.97-.99-.34.08-.68-.13-.76-.47s.13-.68.47-.76c3.89-.89 7.23-.51 9.92 1.14.3.18.4.57.21.87zm1.22-2.72c-.23.37-.71.48-1.08.25-2.75-1.69-6.94-2.18-10.19-1.19-.41.13-.85-.11-.98-.52-.13-.41.11-.85.52-.98 3.72-1.13 8.34-.58 11.5 1.37.36.22.48.71.23 1.07zm.11-2.83C14.6 9 8.84 8.81 5.6 9.79c-.49.15-1.01-.13-1.16-.62-.15-.49.13-1.01.62-1.16 3.74-1.13 10.11-.91 14.06 1.43.45.27.6.85.34 1.3-.27.45-.85.6-1.3.33z" />
    </svg>
  )
}