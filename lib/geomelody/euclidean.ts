import { Track } from './api'
import { TargetFeatures } from './ruleEngine'

function euclideanDistance(target: TargetFeatures, features: Track['features']): number {
  const keys: (keyof TargetFeatures)[] = ['energy', 'valence', 'acousticness', 'instrumentalness']
  const sumSquares = keys.reduce((acc, key) => {
    const diff = (target[key] ?? 0) - (features[key] ?? 0)
    return acc + diff * diff
  }, 0)
  return Math.sqrt(sumSquares)
}

export function getTopMatches(library: Track[], target: TargetFeatures, topN = 5): Track[] {
  return library
    .map(track => ({
      ...track,
      distance: euclideanDistance(target, track.features),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, topN)
}