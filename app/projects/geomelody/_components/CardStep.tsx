// app/projects/geomelody/_components/CardStep.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { aggregateCondition, cleanTitle } from '../_lib/cardHelpers'
import { getPalette } from '../_lib/palette'
import { generatePoem, type Poem } from '../_lib/poem'
import type { CuratedTrack } from './SelectStep'
import PoemCard from './cards/PoemCard'
import WordCloudCard from './cards/WordCloudCard'
import { saveCard, type CardLayout, type CardType } from '../_lib/gallery'

const CARD_SIZE = 1080
const PREVIEW_W = 320
const CARD_CHOICES: { id: CardType; label: string }[] = [
  { id: 'poem',  label: 'Poem'  },
  { id: 'cloud', label: 'Cloud' },
]

interface Props {
  selected: CuratedTrack[]
  userId: string
  userName: string
  onBack: () => void
  onOpenGallery?: () => void
}

export default function CardStep({ selected, userId, userName, onBack, onOpenGallery }: Props) {
  const [type, setType] = useState<CardType>('poem')
  const [poem, setPoem] = useState<Poem | null>(null)
  const [poemError, setPoemError] = useState<string | null>(null)
  const [poemLoading, setPoemLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set())
  const [layouts, setLayouts] = useState<Record<CardType, CardLayout>>({ poem: 1, cloud: 1 })
  const [flipDirection, setFlipDirection] = useState<1 | -1>(1)
  const [flipNonce, setFlipNonce] = useState(0)
  const [saveFly, setSaveFly] = useState<{
    left: number
    top: number
    width: number
    height: number
    dx: number
    dy: number
    scale: number
    key: number
  } | null>(null)
  const [date] = useState(() => Date.now())

  const condition = useMemo(
    () => aggregateCondition(selected.map(t => t.context)),
    [selected]
  )
  const palette = useMemo(
    () => getPalette(condition.scene, condition.mood),
    [condition.scene, condition.mood]
  )

  const captureRef = useRef<HTMLDivElement>(null)
  const previewCardRef = useRef<HTMLDivElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const swipeStartXRef = useRef<number | null>(null)

  // Inject Caveat font once
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.querySelector('link[data-caveat]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap'
    link.dataset.caveat = 'true'
    document.head.appendChild(link)
  }, [])

  // Generate poem in parallel with rendering
  useEffect(() => {
    let cancelled = false
    setPoemLoading(true)
    setPoemError(null)

    const titles = selected
      .map(t => cleanTitle(t.name))
      .filter(t => t.length > 0)

    if (titles.length < 3) {
      setPoemError('Need at least 3 titles')
      setPoemLoading(false)
      return
    }

    generatePoem({
      titles,
      scene: condition.scene,
      mood: condition.mood,
      activity: condition.activity,
      hr: condition.hr,
      noise: condition.noise,
    })
      .then(p => { if (!cancelled) setPoem(p) })
      .catch(err => { if (!cancelled) setPoemError(err.message ?? String(err)) })
      .finally(() => { if (!cancelled) setPoemLoading(false) })

    return () => { cancelled = true }
  }, [selected, condition.scene, condition.mood, condition.activity, condition.hr, condition.noise])

  async function handleDownload() {
    if (!captureRef.current) return
    setDownloading(true)
    try {
      // Wait for fonts (Caveat especially) before capture
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready
      }
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(captureRef.current, {
        width: CARD_SIZE, height: CARD_SIZE,
        pixelRatio: 1,
        cacheBust: true,
      })
      const filename = `geomelody-${type}-${new Date(date).toISOString().slice(0, 10)}.png`
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('[card] download failed:', e)
      alert(`Could not save the image. ${e instanceof Error ? e.message : ''}`)
    } finally {
      setDownloading(false)
    }
  }

  function handleSave() {
    const saveKey = `${type}-${layouts[type]}`
    if (savedCards.has(saveKey)) return
    if (type === 'poem' && !poem) return
    try {
      saveCard({
        userId,
        userName,
        cardType: type,
        layout: layouts[type],
        selected,
        poem: type === 'poem' ? poem : null,
        condition,
        scene: condition.scene,
        mood: condition.mood,
      })
      const cardRect = previewCardRef.current?.getBoundingClientRect()
      const buttonRect = saveButtonRef.current?.getBoundingClientRect()
      if (cardRect && buttonRect) {
        const buttonCenterX = buttonRect.left + buttonRect.width / 2
        const buttonCenterY = buttonRect.top + buttonRect.height / 2
        const cardCenterX = cardRect.left + cardRect.width / 2
        const cardCenterY = cardRect.top + cardRect.height / 2
        setSaveFly({
          left: cardRect.left,
          top: cardRect.top,
          width: cardRect.width,
          height: cardRect.height,
          dx: buttonCenterX - cardCenterX,
          dy: buttonCenterY - cardCenterY,
          scale: Math.max(0.08, Math.min(0.18, buttonRect.height / cardRect.height)),
          key: Date.now(),
        })
        window.setTimeout(() => setSaveFly(null), 620)
      }
      setSavedCards(prev => new Set(prev).add(saveKey))
    } catch (e) {
      alert(`Could not save to gallery. ${e instanceof Error ? e.message : ''}`)
    }
  }

  function switchCard(nextType: CardType, direction?: 1 | -1) {
    if (nextType === type) return
    const currentIndex = CARD_CHOICES.findIndex(c => c.id === type)
    const nextIndex = CARD_CHOICES.findIndex(c => c.id === nextType)
    const inferredDirection = direction ?? (nextIndex > currentIndex ? 1 : -1)
    setFlipDirection(inferredDirection)
    setFlipNonce(n => n + 1)
    setType(nextType)
  }

  function showAdjacentCard(direction: 1 | -1) {
    const currentIndex = CARD_CHOICES.findIndex(c => c.id === type)
    const nextIndex = (currentIndex + direction + CARD_CHOICES.length) % CARD_CHOICES.length
    switchCard(CARD_CHOICES[nextIndex].id, direction)
  }

  function finishSwipe(clientX: number) {
    const startX = swipeStartXRef.current
    swipeStartXRef.current = null
    if (startX === null) return

    const deltaX = clientX - startX
    if (Math.abs(deltaX) < 44) return
    showAdjacentCard(deltaX < 0 ? 1 : -1)
  }

  const activeLayout = layouts[type]
  const activeSaveKey = `${type}-${activeLayout}`
  const cardProps = { selected, condition, palette, poem, date, userName, layout: activeLayout }
  const previewScale = PREVIEW_W / CARD_SIZE
  const themeColor = palette.fg
  const activeCardLabel = CARD_CHOICES.find(c => c.id === type)?.label ?? 'Poem'

  const ActiveCard =
    type === 'poem'
      ? <PoemCard      {...cardProps} loading={poemLoading} error={poemError} />
      : <WordCloudCard {...cardProps} />

  const downloadDisabled = downloading || (type === 'poem' && (poemLoading || !poem))
  const saveDisabled =
    savedCards.has(activeSaveKey) || (type === 'poem' && (poemLoading || !poem))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '32px 24px 2px' }}>
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

        <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#777', textTransform: 'uppercase', textAlign: 'center' }}>
          Step 2 of 2
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px', letterSpacing: '-0.3px', textAlign: 'center' }}>
          Your <span style={{ color: themeColor }}>moment</span>
        </div>
      </div>

      {/* Preview — square, NO border-radius */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 14px' }}>
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: themeColor,
          fontWeight: 600,
          marginTop: '0',
          letterSpacing: '0.01em',
        }}>
          {selected.length} tracks · {condition.scene} · {condition.mood}
          {(condition.isMixed.scene || condition.isMixed.mood) && (
            <span style={{ marginLeft: '6px' }}>(mixed)</span>
          )}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          marginBottom: '11px',
        }}>
          <span style={{
            textAlign: 'center',
            color: themeColor,
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {activeCardLabel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            {CARD_CHOICES.map(choice => {
              const active = choice.id === type
              return (
                <button
                  key={choice.id}
                  onClick={() => switchCard(choice.id)}
                  aria-label={`Show ${choice.label} card`}
                  style={{
                    width: active ? 8 : 6,
                    height: active ? 8 : 6,
                    padding: 0,
                    border: 'none',
                    borderRadius: '50%',
                    background: themeColor,
                    opacity: active ? 1 : 0.28,
                    cursor: 'pointer',
                  }}
                />
              )
            })}
          </div>
        </div>

        <div style={{
          width: PREVIEW_W,
          height: PREVIEW_W,
          margin: '4px auto 0',
          overflow: 'hidden',
          boxShadow: '0 14px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)',
          position: 'relative',
          background: '#fff',
          touchAction: 'pan-y',
          cursor: 'grab',
          animation: 'geomelody-card-drift 7.5s ease-in-out infinite',
          transformOrigin: '50% 58%',
          // intentionally no border-radius
        }}
          ref={previewCardRef}
          onPointerDown={(e) => { swipeStartXRef.current = e.clientX }}
          onPointerUp={(e) => finishSwipe(e.clientX)}
          onPointerCancel={() => { swipeStartXRef.current = null }}
        >
          <div
            key={`${type}-${flipNonce}`}
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              transformOrigin: flipDirection === 1 ? '100% 50%' : '0% 50%',
              animation: flipNonce === 0
                ? 'none'
                : `${flipDirection === 1 ? 'geomelody-page-flip-next' : 'geomelody-page-flip-prev'} 520ms cubic-bezier(0.2, 0.72, 0.18, 1)`,
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: CARD_SIZE, height: CARD_SIZE,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
              backfaceVisibility: 'hidden',
            }}>
              {ActiveCard}
            </div>
          </div>
        </div>

        {type === 'poem' && poemLoading && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#aaa' }}>
            Writing your poem…
          </div>
        )}
        {type === 'poem' && poemError && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#e24b4a' }}>
            Poem failed: {poemError}
          </div>
        )}
        <div style={{
          marginTop: '14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            color: '#aaa',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Layout
          </span>
          {[1, 2, 3].map(n => {
            const layout = n as CardLayout
            const active = activeLayout === layout
            return (
              <button
                key={layout}
                onClick={() => setLayouts(prev => ({ ...prev, [type]: layout }))}
                aria-label={`Use layout ${layout}`}
                style={{
                  width: 28,
                  height: 24,
                  padding: 0,
                  border: 'none',
                  borderRadius: 0,
                  background: active ? themeColor : 'transparent',
                  color: active ? '#fff' : themeColor,
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                }}
              >
                {layout}
              </button>
            )
          })}
        </div>
        {onOpenGallery && (
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              onClick={onOpenGallery}
              style={{
                background: 'none', border: 'none',
                color: '#888', fontSize: '12px',
                cursor: 'pointer', fontFamily: 'inherit',
                textDecoration: 'underline', textUnderlineOffset: '3px',
              }}
            >
              Open your gallery →
            </button>
          </div>
        )}
      </div>

      {/* Action buttons: Save | Download */}
      <div style={{
        padding: '12px 24px 16px',
        borderTop: '0.5px solid #f0f0f0',
        background: '#fafaf8',
        display: 'flex', gap: '8px',
      }}>
        <button
          ref={saveButtonRef}
          onClick={handleSave}
          disabled={saveDisabled}
          style={{
            flex: 1, padding: '14px',
            background: '#fff',
            color: savedCards.has(activeSaveKey) ? '#f97316' : '#111',
            border: savedCards.has(activeSaveKey) ? '1.5px solid #f97316' : '1px solid #111',
            borderRadius: 0,
            fontSize: '13px', fontWeight: 600,
            cursor: saveDisabled ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.04em',
            opacity: saveDisabled && !savedCards.has(activeSaveKey) ? 0.4 : 1,
          }}
        >
          {savedCards.has(activeSaveKey) ? '✓ In Gallery' : 'Save'}
        </button>
        <button
          onClick={handleDownload}
          disabled={downloadDisabled}
          style={{
            flex: 1.4, padding: '14px',
            background: downloadDisabled ? '#ddd' : '#000',
            color: '#fff', border: 'none', borderRadius: 0,
            fontSize: '13px', fontWeight: 600,
            cursor: downloadDisabled ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.04em',
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading
            ? 'Saving…'
            : type === 'poem' && poemLoading
              ? 'Waiting for poem…'
              : 'Download PNG'}
        </button>
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
          {ActiveCard}
        </div>
      </div>

      {saveFly && (
        <div
          key={saveFly.key}
          aria-hidden
          style={{
            position: 'fixed',
            left: saveFly.left,
            top: saveFly.top,
            width: saveFly.width,
            height: saveFly.height,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 18px 46px rgba(0,0,0,0.18)',
            pointerEvents: 'none',
            zIndex: 80,
            transformOrigin: '50% 50%',
            animation: 'geomelody-save-into-button 560ms cubic-bezier(0.18, 0.82, 0.2, 1) forwards',
            ['--gm-save-dx' as string]: `${saveFly.dx}px`,
            ['--gm-save-dy' as string]: `${saveFly.dy}px`,
            ['--gm-save-scale' as string]: saveFly.scale,
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CARD_SIZE,
            height: CARD_SIZE,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}>
            {ActiveCard}
          </div>
        </div>
      )}

      <style>{`
        @keyframes geomelody-card-drift {
          0%, 64%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          68% { transform: translate3d(-1.2px, 0.6px, 0) rotate(-0.35deg); }
          72% { transform: translate3d(1px, -0.4px, 0) rotate(0.28deg); }
          76% { transform: translate3d(-0.6px, 0.2px, 0) rotate(-0.16deg); }
          80% { transform: translate3d(0.4px, 0, 0) rotate(0.1deg); }
        }
        @keyframes geomelody-page-flip-next {
          0% { opacity: 0.78; transform: perspective(900px) rotateY(-72deg) translateX(18px); }
          58% { opacity: 1; transform: perspective(900px) rotateY(8deg) translateX(-2px); }
          100% { opacity: 1; transform: perspective(900px) rotateY(0deg) translateX(0); }
        }
        @keyframes geomelody-page-flip-prev {
          0% { opacity: 0.78; transform: perspective(900px) rotateY(72deg) translateX(-18px); }
          58% { opacity: 1; transform: perspective(900px) rotateY(-8deg) translateX(2px); }
          100% { opacity: 1; transform: perspective(900px) rotateY(0deg) translateX(0); }
        }
        @keyframes geomelody-save-into-button {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          55% {
            opacity: 0.92;
            transform: translate3d(
              calc(var(--gm-save-dx) * 0.78),
              calc(var(--gm-save-dy) * 0.78),
              0
            ) scale(calc(var(--gm-save-scale) * 1.45)) rotate(-3deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--gm-save-dx), var(--gm-save-dy), 0) scale(var(--gm-save-scale)) rotate(-6deg);
          }
        }
      `}</style>
    </div>
  )
}
