// app/projects/geomelody/_lib/wordCloud.ts
//
// Lightweight spiral word cloud layout. No d3 dependency.
// Place largest first at center, then spiral outward checking
// bounding-box collisions. Shrink font and retry if no spot found.

export interface WordCloudInput {
  text: string
  weight: number       // any positive number; relative weights matter
  featured?: boolean   // gets bigger font + accent color
}

export interface PlacedWord {
  text: string
  x: number            // center x in target coord system
  y: number            // center y
  fontSize: number     // px
  rotation: 0 | -90    // mostly horizontal, occasional vertical
  width: number        // visual bbox width after rotation
  height: number       // visual bbox height after rotation
  featured: boolean
}

interface BBox { x: number; y: number; w: number; h: number }

function bboxesOverlap(a: BBox, b: BBox): boolean {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  )
}

// Approximate text size. Without canvas measurement we estimate
// from font size + char count. Tuned for SF Pro Display 600–800 weight.
function measureText(text: string, fontSize: number): { w: number; h: number } {
  return {
    w: text.length * fontSize * 0.55,
    h: fontSize * 1.05,
  }
}

export function layoutWordCloud(
  words: WordCloudInput[],
  width: number,
  height: number,
  opts: {
    minFont?: number
    maxFont?: number
    padding?: number
    allowVertical?: boolean
    seed?: number
  } = {},
): PlacedWord[] {
  const minFont = opts.minFont ?? 22
  const maxFont = opts.maxFont ?? 110
  const padding = opts.padding ?? 8
  const allowVertical = opts.allowVertical ?? true

  // Deterministic pseudo-random for reproducibility within a session
  let seed = opts.seed ?? 1
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  // Sort: featured first, then heaviest first
  const sorted = [...words].sort((a, b) => {
    if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1
    return b.weight - a.weight
  })
  if (sorted.length === 0) return []

  const maxW = Math.max(...sorted.map(w => w.weight))
  const minW = Math.min(...sorted.map(w => w.weight))
  const featuredCount = sorted.filter(w => w.featured).length

  const placed: PlacedWord[] = []
  const placedBBoxes: BBox[] = []
  const cx = width / 2
  const cy = height / 2

  for (let i = 0; i < sorted.length; i++) {
    const w = sorted[i]
    const t = maxW === minW ? 0.6 : (w.weight - minW) / (maxW - minW)
    let fontSize = minFont + t * (maxFont - minFont)
    if (w.featured) fontSize *= 1.18
    // Add small jitter so equal-weight words don't all match
    fontSize *= 0.9 + rand() * 0.2

    let placedThis = false

    for (let shrink = 0; shrink < 5 && !placedThis; shrink++) {
      const fs = fontSize * Math.pow(0.85, shrink)
      // First couple are always horizontal; later ones may rotate
      const useVertical = allowVertical && i > 2 && rand() < 0.18
      const m = measureText(w.text, fs)
      const wW = useVertical ? m.h : m.w
      const wH = useVertical ? m.w : m.h

      // Archimedean spiral search
      const step = 0.3
      for (let theta = 0; theta < Math.PI * 30; theta += step) {
        const r = (i === 0) ? 0 : (4 + theta * 6)
        const x = cx + r * Math.cos(theta)
        const y = cy + r * Math.sin(theta)

        const bbox: BBox = {
          x: x - wW / 2 - padding,
          y: y - wH / 2 - padding,
          w: wW + padding * 2,
          h: wH + padding * 2,
        }
        // Stay inside container
        if (bbox.x < 8 || bbox.y < 8 || bbox.x + bbox.w > width - 8 || bbox.y + bbox.h > height - 8) {
          continue
        }
        if (placedBBoxes.some(p => bboxesOverlap(bbox, p))) continue

        placed.push({
          text: w.text,
          x, y,
          fontSize: fs,
          rotation: useVertical ? -90 : 0,
          width: wW,
          height: wH,
          featured: !!w.featured,
        })
        placedBBoxes.push(bbox)
        placedThis = true
        break
      }
      if (i === 0) break // no need to retry the centerpiece
    }
  }

  // Tell caller how many we used (helps to detect crowded clouds)
  return placed
}