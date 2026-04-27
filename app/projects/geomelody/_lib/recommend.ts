import { getLastfmTags } from './api'

export interface RecommendResult {
  id: string
  reason: string
}

type Profile = {
  prefer: string[]
  avoid: string[]
}

// ============================================================
// IGNORED TAGS — Last.fm 上太普遍、无信息量的 tag,直接忽略
// ============================================================
const IGNORED_TAGS = new Set([
  'pop', 'rock', 'electronic', 'alternative', 'indie',
  'female vocalists', 'male vocalists', 'british', 'american',
  'seen live', 'favorites', 'favourite songs', 'love',
  '00s', '10s', '20s', '70s', '80s', '90s', '2000s', '2010s', '2020s',
])

// ============================================================
// SCENE
// ============================================================
const SCENE_PROFILES: Record<string, Profile> = {
  cafe: {
    prefer: [
      'indie pop', 'dream pop', 'bedroom pop', 'shoegaze',
      'acoustic', 'folk', 'jazz', 'bossa nova', 'lounge',
      'coffeehouse', 'singer-songwriter', 'mellow', 'soft',
      'easy listening', 'soul', 'neo-soul', 'r&b', 'rnb',
    ],
    avoid: [
      'edm', 'techno', 'house', 'metal', 'hardcore', 'punk',
      'aggressive', 'screamo', 'trap', 'industrial', 'hard rock',
    ],
  },
  library: {
    prefer: [
      'ambient', 'classical', 'instrumental', 'post-rock', 'lo-fi',
      'minimal', 'soundtrack', 'piano', 'meditation', 'chillout',
      'drone', 'neoclassical', 'film score', 'modern classical',
      'study', 'focus', 'background music',
    ],
    avoid: [
      'dance', 'edm', 'rap', 'hip hop', 'hip-hop', 'metal',
      'punk', 'party', 'workout', 'aggressive', 'loud',
      'hard rock', 'screamo', 'vocal',
    ],
  },
  street: {
    prefer: [
      'hip hop', 'hip-hop', 'rap', 'trap', 'r&b', 'rnb', 'soul',
      'urban', 'funk', 'dance', 'reggaeton',
    ],
    avoid: [
      'classical', 'ambient', 'drone', 'meditation', 'lullaby',
    ],
  },
  subway: {
    prefer: [
      'electropop', 'dance pop', 'synthpop', 'synthwave',
      'edm', 'techno', 'house', 'drum and bass', 'industrial',
      'indie rock', 'alternative rock', 'electro',
    ],
    avoid: [
      'classical', 'ambient', 'drone', 'meditation', 'lullaby',
      'sleep', 'whisper',
    ],
  },
  park: {
    prefer: [
      'indie pop', 'folk', 'acoustic', 'singer-songwriter',
      'happy', 'sunny', 'feel good', 'summer', 'sunshine',
      'jangle pop', 'twee',
    ],
    avoid: [
      'metal', 'industrial', 'screamo', 'aggressive', 'doom',
      'depressing', 'sad',
    ],
  },
  gym: {
    prefer: [
      'workout', 'energetic', 'edm', 'hip hop', 'hip-hop',
      'trap', 'electronic dance', 'big beat', 'drum and bass',
      'hard rock', 'metal', 'punk', 'aggressive',
    ],
    avoid: [
      'ambient', 'classical', 'sad', 'sleep', 'meditation',
      'mellow', 'calm', 'lullaby', 'lo-fi',
    ],
  },
  bedtime: {
    prefer: [
      'ambient', 'lullaby', 'sleep', 'meditation', 'chillout',
      'dream pop', 'shoegaze', 'lo-fi', 'piano',
      'acoustic', 'soft', 'mellow', 'whisper', 'soothing',
    ],
    avoid: [
      'edm', 'dance', 'workout', 'metal', 'punk', 'hardcore',
      'aggressive', 'loud', 'energetic', 'upbeat',
    ],
  },
}

