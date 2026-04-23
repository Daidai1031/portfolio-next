export interface RecommendResult {
  id: string
  reason: string
}

export async function recommendWithClaude(
  tracks: { id: string; name: string; artist: string }[],
  scene: string,
  activity: string,
  mood: string
): Promise<RecommendResult[]> {
  const res = await fetch('/api/geomelody/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tracks, scene, activity, mood }),
  })

  if (!res.ok) throw new Error(`Recommend API error: ${res.status}`)
  return await res.json()
}