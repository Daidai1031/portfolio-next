// app/projects/geomelody/_components/cards/WordCloudCard.tsx
'use client'

import { useMemo } from 'react'
import type { CuratedTrack } from '../SelectStep'
import type { AggregateCondition } from '../../_lib/cardHelpers'
import { cleanTitle, formatDate } from '../../_lib/cardHelpers'
import type { Palette } from '../../_lib/palette'
import type { Poem } from '../../_lib/poem'
import { layoutWordCloud } from '../../_lib/wordCloud'
import { getTimeOfDay } from '../../_lib/timeOfDay'
import type { CardLayout } from '../../_lib/gallery'

interface Props {
  selected: CuratedTrack[]
  condition: AggregateCondition
  palette: Palette
  poem: Poem | null    // optional — featured titles get emphasized in the cloud
  date: number
  userName?: string
  layout?: CardLayout
}

const SERIF = "var(--font-cormorant-garamond), 'Cormorant Garamond', Georgia, serif"
const HAND  = "'Caveat', 'Bradley Hand', 'Comic Sans MS', cursive"
const SANS  = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"

const CLOUD_LAYOUTS: Record<CardLayout, {
  heroTop: number
  sceneSize: number
  phraseSize: number
  phraseGap: number
  dividerTop: number
  cloudTop: number
  cloudLeft: number
  cloudWidth: number
  cloudHeight: number
  minFont: number
  maxFont: number
  padding: number
  allowVertical: boolean
  bottomDividerTop: number
}> = {
  1: {
    heroTop: 240, sceneSize: 96, phraseSize: 50, phraseGap: 18,
    dividerTop: 462, cloudTop: 500, cloudLeft: 130, cloudWidth: 820, cloudHeight: 380,
    minFont: 22, maxFont: 78, padding: 8, allowVertical: true, bottomDividerTop: 890,
  },
  2: {
    heroTop: 222, sceneSize: 78, phraseSize: 42, phraseGap: 14,
    dividerTop: 410, cloudTop: 456, cloudLeft: 110, cloudWidth: 860, cloudHeight: 430,
    minFont: 18, maxFont: 58, padding: 6, allowVertical: true, bottomDividerTop: 890,
  },
  3: {
    heroTop: 226, sceneSize: 72, phraseSize: 40, phraseGap: 12,
    dividerTop: 420, cloudTop: 488, cloudLeft: 120, cloudWidth: 840, cloudHeight: 360,
    minFont: 30, maxFont: 108, padding: 10, allowVertical: false, bottomDividerTop: 890,
  },
}

export default function WordCloudCard({
  selected, condition, palette, poem, date, userName, layout = 1,
}: Props) {
  const tod = getTimeOfDay(new Date(date))
  const l = CLOUD_LAYOUTS[layout]

  const words = useMemo(() => {
    const counts = new Map<string, number>()
    selected.forEach(t => {
      const c = cleanTitle(t.name)
      if (c.length === 0) return
      counts.set(c, (counts.get(c) ?? 0) + 1)
    })
    const featuredSet = new Set(poem?.featured_titles ?? [])
    return Array.from(counts.entries()).map(([text, weight]) => ({
      text, weight, featured: featuredSet.has(text),
    }))
  }, [selected, poem])

  const placed = useMemo(
    () => layoutWordCloud(words, l.cloudWidth, l.cloudHeight, {
      minFont: l.minFont,
      maxFont: l.maxFont,
      padding: l.padding,
      allowVertical: l.allowVertical,
      seed: words.length + layout * 17,
    }),
    [words, l, layout]
  )

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
        <filter id="grain-cloud">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-cloud)" />
      </svg>

      {/* Bookmark frame */}
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

      {/* Top medallion */}
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

      {/* Hero */}
      <div style={{
        position: 'absolute', top: l.heroTop, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: l.sceneSize, fontWeight: 500, lineHeight: 1,
          color: palette.fg, letterSpacing: '-0.02em',
        }}>
          {condition.scene}
        </div>
        <div style={{
          fontFamily: HAND, fontSize: l.phraseSize,
          color: palette.accent, marginTop: l.phraseGap, lineHeight: 1,
        }}>
          {tod.phrase}
        </div>
      </div>

      {/* Top divider */}
      <div style={{
        position: 'absolute', top: l.dividerTop, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 90, height: 1, background: palette.divider }} />
        <span style={{ color: palette.accent, fontSize: 18, lineHeight: 1 }}>✦</span>
        <div style={{ width: 90, height: 1, background: palette.divider }} />
      </div>

      {/* Word cloud area */}
      <svg
        width={l.cloudWidth} height={l.cloudHeight}
        viewBox={`0 0 ${l.cloudWidth} ${l.cloudHeight}`}
        style={{ position: 'absolute', top: l.cloudTop, left: l.cloudLeft }}
      >
        {placed.map((w, i) => {
          const sizeT = Math.max(0, Math.min(1, (w.fontSize - 22) / (78 - 22)))
          const alpha = w.featured ? 1 : 0.5 + 0.45 * sizeT
          const transform = w.rotation !== 0 ? `rotate(${w.rotation} ${w.x} ${w.y})` : undefined
          return (
            <text
              key={i}
              x={w.x} y={w.y}
              fontSize={w.fontSize}
              fontFamily={HAND}
              fontWeight={w.featured ? 700 : 500}
              fill={w.featured ? palette.accent : palette.fg}
              opacity={alpha}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={transform}
            >
              {w.text}
            </text>
          )
        })}
      </svg>

      {placed.length < 3 && (
        <div style={{
          position: 'absolute', top: 670, left: 0, right: 0,
          textAlign: 'center', fontFamily: HAND, fontSize: 32,
          color: palette.fgSoft,
        }}>
          (not enough songs to fill the sky)
        </div>
      )}

      {/* Bottom divider */}
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
          fontFamily: SERIF, fontStyle: 'italic', fontSize: 26,
          color: palette.fgSoft, letterSpacing: '0.1em', marginBottom: 6,
        }}>
          — {condition.mood.toLowerCase()} —
        </div>
      </div>

      {/* Bottom strip */}
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
