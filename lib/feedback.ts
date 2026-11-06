// Likes + "thoughts" storage for project pages.
//
// Backed by Upstash Redis over its REST API when UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN (or the Vercel KV names KV_REST_API_URL /
// KV_REST_API_TOKEN) are set. Without them it falls back to an in-memory
// store so local dev works — data is lost on restart and is NOT shared
// between serverless instances.

export type Thought = {
  id: string;
  project: string;
  text: string;
  contact: string;
  isPublic: boolean;
  createdAt: number;
};

const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const persistent = Boolean(URL_ && TOKEN);

async function redis<T = unknown>(...cmd: (string | number)[]): Promise<T> {
  const res = await fetch(URL_!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error ?? `redis ${res.status}`);
  return json.result as T;
}

declare global {
  // eslint-disable-next-line no-var
  var __feedbackMem__: { likes: Map<string, number>; thoughts: Thought[] } | undefined;
}
type Mem = { likes: Map<string, number>; thoughts: Thought[] };
const mem = (): Mem => (globalThis.__feedbackMem__ ??= { likes: new Map(), thoughts: [] });

const LIKES = (p: string) => `fb:likes:${p}`;
const THOUGHTS = 'fb:thoughts';

export async function getLikes(project: string): Promise<number> {
  if (!persistent) return mem().likes.get(project) ?? 0;
  return Number(await redis<string | null>('GET', LIKES(project))) || 0;
}

export async function addLike(project: string, delta: 1 | -1): Promise<number> {
  if (!persistent) {
    const m = mem();
    const next = Math.max(0, (m.likes.get(project) ?? 0) + delta);
    m.likes.set(project, next);
    return next;
  }
  const n = await redis<number>('INCRBY', LIKES(project), delta);
  if (n < 0) {
    await redis('SET', LIKES(project), 0);
    return 0;
  }
  return n;
}

export async function addThought(t: Thought): Promise<void> {
  if (!persistent) {
    mem().thoughts.unshift(t);
    return;
  }
  await redis('LPUSH', THOUGHTS, JSON.stringify(t));
}

/** Newest first. Pass a project to filter; pass publicOnly to hide private ones. */
export async function listThoughts(
  opts: { project?: string; publicOnly?: boolean } = {},
): Promise<Thought[]> {
  const all = persistent
    ? (await redis<string[]>('LRANGE', THOUGHTS, 0, 499)).map(s => JSON.parse(s) as Thought)
    : mem().thoughts;
  return all.filter(
    t => (!opts.project || t.project === opts.project) && (!opts.publicOnly || t.isPublic),
  );
}

export async function allLikes(projects: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  await Promise.all(
    projects.map(async p => {
      out[p] = await getLikes(p);
    }),
  );
  return out;
}
