// app/projects/geomelody/_components/cards/PoemCard.tsx
'use client'

import type { CuratedTrack } from '../SelectStep'
import type { AggregateCondition } from '../../_lib/cardHelpers'
import { formatDate } from '../../_lib/cardHelpers'
import type { Palette } from '../../_lib/palette'
import type { Poem } from '../../_lib/poem'
import { getTimeOfDay } from '../../_lib/timeOfDay'
import type { CardLayout } from '../../_lib/gallery'

interface Props {
  selected: CuratedTrack[]
  condition: AggregateCondition
  palette: Palette
  poem: Poem | null
  date: number
  userName?: string
  layout?: CardLayout
  loading?: boolean
  error?: string | null
}

const SERIF = "var(--font-cormorant-garamond), 'Cormorant Garamond', Georgia, serif"
const HAND  = "'Caveat', 'Bradley Hand', 'Comic Sans MS', cursive"
const SANS  = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"

// Auto-size poem font so 5/6/7 lines all fit the same body area.
function poemSize(lineCount: number, layout: CardLayout): { fontSize: number; lineHeight: number } {
  const scale = layout === 2 ? 0.88 : layout === 3 ? 1.08 : 1
  if (lineCount >= 7) return { fontSize: 46 * scale, lineHeight: layout === 3 ? 1.16 : 1.22 }
  if (lineCount === 6) return { fontSize: 52 * scale, lineHeight: layout === 3 ? 1.2 : 1.26 }
  return                   { fontSize: 60 * scale, lineHeight: layout === 3 ? 1.24 : 1.32 }
}

const POEM_LAYOUTS: Record<CardLayout, {
  heroTop: number
  sceneSize: number
  phraseSize: number
  phraseGap: number
  heroLeft: number
  heroRight: number
  heroAlign: 'center' | 'left'
  dividerTop: number
  bodyTop: number
  bodyLeft: number
  bodyRight: number
  bodyHeight: number
  alignItems: 'center' | 'flex-start'
  textAlign: 'center' | 'left'
  bottomDividerTop: number
}> = {
  1: {
    heroTop: 240, sceneSize: 96, phraseSize: 50, phraseGap: 18,
    heroLeft: 0, heroRight: 0, heroAlign: 'center',
    dividerTop: 462, bodyTop: 510, bodyLeft: 130, bodyRight: 130, bodyHeight: 360,
    alignItems: 'center', textAlign: 'center', bottomDividerTop: 890,
  },
  2: {
    heroTop: 226, sceneSize: 82, phraseSize: 44, phraseGap: 14,
    heroLeft: 150, heroRight: 150, heroAlign: 'left',
    dividerTop: 392, bodyTop: 432, bodyLeft: 150, bodyRight: 150, bodyHeight: 430,
    alignItems: 'flex-start', textAlign: 'left', bottomDividerTop: 890,
  },
  3: {
    heroTop: 218, sceneSize: 72, phraseSize: 40, phraseGap: 12,
    heroLeft: 0, heroRight: 0, heroAlign: 'center',
    dividerTop: 398, bodyTop: 448, bodyLeft: 118, bodyRight: 118, bodyHeight: 430,
    alignItems: 'center', textAlign: 'center', bottomDividerTop: 890,
  },
}

