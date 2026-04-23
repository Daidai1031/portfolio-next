import { getArtistGenres } from './api'

export interface RecommendResult {
  id: string
  reason: string
}

// 场景/活动/心情 → 偏好流派关键词
const CONTEXT_GENRES: Record<string, string[]> = {
  cafe:     ['indie', 'acoustic', 'folk', 'jazz', 'bossa', 'lounge', 'chill', 'dream pop'],
  library:  ['ambient', 'classical', 'instrumental', 'post-rock', 'minimal', 'drone', 'lo-fi'],
  street:   ['hip hop', 'rap', 'pop', 'trap', 'r&b', 'dance'],
  subway:   ['electronic', 'edm', 'techno', 'house', 'dnb', 'industrial', 'rock'],
  park:     ['indie', 'folk', 'acoustic', 'indie pop', 'singer-songwriter', 'soft rock'],

  stationary: ['ambient', 'chill', 'lo-fi', 'mellow', 'slowcore', 'downtempo'],
  working:    ['lo-fi', 'chillhop', 'instrumental', 'ambient', 'post-rock', 'minimal'],
  walking:    ['pop', 'indie pop', 'dance pop', 'electropop', 'upbeat', 'synthwave'],

  focused:   ['ambient', 'minimal', 'instrumental', 'classical', 'post-rock'],
  relaxed:   ['chill', 'acoustic', 'folk', 'dream pop', 'bossa', 'lounge'],
  stressed:  ['indie pop', 'soft rock', 'folk pop', 'sunshine pop', 'city pop'],
  energetic: ['dance', 'edm', 'electronic', 'pop rock', 'funk', 'disco', 'house'],
}

function scoreByGenres(genres: string[], wantedKeywords: string[]): { score: number; matched: string[] } {
  const matched: string[] = []
  let score = 0

  genres.forEach(g => {
    const lg = g.toLowerCase()
    for (const w of wantedKeywords) {
      if (lg.includes(w)) {
        score += 1
        matched.push(g)
        break
      }
    }
  })
  return { score, matched: [...new Set(matched)] }
}

const sceneMap: Record<string, string>    = { 'Café':'cafe','Library':'library','Street':'street','Subway':'subway','Park':'park' }
const activityMap: Record<string, string> = { 'Still':'stationary','Working':'working','Walking':'walking' }
const moodMap: Record<string, string>     = { 'Focused':'focused','Relaxed':'relaxed','Stressed':'stressed','Energetic':'energetic' }

export async function recommendWithClaude(
  tracks: { id: string; name: string; artist: string; artistId?: string }[],
  scene: string,
  activity: string,
  mood: string
): Promise<RecommendResult[]> {
  // 1. 拉所有艺术家的 genres
  const artistIds = [...new Set(tracks.map(t => t.artistId).filter(Boolean) as string[])]
  const genreMap = await getArtistGenres(artistIds)

  // 2. 组合关键词
  const wanted = [
    ...(CONTEXT_GENRES[sceneMap[scene] ?? ''] ?? []),
    ...(CONTEXT_GENRES[activityMap[activity] ?? ''] ?? []),
    ...(CONTEXT_GENRES[moodMap[mood] ?? ''] ?? []),
  ]

  // 3. 给每首歌打分
  const scored = tracks.map(t => {
    const genres = genreMap.get(t.artistId ?? '') ?? []
    const { score, matched } = scoreByGenres(genres, wanted)
    return {
      id: t.id,
      score,
      reason: matched.length > 0
        ? matched.slice(0, 3).join(' · ')
        : (genres[0] ?? 'No genre info'),
    }
  })

  // 4. 排序取前 5
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => ({ id: s.id, reason: s.reason }))
}