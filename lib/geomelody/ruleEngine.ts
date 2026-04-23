export interface Context {
  scene: string
  activity: string
  mood: string
}

export interface TargetFeatures {
  energy: number
  valence: number
  acousticness: number
  instrumentalness: number
}

const sceneProfiles: Record<string, TargetFeatures> = {
  library:  { energy: 0.3,  valence: 0.4, acousticness: 0.7, instrumentalness: 0.8 },
  cafe:     { energy: 0.5,  valence: 0.6, acousticness: 0.6, instrumentalness: 0.4 },
  park:     { energy: 0.55, valence: 0.7, acousticness: 0.5, instrumentalness: 0.3 },
  street:   { energy: 0.75, valence: 0.6, acousticness: 0.2, instrumentalness: 0.2 },
  subway:   { energy: 0.8,  valence: 0.5, acousticness: 0.1, instrumentalness: 0.3 },
}

const activityAdj: Record<string, number> = {
  stationary: -0.1,
  working:     0.0,
  walking:    +0.15,
}

const moodAdj: Record<string, number> = {
  relaxed:   -0.05,
  focused:   -0.1,
  stressed:  +0.15,
  energetic: +0.1,
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))

export function computeTargetFeatures(context: Context): TargetFeatures {
  const base = sceneProfiles[context.scene] ?? sceneProfiles.cafe
  const eAdj = activityAdj[context.activity] ?? 0
  const vAdj = moodAdj[context.mood] ?? 0

  return {
    energy:           clamp(base.energy + eAdj),
    valence:          clamp(base.valence + vAdj),
    acousticness:     base.acousticness,
    instrumentalness: base.instrumentalness,
  }
}