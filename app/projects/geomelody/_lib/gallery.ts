// app/projects/geomelody/_lib/gallery.ts
//
// Cards now live on the server (so they can be shared by URL and accessed
// across devices). localStorage is kept as a local cache for instant first
// paint — Gallery renders cached cards immediately, then revalidates from
// the server in the background.
//
// The SavedCard shape is unchanged from the previous localStorage-only
// version, so cards saved before this change continue to deserialize
// correctly. They just live in cache only until next save migrates them.

import type { CuratedTrack } from '../_components/SelectStep'
import type { AggregateCondition } from './cardHelpers'
import type { Poem } from './poem'

export type CardType = 'poem' | 'cloud'
export type CardLayout = 1 | 2 | 3

export interface SavedCard {
  id: string
  userId: string
  userName: string
  cardType: CardType
  layout: CardLayout
  selected: CuratedTrack[]
  poem: Poem | null
  condition: AggregateCondition
  scene: string
  mood: string
  createdAt: number
}

const CACHE_PREFIX = 'geomelody:gallery:'
const cacheKey = (userId: string) => `${CACHE_PREFIX}${userId}`

// ── Local cache (instant first paint) ───────────────────
function readCache(userId: string): SavedCard[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedCard[]) : []
  } catch {
    return []
  }
}

function writeCache(userId: string, cards: SavedCard[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(cards))
  } catch (e) {
    console.warn('[gallery] cache write failed (quota?):', e)
  }
}

export function getCachedCards(userId: string): SavedCard[] {
  return readCache(userId)
}

// ── Remote (source of truth) ────────────────────────────
export async function fetchUserCards(userId: string): Promise<SavedCard[]> {
  if (!userId) return []
  const res = await fetch(
    `/api/geomelody/cards?userId=${encodeURIComponent(userId)}`,
    { cache: 'no-store' },
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as { cards: SavedCard[] }
  // Sort newest-first defensively; server already returns this way.
  const cards = [...data.cards].sort((a, b) => b.createdAt - a.createdAt)
  writeCache(userId, cards)
  return cards
}

// Public: fetch any card by id. Used by /projects/geomelody/c/[id].
export async function fetchCardById(id: string): Promise<SavedCard | null> {
  const res = await fetch(`/api/geomelody/cards/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as SavedCard
}

export async function saveCard(
  card: Omit<SavedCard, 'id' | 'createdAt'>,
): Promise<SavedCard> {
  if (!card.userId) {
    // Defensive — keep the same error contract callers were already
    // catching. Saving under an empty userId would orphan the card.
    throw new Error('Cannot save card — Spotify user not loaded yet. Try again in a moment.')
  }
  const res = await fetch('/api/geomelody/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(txt || `HTTP ${res.status}`)
  }
  const saved = (await res.json()) as SavedCard
  // Keep cache in sync so Gallery shows it instantly on the way back.
  const list = readCache(card.userId).filter(c => c.id !== saved.id)
  writeCache(card.userId, [saved, ...list])
  return saved
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  const res = await fetch(
    `/api/geomelody/cards/${encodeURIComponent(cardId)}?userId=${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  )
  if (!res.ok && res.status !== 404) {
    throw new Error(`HTTP ${res.status}`)
  }
  const list = readCache(userId).filter(c => c.id !== cardId)
  writeCache(userId, list)
}

// ── Share URL helper ────────────────────────────────────
export function cardShareUrl(cardId: string): string {
  if (typeof window === 'undefined') return `/projects/geomelody/c/${cardId}`
  return `${window.location.origin}/projects/geomelody/c/${cardId}`
}