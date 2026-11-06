import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/projects';
import { addLike, addThought, getLikes, listThoughts } from '@/lib/feedback';

export const runtime = 'nodejs';

const valid = (project: unknown): project is string =>
  typeof project === 'string' &&
  getAllProjects().some(p => `${p.category}/${p.slug}` === project);

export async function GET(req: NextRequest) {
  const project = req.nextUrl.searchParams.get('project');
  if (!valid(project)) return NextResponse.json({ error: 'bad project' }, { status: 400 });
  const [likes, thoughts] = await Promise.all([
    getLikes(project),
    listThoughts({ project, publicOnly: true }),
  ]);
  // Contact info is never exposed publicly.
  return NextResponse.json({
    likes,
    thoughts: thoughts.slice(0, 50).map(({ id, text, createdAt }) => ({ id, text, createdAt })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !valid(body.project)) {
    return NextResponse.json({ error: 'bad project' }, { status: 400 });
  }

  if (body.type === 'like' || body.type === 'unlike') {
    const likes = await addLike(body.project, body.type === 'like' ? 1 : -1);
    return NextResponse.json({ likes });
  }

  if (body.type === 'thought') {
    const text = String(body.text ?? '').trim().slice(0, 2000);
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
    await addThought({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      project: body.project,
      text,
      contact: String(body.contact ?? '').trim().slice(0, 200),
      isPublic: body.isPublic === true,
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'bad type' }, { status: 400 });
}
