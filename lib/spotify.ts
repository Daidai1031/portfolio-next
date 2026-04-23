const AUTH_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

export const SCOPES = [
  'user-top-read',
  'user-read-private',
  'playlist-modify-private',
].join(' ');

function basicAuth() {
  return 'Basic ' + Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuth(),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json();
}

export async function spotifyGet(endpoint: string, token: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API ${endpoint}: ${res.status}`);
  return res.json();
}

// 心情 → 音频特征
export const MOOD_MAP: Record<string, Record<string, number>> = {
  happy:    { valence: 0.85, energy: 0.75, danceability: 0.7 },
  sad:      { valence: 0.2,  energy: 0.3,  acousticness: 0.6 },
  chill:    { valence: 0.6,  energy: 0.35, acousticness: 0.5 },
  focused:  { valence: 0.5,  energy: 0.4,  instrumentalness: 0.6 },
  romantic: { valence: 0.7,  energy: 0.4,  acousticness: 0.4 },
  angry:    { valence: 0.3,  energy: 0.9 },
};

export const CONTEXT_MAP: Record<string, Record<string, number>> = {
  workout: { energy: 0.15, danceability: 0.1 },
  study:   { instrumentalness: 0.3, energy: -0.15 },
  commute: { energy: 0.1, danceability: 0.1 },
  sleep:   { energy: -0.3, acousticness: 0.3 },
  party:   { energy: 0.2, danceability: 0.2, valence: 0.15 },
  coding:  { instrumentalness: 0.25 },
};

export function buildTargets(mood: string, context: string) {
  const base = { ...(MOOD_MAP[mood] || {}) };
  const ctx = CONTEXT_MAP[context] || {};
  for (const [k, v] of Object.entries(ctx)) {
    base[k] = Math.max(0, Math.min(1, (base[k] ?? 0.5) + v));
  }
  return Object.fromEntries(
    Object.entries(base).map(([k, v]) => [`target_${k}`, v.toFixed(2)])
  );
}