// ============================================================
// ACTIVITY
// ============================================================
const ACTIVITY_PROFILES: Record<string, Profile> = {
  stationary: {
    prefer: [
      'ambient', 'chill', 'lo-fi', 'mellow', 'slowcore', 'downtempo',
      'calm', 'soft', 'quiet', 'chillout',
    ],
    avoid: [
      'dance', 'edm', 'workout', 'energetic', 'upbeat', 'fast',
      'aggressive',
    ],
  },
  working: {
    prefer: [
      'lo-fi', 'chillhop', 'instrumental', 'ambient', 'post-rock',
      'minimal', 'focus', 'study', 'piano', 'soundtrack',
      'background music', 'film score',
    ],
    avoid: [
      'rap', 'hip hop', 'dance', 'edm', 'aggressive', 'metal',
      'punk', 'party', 'vocal',
    ],
  },
  walking: {
    prefer: [
      'indie pop', 'dance pop', 'electropop', 'synthwave',
      'upbeat', 'feel good', 'sunny', 'happy', 'jangle pop',
      'indie rock', 'alternative rock',
    ],
    avoid: [
      'drone', 'meditation', 'sleep', 'doom', 'whisper',
    ],
  },
  running: {
    prefer: [
      'workout', 'energetic', 'electronic dance', 'big beat',
      'drum and bass', 'edm', 'house', 'techno', 'trap',
      'hip hop', 'hip-hop', 'hard rock', 'punk',
      'fast', 'upbeat', 'high energy',
    ],
    avoid: [
      'ambient', 'classical', 'mellow', 'sad', 'sleep',
      'meditation', 'lo-fi', 'slow', 'lullaby',
    ],
  },
}

// ============================================================
// MOOD
// ============================================================
const MOOD_PROFILES: Record<string, Profile> = {
  focused: {
    prefer: [
      'ambient', 'minimal', 'instrumental', 'classical', 'post-rock',
      'focus', 'study', 'piano', 'soundtrack', 'film score',
      'background music', 'modern classical',
    ],
    avoid: [
      'rap', 'party', 'dance', 'aggressive', 'vocal',
    ],
  },
  relaxed: {
    prefer: [
      'chill', 'acoustic', 'folk', 'dream pop', 'mellow', 'calm',
      'soft', 'lo-fi', 'jazz', 'bossa nova', 'easy listening',
      'lounge', 'coffeehouse',
    ],
    avoid: [
      'aggressive', 'metal', 'edm', 'workout', 'punk',
      'screamo', 'hardcore',
    ],
  },
  stressed: {
    prefer: [
      'sunshine pop', 'easy listening', 'feel good', 'happy',
      'mellow', 'jangle pop', 'twee', 'soft rock', 'folk pop',
    ],
    avoid: [
      'aggressive', 'metal', 'sad', 'depressing', 'screamo',
      'doom', 'gloomy',
    ],
  },
  energetic: {
    prefer: [
      'dance', 'edm', 'pop rock', 'funk', 'disco', 'house',
      'upbeat', 'energetic', 'workout', 'electropop',
      'synthwave', 'big beat', 'drum and bass',
    ],
    avoid: [
      'ambient', 'sad', 'sleep', 'meditation', 'slow',
      'mellow', 'lullaby',
    ],
  },
  melancholic: {
    prefer: [
      'sad', 'melancholic', 'melancholy', 'gloomy', 'lonely',
      'slowcore', 'sadcore', 'shoegaze', 'dream pop',
      'lo-fi', 'piano', 'acoustic',
    ],
    avoid: [
      'happy', 'feel good', 'sunny', 'party', 'workout',
      'upbeat', 'energetic',
    ],
  },
}

// ============================================================
// 标签映射(UI label → 内部 key)
// ============================================================
const sceneMap: Record<string, string>    = {
  'Café':'cafe', 'Library':'library', 'Street':'street',
  'Subway':'subway', 'Park':'park', 'Gym':'gym', 'Bedtime':'bedtime',
}
const activityMap: Record<string, string> = {
  'Still':'stationary', 'Working':'working',
  'Walking':'walking', 'Running':'running',
}
const moodMap: Record<string, string>     = {
  'Focused':'focused', 'Relaxed':'relaxed', 'Stressed':'stressed',
  'Energetic':'energetic', 'Melancholic':'melancholic',
}

