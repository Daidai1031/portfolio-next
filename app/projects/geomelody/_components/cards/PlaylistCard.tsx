// app/projects/geomelody/_components/cards/PlaylistCard.tsx
'use client'

import type { CuratedTrack } from '../SelectStep'
import type { AggregateCondition } from '../../_lib/cardHelpers'
import { cleanTitle, formatDate } from '../../_lib/cardHelpers'
import type { Palette } from '../../_lib/palette'
import type { Poem } from '../../_lib/poem'

interface Props {
  selected: CuratedTrack[]
  condition: AggregateCondition
  palette: Palette
  poem: Poem | null
  date: number
}

const SANS = "var(--font-caveat), 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"

export default function PlaylistCard({ selected, condition, palette, date }: Props) {
  const covers = selected.filter(t => t.image).slice(0, 9)
  const missingCount = Math.max(0, selected.length - covers.length)

  return (
    <div style={{
      width: 1080,
      height: 1080,
      background: palette.bg2,
      color: palette.fg,
      fontFamily: SANS,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Hero: cover collage + condition block */}
      <div style={{
        padding: '60px 60px 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '30px',
      }}>
        {/* Cover mosaic */}
        <div style={{
          width: '580px',
          height: '580px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
          gap: '8px',
          overflow: 'hidden',
        }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundImage: covers[i]?.image ? `url(${covers[i].image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: palette.surface,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {!covers[i] && i === covers.length && missingCount > 0 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: palette.fgSoft,
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                }}>
                  +{missingCount}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right column: scene/mood title block */}
        <div style={{ flex: 1, paddingTop: '12px' }}>
          <div style={{
            fontSize: '17px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: palette.fgSoft,
            fontWeight: 700,
          }}>
            {formatDate(date)}
          </div>
          <div style={{
            fontSize: '60px',
            fontWeight: 800,
            color: palette.fg,
            marginTop: '14px',
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}>
            {condition.scene}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 500,
            color: palette.accent,
            marginTop: '6px',
            letterSpacing: '-0.005em',
          }}>
            {condition.mood} · {condition.activity}
          </div>
          <div style={{
            fontSize: '13px',
            color: palette.fgSoft,
            marginTop: '24px',
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}>
            {formatDate(date)} · {selected.length} TRACKS
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '90px',
        left: '90px',
        right: '90px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingTop: '20px',
        borderTop: `1px solid ${palette.divider}`,
      }}>
        <div style={{
          fontSize: '14px',
          color: palette.fgSoft,
          letterSpacing: '0.18em',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}>
          HR {Math.round(condition.hr * 100)} · Noise {Math.round(condition.noise * 100)}
        </div>
        <div style={{
          fontSize: '14px',
          color: palette.fgSoft,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          {condition.isMixed.scene ? 'Mixed Scene' : 'Single Scene'}
        </div>
      </div>
    </div>
  )
}