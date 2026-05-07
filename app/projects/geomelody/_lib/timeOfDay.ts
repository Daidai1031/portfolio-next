// app/projects/geomelody/_lib/timeOfDay.ts
//
// Bucket a Date into one of six time periods, each with a handwritten phrase
// that pairs well with Caveat. The phrase is what gets printed under the
// scene title on cards (e.g., "in the morning", "at golden hour").

export type Period = 'Dawn' | 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Late Night'

export interface TimeOfDay {
  period: Period
  phrase: string  // handwritten subtitle
  hh_mm: string   // e.g. "8:42"
}

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const h = date.getHours()
  const m = date.getMinutes()
  const hh_mm = `${h}:${String(m).padStart(2, '0')}`

  let period: Period
  let phrase: string

  if (h >= 5 && h < 8) {
    period = 'Dawn'
    phrase = 'in the early hours'
  } else if (h >= 8 && h < 12) {
    period = 'Morning'
    phrase = 'in the morning'
  } else if (h >= 12 && h < 17) {
    period = 'Afternoon'
    phrase = 'in the afternoon'
  } else if (h >= 17 && h < 20) {
    period = 'Evening'
    phrase = 'at golden hour'
  } else if (h >= 20 && h < 24) {
    period = 'Night'
    phrase = 'into the night'
  } else {
    // 0–5
    period = 'Late Night'
    phrase = 'in the small hours'
  }

  return { period, phrase, hh_mm }
}