// ============================================================
// 单个维度的得分
// ============================================================
function scoreDimension(
  trackTags: string[],
  profile: Profile,
  weight: number
): { score: number; matched: string[] } {
  const matched: string[] = []
  let score = 0

  for (const tag of trackTags) {
    const t = tag.toLowerCase().trim()
    if (IGNORED_TAGS.has(t)) continue

    const tagWords = t.split(/[\s\-]+/)

    // 命中 prefer
    let isPrefer = false
    for (const w of profile.prefer) {
      const wLower = w.toLowerCase()
      // 多词词条:必须完整匹配整个 tag
      // 单词词条:可作为 tagWords 的一部分(但不能是 noise tag)
      if (t === wLower) {
        isPrefer = true
        break
      }
      if (wLower.indexOf(' ') === -1 && wLower.indexOf('-') === -1) {
        if (tagWords.includes(wLower)) {
          isPrefer = true
          break
        }
      }
    }
    if (isPrefer) {
      score += weight
      matched.push(tag)
      continue
    }

    // 命中 avoid
    for (const w of profile.avoid) {
      const wLower = w.toLowerCase()
      if (t === wLower) {
        score -= weight * 1.5
        break
      }
      if (wLower.indexOf(' ') === -1 && wLower.indexOf('-') === -1) {
        if (tagWords.includes(wLower)) {
          score -= weight * 1.5
          break
        }
      }
    }
  }

  return { score, matched: [...new Set(matched)] }
}

// ============================================================
// 动态权重
// ============================================================
function getWeights(activity: string): { scene: number; activity: number; mood: number } {
  // 默认 scene 主导
  const defaults = { scene: 3, activity: 1, mood: 2 }

  // Running 时 activity 主导(身体决定一切)
  if (activity === 'Running') {
    return { scene: 1, activity: 3, mood: 2 }
  }

  return defaults
}

// ============================================================
// 主函数
// ============================================================
export async function scoreByGenres(
  tracks: { id: string; name: string; artist: string; artistId?: string }[],
  scene: string,
  activity: string,
  mood: string
): Promise<RecommendResult[]> {
  const tagMap = await getLastfmTags(tracks)

  const sceneProfile    = SCENE_PROFILES[sceneMap[scene]    ?? '']
  const activityProfile = ACTIVITY_PROFILES[activityMap[activity] ?? '']
  const moodProfile     = MOOD_PROFILES[moodMap[mood]      ?? '']

  const W = getWeights(activity)

  const scored = tracks.map(t => {
    const tags = tagMap.get(t.id) ?? []
    if (tags.length === 0) {
      return { id: t.id, score: -999, reason: 'No tags found', matched: [] as string[] }
    }

    let totalScore = 0
    const allMatched: string[] = []

    if (sceneProfile) {
      const { score, matched } = scoreDimension(tags, sceneProfile, W.scene)
      totalScore += score
      allMatched.push(...matched)
    }
    if (activityProfile) {
      const { score, matched } = scoreDimension(tags, activityProfile, W.activity)
      totalScore += score
      allMatched.push(...matched)
    }
    if (moodProfile) {
      const { score, matched } = scoreDimension(tags, moodProfile, W.mood)
      totalScore += score
      allMatched.push(...matched)
    }

    const uniqueMatched = [...new Set(allMatched)]
    const firstMeaningful = tags.find(tag => !IGNORED_TAGS.has(tag.toLowerCase().trim())) ?? tags[0]

    return {
      id: t.id,
      score: totalScore,
      reason: uniqueMatched.length > 0
        ? uniqueMatched.slice(0, 3).join(' · ')
        : (firstMeaningful ?? 'No matching tags'),
      matched: uniqueMatched,
    }
  })

  scored.sort((a, b) => b.score - a.score)

  if (typeof window !== 'undefined') {
    console.log(`[recommend] ${scene} / ${activity} / ${mood}  weights:`, W)
    console.table(
      scored.slice(0, 10).map(s => ({
        score: s.score.toFixed(1),
        matched: s.matched.slice(0, 4).join(', '),
        reason: s.reason,
      }))
    )
  }

  return scored
    .filter(s => s.score > -999)
    .slice(0, 5)
    .map(s => ({ id: s.id, reason: s.reason }))
}