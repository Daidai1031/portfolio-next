// app/projects/geomelody/_lib/cardStore.ts
//
// Server-side card storage. The API surface is intentionally tiny so the
// implementation can be swapped (Vercel KV / Postgres / Supabase) without
// touching any callers.
//
// Current impl: in-memory map, attached to globalThis so it survives
// Next.js dev HMR. This means:
//   - Cards DO NOT survive a server restart.
//   - In a multi-instance deploy (e.g. Vercel serverless), each instance
//     has its own store and cards will appear/disappear depending on
//     which instance handles the request.
// Both limitations go away the moment this is pointed at a real store.

import type { SavedCard } from './gallery'

type Store = {
  cards: Map<string, SavedCard>
  userIndex: Map<string, string[]> // userId -> [cardId] (newest first)
}

declare global {
  // eslint-disable-next-line no-var
  var __geomelodyCardStore__: Store | undefined
}

function getStore(): Store {
  if (!globalThis.__geomelodyCardStore__) {
    globalThis.__geomelodyCardStore__ = {
      cards: new Map(),
      userIndex: new Map(),
    }
  }
  return globalThis.__geomelodyCardStore__
}

export async function getCard(id: string): Promise<SavedCard | null> {
  return getStore().cards.get(id) ?? null
}

export async function putCard(card: SavedCard): Promise<SavedCard> {
  const store = getStore()
  store.cards.set(card.id, card)
  const ids = store.userIndex.get(card.userId) ?? []
  if (!ids.includes(card.id)) {
    store.userIndex.set(card.userId, [card.id, ...ids])
  }
  return card
}

export async function listUserCards(userId: string): Promise<SavedCard[]> {
  const store = getStore()
  const ids = store.userIndex.get(userId) ?? []
  return ids
    .map(id => store.cards.get(id))
    .filter((c): c is SavedCard => Boolean(c))
}

export async function deleteCard(userId: string, cardId: string): Promise<boolean> {
  const store = getStore()
  const card = store.cards.get(cardId)
  if (!card || card.userId !== userId) return false
  store.cards.delete(cardId)
  const ids = store.userIndex.get(userId) ?? []
  store.userIndex.set(userId, ids.filter(id => id !== cardId))
  return true
}