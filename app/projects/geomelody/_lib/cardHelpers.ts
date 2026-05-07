// app/projects/geomelody/_lib/cardHelpers.ts

// ── Title sanitization ──────────────────────────────────
// Spotify titles are messy: "Song (feat. X) - Remastered 2023 - Bonus Track"
// We strip parentheticals, brackets, "feat.", and common edition suffixes.
export function cleanTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s*-\s*(Remastered|Remaster|Live|Acoustic|Bonus|Deluxe|Edit|Mix|Version|Mono|Stereo|Anniversary|Extended|Single|Album|Original)\b.*$/i, '')
    .replace(/\s*feat\.?\s+.*/i, '')
    .replace(/\s*ft\.?\s+.*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Pure aggregation helpers ────────────────────────────
export function mode<T extends string>(arr: T[]): T {
  if (arr.length === 0) throw new Error('mode of empty array')
  const counts = new Map<T, number>()
  arr.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1))
  let best: T = arr[0]
  let bestCount = 0
  counts.forEach((count, v) => {
    if (count > bestCount) { best = v; bestCount = count }
  })
  return best
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

// ── Aggregate condition over selected tracks ────────────
// Each track was curated under some context; we summarize.
export interface AggregateCondition {
  scene: string
  mood: string
  activity: string
  hr: number      // 0..1
  noise: number   // 0..1
  isMixed: { scene: boolean; mood: boolean; activity: boolean }
}

export function aggregateCondition(
  contexts: { scene: string; mood: string; activity: string; hr: number; noise: number }[]
): AggregateCondition {
  if (contexts.length === 0) {
    return {
      scene: 'Café', mood: 'Focused', activity: 'Still',
      hr: 0.4, noise: 0.2,
      isMixed: { scene: false, mood: false, activity: false },
    }
  }

  const scenes     = contexts.map(c => c.scene)
  const moods      = contexts.map(c => c.mood)
  const activities = contexts.map(c => c.activity)

  return {
    scene:    mode(scenes),
    mood:     mode(moods),
    activity: mode(activities),
    hr:       mean(contexts.map(c => c.hr)),
    noise:    mean(contexts.map(c => c.noise)),
    isMixed: {
      scene:    new Set(scenes).size > 1,
      mood:     new Set(moods).size > 1,
      activity: new Set(activities).size > 1,
    },
  }
}

// ── Date formatting ─────────────────────────────────────
export function formatDate(ts: number): string {
  const d = new Date(ts)
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  const year = d.getFullYear()
  const hour = d.getHours()

  let timeOfDay = ''
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'MORNING'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'AFTERNOON'
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'EVENING'
  } else {
    timeOfDay = 'NIGHT'
  }

  return `${month} ${day}, ${year} · ${timeOfDay}`
}