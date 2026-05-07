// app/projects/geomelody/_lib/poem.ts

export interface Poem {
  featured_titles: string[]
  lines: string[]
}

export interface PoemRequest {
  titles: string[]
  scene: string
  mood: string
  activity: string
  hr: number     // 0..1
  noise: number  // 0..1
}

export async function generatePoem(input: PoemRequest): Promise<Poem> {
  const res = await fetch('/api/geomelody/poem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error || 'Poem generation failed')
  }
  return res.json() as Promise<Poem>
}