export default function PoemCard({
  selected, condition, palette, poem, date, userName,
  layout = 1, loading, error,
}: Props) {
  const tod = getTimeOfDay(new Date(date))
  const l = POEM_LAYOUTS[layout]
  const ps = poemSize(poem?.lines.length ?? 5, layout)

  return (
    <div style={{
      width: 1080,
      height: 1080,
      background: `linear-gradient(165deg, ${palette.bg1} 0%, ${palette.bg2} 100%)`,
      color: palette.fg,
      fontFamily: SANS,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle paper grain */}
      <svg aria-hidden width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'multiply', pointerEvents: 'none' }}>
        <filter id="grain-poem">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-poem)" />
      </svg>

      {/* Bookmark frame: outer hairline + inner hairline with breathing space */}
      <div style={{
        position: 'absolute', inset: 60,
        border: `1px solid ${palette.divider}`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 78,
        border: `1px solid ${palette.divider}`,
        opacity: 0.55,
        pointerEvents: 'none',
      }} />

      {/* Top centered medallion — the "stamp" */}
      <div style={{
        position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)',
        width: 56, height: 56, borderRadius: '50%',
        border: `1.5px solid ${palette.accent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: palette.bg1,
      }}>
        <span style={{ color: palette.accent, fontSize: 22, lineHeight: 1 }}>✦</span>
      </div>

      {/* Brand watermark */}
      <div style={{
        position: 'absolute', top: 106, left: 112, maxWidth: 360,
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 0.92,
          color: palette.fg,
          opacity: 0.2,
          letterSpacing: 0,
          fontVariantLigatures: 'common-ligatures',
        }}>
          GeoMelody
        </div>
        <div style={{
          marginTop: 10,
          fontFamily: SANS,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: palette.fgSoft,
          fontWeight: 700,
          opacity: 0.75,
        }}>
          {formatDate(date)}
        </div>
      </div>

      {/* Hero: scene + handwritten time-of-day phrase */}
      <div style={{
        position: 'absolute', top: l.heroTop, left: l.heroLeft, right: l.heroRight, textAlign: l.heroAlign,
      }}>
        <div style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: l.sceneSize,
          fontWeight: 500,
          lineHeight: 1,
          color: palette.fg,
          letterSpacing: '-0.02em',
        }}>
          {condition.scene}
        </div>
        <div style={{
          fontFamily: HAND,
          fontSize: l.phraseSize,
          color: palette.accent,
          marginTop: l.phraseGap,
          lineHeight: 1,
        }}>
          {tod.phrase}
        </div>
      </div>

      {/* Top divider with ornament */}
      <div style={{
        position: 'absolute', top: l.dividerTop, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 90, height: 1, background: palette.divider }} />
        <span style={{ color: palette.accent, fontSize: 18, lineHeight: 1 }}>✦</span>
        <div style={{ width: 90, height: 1, background: palette.divider }} />
      </div>

      {/* Poem body */}
      <div style={{
        position: 'absolute',
        top: l.bodyTop, left: l.bodyLeft, right: l.bodyRight, height: l.bodyHeight,
        display: 'flex', flexDirection: 'column',
        alignItems: l.alignItems, justifyContent: 'center',
      }}>
        {loading ? (
          <div style={{ fontFamily: HAND, fontSize: 44, color: palette.fgSoft }}>
            listening to the moment…
          </div>
        ) : error || !poem ? (
          <div style={{
            fontFamily: HAND, fontSize: 36,
            color: palette.fgSoft, textAlign: 'center', lineHeight: 1.4,
          }}>
            could not write a poem this time.<br />
            the songs are still here, waiting.
          </div>
        ) : (
          <div style={{ width: '100%', textAlign: l.textAlign }}>
            {poem.lines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontFamily: HAND,
                  fontSize: ps.fontSize,
                  lineHeight: ps.lineHeight,
                  color: palette.fg,
                  fontWeight: 500,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom divider with ornament */}
      <div style={{
        position: 'absolute', top: l.bottomDividerTop, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 90, height: 1, background: palette.divider }} />
        <span style={{ color: palette.accent, fontSize: 18, lineHeight: 1 }}>✦</span>
        <div style={{ width: 90, height: 1, background: palette.divider }} />
      </div>

      {/* Mood */}
      <div style={{
        position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 26,
          color: palette.fgSoft,
          letterSpacing: '0.1em',
          marginBottom: 6,
        }}>
          — {condition.mood.toLowerCase()} —
        </div>
      </div>

      {/* Bottom strip: tracks + sensor + clock */}
      <div style={{
        position: 'absolute', bottom: 90, left: 130, right: 330,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: SANS, fontSize: 11,
        letterSpacing: '0.28em', color: palette.fgSoft,
        textTransform: 'uppercase', fontWeight: 700,
      }}>
        <span>{selected.length} tracks</span>
        <span>{tod.period} · {tod.hh_mm}</span>
        <span>HR {Math.round(condition.hr * 100)}</span>
      </div>

      {userName && (
        <div style={{
          position: 'absolute',
          right: 130,
          bottom: 76,
          maxWidth: 260,
          textAlign: 'right',
          fontFamily: HAND,
          fontSize: 42,
          lineHeight: 1,
          color: palette.fg,
          fontWeight: 500,
          transform: 'rotate(-2deg)',
          opacity: 0.88,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          ~ {userName}
        </div>
      )}
    </div>
  )
}
