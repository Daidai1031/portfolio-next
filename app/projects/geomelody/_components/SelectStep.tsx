// app/projects/geomelody/_components/SelectStep.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Track } from '../_lib/api'

// ── Type exported here so page.tsx can reuse ────────────
export interface CuratedTrack extends Track {
  reason?: string
  curatedAt: number
  context: { scene: string; mood: string; activity: string; hr: number; noise: number }
}

interface Props {
  curated: CuratedTrack[]
  onCancel: () => void
  onConfirm: (selectedIds: string[]) => void
}

export default function SelectStep({ curated, onCancel, onConfirm }: Props) {
  // Default: everything selected
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(curated.map(t => t.id))
  )

  const allSelected = curated.length > 0 && selected.size === curated.length
  const noneSelected = selected.size === 0
  const canGenerate = selected.size >= 3

  function toggle(id: string) {
    setSelected(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(curated.map(t => t.id)))
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '8px 24px 12px' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none', color: '#aaa', fontSize: '13px',
            cursor: 'pointer', padding: '6px 0 12px', display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'inherit',
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
          Back to recommendations
        </button>

        <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#bbb', textTransform: 'uppercase' }}>
          Step 1 of 2
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px', letterSpacing: '-0.3px' }}>
          Pick songs <span style={{ color: '#f97316' }}>for the card</span>
        </div>
      </div>

      {/* Select all bar */}
      <div
        onClick={toggleAll}
        style={{
          margin: '0',
          padding: '10px 24px',
          background: '#f4f1ec',
          display: 'flex', alignItems: 'center', gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <CheckBox checked={allSelected} indeterminate={!allSelected && !noneSelected} />
        <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#111' }}>
          {allSelected ? 'Deselect all' : 'Select all'}
        </div>
        <div style={{
          fontSize: '11px',
          color: canGenerate ? '#f97316' : '#888',
          fontWeight: canGenerate ? 700 : 500,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {selected.size} / {curated.length}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>
        {curated.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#aaa', fontSize: '13px', lineHeight: 1.5 }}>
            You haven&apos;t added any songs to your queue yet.<br />
            Go back and tap the <strong style={{ color: '#f97316' }}>+</strong> on tracks you love.
          </div>
        ) : (
          curated.map(track => {
            const isSel = selected.has(track.id)
            return (
              <div
                key={track.id}
                onClick={() => toggle(track.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  background: isSel ? '#fff7f0' : 'transparent',
                  borderBottom: '0.5px solid #f0f0f0',
                  transition: 'background 0.12s',
                }}
              >
                <CheckBox checked={isSel} />
                {track.image
                  ? <Image src={track.image} alt={track.name} width={36} height={36}
                      style={{
                        borderRadius: '4px', objectFit: 'cover', flexShrink: 0,
                        filter: isSel ? 'none' : 'grayscale(0.5)',
                      }} />
                  : <div style={{ width: 36, height: 36, borderRadius: '4px', background: '#f0f0f0', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600, color: '#111',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {track.name}
                  </div>
                  <div style={{
                    fontSize: '11px', color: '#aaa', marginTop: '1px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {track.artist}
                  </div>
                </div>
                <span style={{
                  flexShrink: 0,
                  padding: '3px 7px',
                  borderRadius: '3px',
                  background: '#f4f1ec',
                  color: '#666',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {track.context.scene}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Generate button */}
      <div style={{ padding: '12px 24px 16px', borderTop: '0.5px solid #f0f0f0', background: '#fafaf8' }}>
        <button
          onClick={() => canGenerate && onConfirm(Array.from(selected))}
          disabled={!canGenerate}
          style={{
            width: '100%', padding: '14px',
            background: canGenerate ? '#000' : '#ddd',
            color: '#fff', border: 'none', borderRadius: 0,
            fontSize: '14px', fontWeight: 600,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: '0.02em',
          }}
        >
          {canGenerate
            ? `Generate (${selected.size}) →`
            : `Pick at least 3 songs (${selected.size}/3)`}
        </button>
      </div>
    </div>
  )
}

// ── Inline checkbox component ───────────────────────────
function CheckBox({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '4px',
      border: (checked || indeterminate) ? '1.5px solid #f97316' : '1.5px solid #ccc',
      background: checked ? '#f97316' : '#fff',
      flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }}>
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {indeterminate && !checked && (
        <div style={{ width: 8, height: 1.5, background: '#f97316' }} />
      )}
    </div>
  )
}
