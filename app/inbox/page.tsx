import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/projects';
import { allLikes, listThoughts, persistent } from '@/lib/feedback';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Inbox', robots: { index: false, follow: false } };

// Author-only view: /inbox?key=<FEEDBACK_ADMIN_KEY>
export default async function Inbox({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const secret = process.env.FEEDBACK_ADMIN_KEY;
  if (!secret || key !== secret) {
    return <main className="p-10 text-sm text-gray-500">Not found.</main>;
  }

  const projects = getAllProjects().map(p => ({ id: `${p.category}/${p.slug}`, title: p.title }));
  const [likes, thoughts] = await Promise.all([
    allLikes(projects.map(p => p.id)),
    listThoughts(),
  ]);
  const title = (id: string) => projects.find(p => p.id === id)?.title ?? id;
  const total = Object.values(likes).reduce((a, b) => a + b, 0);

  return (
    <main className="site-page-gutters mx-auto max-w-5xl py-16 text-sm">
      <h1 className="mb-2 text-3xl font-bold">Inbox</h1>
      {!persistent && (
        <p className="mb-6 rounded bg-amber-50 p-3 text-amber-800">
          No Redis configured — showing in-memory data only (lost on restart).
        </p>
      )}

      <h2 className="mb-3 mt-8 text-base font-bold">Likes · {total} total</h2>
      <ul className="divide-y border-y">
        {projects.map(p => (
          <li key={p.id} className="flex justify-between py-2">
            <span>{p.title}</span>
            <span className="font-semibold tabular-nums text-orange-500">{likes[p.id]}</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-10 text-base font-bold">Thoughts · {thoughts.length}</h2>
      {thoughts.length === 0 && <p className="text-gray-500">Nothing yet.</p>}
      <ul className="space-y-4">
        {thoughts.map(t => (
          <li key={t.id} className="rounded-lg border p-4">
            <div className="mb-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
              <span className="font-semibold text-black">{title(t.project)}</span>
              <span>{new Date(t.createdAt).toLocaleString()}</span>
              <span>{t.isPublic ? 'public' : 'private'}</span>
              {t.contact && <span>reply: {t.contact}</span>}
            </div>
            <p className="whitespace-pre-wrap text-base">{t.text}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
