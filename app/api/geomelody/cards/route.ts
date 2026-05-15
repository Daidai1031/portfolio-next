// app/api/geomelody/cards/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listUserCards, putCard } from '../../../projects/geomelody/_lib/cardStore'
import type { SavedCard } from '../../../projects/geomelody/_lib/gallery'

export const runtime = 'nodejs'

function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

// Create a card. Body is the SavedCard shape without id/createdAt — those
// are assigned server-side so clients can't fight over collisions.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<SavedCard, 'id' | 'createdAt'>
    if (!body.userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    if (!Array.isArray(body.selected) || body.selected.length === 0) {
      return NextResponse.json({ error: 'selected[] required' }, { status: 400 })
    }
    const card: SavedCard = { ...body, id: uuid(), createdAt: Date.now() }
    await putCard(card)
    return NextResponse.json(card)
  } catch (e: any) {
    console.error('[api/cards] POST failed:', e)
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}

// List a user's cards. userId is required as a query param.
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }
  const cards = await listUserCards(userId)
  return NextResponse.json({ cards })
}