// app/projects/geomelody/_lib/gallery.ts
//
// Per-user localStorage gallery for saved cards. We store the *data* needed
// to re-render a card (selected tracks + condition + poem + metadata),
// not the PNG. This keeps storage small (a few KB per card) and lets us
// regenerate the card visually any time the design evolves.

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
  layout?: CardLayout
  selected: CuratedTrack[]
  poem: Poem | null
  condition: AggregateCondition
  scene: string
  mood: string
  createdAt: number       // timestamp when saved
}

const KEY_PREFIX = 'geomelody:gallery:'

function key(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export function listCards(userId: string): SavedCard[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SavedCard[]
  } catch (e) {
    console.error('[gallery] listCards failed:', e)
    return []
  }
}

export function saveCard(card: Omit<SavedCard, 'id' | 'createdAt'>): SavedCard {
  if (typeof window === 'undefined') {
    throw new Error('saveCard called server-side')
  }
  const full: SavedCard = { ...card, id: uuid(), createdAt: Date.now() }
  const list = listCards(card.userId)
  list.unshift(full)
  try {
    localStorage.setItem(key(card.userId), JSON.stringify(list))
  } catch (e) {
    console.error('[gallery] saveCard failed (likely storage quota):', e)
    throw e
  }
  return full
}

export function deleteCard(userId: string, cardId: string): void {
  if (typeof window === 'undefined') return
  const list = listCards(userId).filter(c => c.id !== cardId)
  try {
    localStorage.setItem(key(userId), JSON.stringify(list))
  } catch (e) {
    console.error('[gallery] deleteCard failed:', e)
  }
}
