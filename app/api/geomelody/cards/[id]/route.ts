// app/api/geomelody/cards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { deleteCard, getCard } from '../../../../projects/geomelody/_lib/cardStore'

export const runtime = 'nodejs'

// Public read — anyone with the URL can view a card. This is the whole
// point: cards are shareable.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const card = await getCard(id)
  if (!card) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(card)
}

// Delete — only the owner. Stub auth via ?userId=… ; replace with a real
// session check once you wire backend auth.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }
  const ok = await deleteCard(userId, id)
  if (!ok) {
    return NextResponse.json({ error: 'not found or not owner' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}