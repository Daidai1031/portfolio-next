// app/projects/geomelody/_components/GalleryStep.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { listCards, deleteCard, type SavedCard } from '../_lib/gallery'
import { getPalette } from '../_lib/palette'
import { getTimeOfDay } from '../_lib/timeOfDay'
import { formatDate } from '../_lib/cardHelpers'
import PoemCard from './cards/PoemCard'
import WordCloudCard from './cards/WordCloudCard'

const CARD_SIZE = 1080
const PREVIEW_W  = 320

interface Props {
  userId: string
  userName: string
  onBack: () => void
}

export default function GalleryStep({ userId, userName, onBack }: Props) {
  const [cards, setCards] = useState<SavedCard[]>([])
  const [openCardId, setOpenCardId] = useState<string | null>(null)

  // Load on mount + on userId change
  useEffect(() => {
    setCards(listCards(userId))
  }, [userId])

  // Inject Caveat (gallery uses it in thumbs)
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.querySelector('link[data-caveat]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap'
    link.dataset.caveat = 'true'
    document.head.appendChild(link)
  }, [])

  function handleDelete(id: string) {
    if (!confirm('Delete this card from your gallery?')) return
    deleteCard(userId, id)
    setCards(listCards(userId))
    setOpenCardId(null)
  }

  const openCard = openCardId ? cards.find(c => c.id === openCardId) ?? null : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '8px 24px 12px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: '#aaa', fontSize: '13px',
            cursor: 'pointer', padding: '6px 0 12px',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'inherit',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#777', textTransform: 'uppercase' }}>
          Your collection
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px', letterSpacing: '-0.3px' }}>
          Gallery <span style={{ color: '#f97316' }}>·</span> {cards.length}
        </div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          Cards saved for {userName}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px' }}>
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}>
            {cards.map(card => (
              <Thumbnail
                key={card.id}
                card={card}
                onOpen={() => setOpenCardId(card.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {openCard && (
        <PreviewModal
          card={openCard}
          onClose={() => setOpenCardId(null)}
          onDelete={() => handleDelete(openCard.id)}
        />
      )}
    </div>
  )
}

// ── Lightweight thumbnail (no full card render) ───────────
function Thumbnail({ card, onOpen }: { card: SavedCard; onOpen: () => void }) {
  const palette = getPalette(card.scene, card.mood)
  const tod = getTimeOfDay(new Date(card.createdAt))

  return (
    <button
      onClick={onOpen}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'block',
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: `linear-gradient(165deg, ${palette.bg1} 0%, ${palette.bg2} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 6px 18px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        // intentionally no border-radius
      }}>
        {/* Inner double border (scaled down) */}
        <div style={{
          position: 'absolute', inset: 8,
          border: `0.5px solid ${palette.divider}`,
        }} />
        <div style={{
          position: 'absolute', inset: 11,
          border: `0.5px solid ${palette.divider}`,
          opacity: 0.5,
        }} />

        {/* Centered content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '16px 12px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '8px',
            letterSpacing: '0.22em',
            color: palette.fgSoft,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            {card.cardType === 'poem' ? 'Poem' : 'Cloud'}
          </div>
          <div style={{
            fontFamily: "var(--font-cormorant-garamond), 'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '24px',
            color: palette.fg,
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}>
            {card.scene}
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '15px',
            color: palette.accent,
            marginTop: '4px',
            lineHeight: 1,
          }}>
            {tod.phrase}
          </div>
        </div>

        {/* Bottom track count */}
        <div style={{
          position: 'absolute', bottom: 14, left: 0, right: 0,
          textAlign: 'center',
          fontSize: '7px',
          letterSpacing: '0.2em',
          color: palette.fgSoft,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          {card.selected.length} tracks
        </div>
      </div>
      <div style={{
        marginTop: '6px',
        fontSize: '10px',
        color: '#999',
        letterSpacing: '0.05em',
        textAlign: 'center',
      }}>
        {formatDate(card.createdAt)}
      </div>
    </button>
  )
}

// ── Empty state ───────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      padding: '60px 32px 24px',
      textAlign: 'center',
      color: '#aaa',
      fontSize: '13px',
      lineHeight: 1.55,
    }}>
      <div style={{
        fontSize: '24px',
        color: '#f97316',
        marginBottom: '14px',
      }}>
        ✦
      </div>
      Your gallery is empty.<br />
      Save a card from a session and it will appear here,<br />
      ready to revisit.
    </div>
  )
}

// ── Preview modal: full card + download / delete ──────────
function PreviewModal({
  card, onClose, onDelete,
}: {
  card: SavedCard
  onClose: () => void
  onDelete: () => void
}) {
  const [downloading, setDownloading] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const palette = useMemo(
    () => getPalette(card.scene, card.mood),
    [card.scene, card.mood]
  )
  const previewScale = PREVIEW_W / CARD_SIZE

  const cardEl = card.cardType === 'poem'
    ? <PoemCard
        selected={card.selected}
        condition={card.condition}
        palette={palette}
        poem={card.poem}
        date={card.createdAt}
        userName={card.userName}
        layout={card.layout ?? 1}
      />
    : <WordCloudCard
        selected={card.selected}
        condition={card.condition}
        palette={palette}
        poem={card.poem}
        date={card.createdAt}
        userName={card.userName}
        layout={card.layout ?? 1}
      />

  async function handleDownload() {
    if (!captureRef.current) return
    setDownloading(true)
    try {
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready
      }
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(captureRef.current, {
        width: CARD_SIZE, height: CARD_SIZE,
        pixelRatio: 1,
        cacheBust: true,
      })
      const filename = `geomelody-${card.cardType}-${new Date(card.createdAt).toISOString().slice(0, 10)}.png`
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('[gallery] download failed:', e)
      alert(`Could not save the image. ${e instanceof Error ? e.message : ''}`)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 30,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fafaf8',
          width: '100%',
          maxWidth: '342px',
          padding: '22px 22px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: '#888',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            {card.cardType === 'poem' ? 'Poem Card' : 'Word Cloud'}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none', color: '#888',
              fontSize: '20px', cursor: 'pointer',
              padding: '0', lineHeight: 1,
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        </div>

        {/* Card preview */}
        <div style={{
          width: PREVIEW_W,
          height: PREVIEW_W,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
          position: 'relative',
          background: '#fff',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: CARD_SIZE, height: CARD_SIZE,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}>
            {cardEl}
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          color: '#999',
          letterSpacing: '0.05em',
        }}>
          {formatDate(card.createdAt)} · {card.scene} · {card.mood}
        </div>

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={onDelete}
            style={{
              flex: 1, padding: '13px',
              background: '#fff',
              color: '#e24b4a',
              border: '1px solid #e24b4a',
              borderRadius: 0,
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.04em',
            }}
          >
            Delete
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1.4, padding: '13px',
              background: downloading ? '#ddd' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 0,
              fontSize: '12px', fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.04em',
            }}
          >
            {downloading ? 'Saving…' : 'Download PNG'}
          </button>
        </div>
      </div>

      {/* Hidden full-size capture target */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: -20000, left: -20000,
          width: CARD_SIZE, height: CARD_SIZE,
          pointerEvents: 'none', zIndex: -1,
        }}
      >
        <div ref={captureRef} style={{ width: CARD_SIZE, height: CARD_SIZE }}>
          {cardEl}
        </div>
      </div>
    </div>
  )
}
