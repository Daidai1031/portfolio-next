import { getAccessToken, logout } from './auth'

const BASE = 'https://api.spotify.com/v1'

export interface Track {
  id: string
  name: string
  artist: string
  artistId: string
  album: string
  image: string | undefined
  uri: string
  distance?: number
}

export interface Playlist {
  id: string
  name: string
  image: string | undefined
  total: number
}

async function spotifyFetch(url: string) {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      logout()
      window.location.reload()
    }
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Spotify ${res.status} on ${url}: ${errText}`)
  }

  return res.json()
}

export async function getUserPlaylists(): Promise<Playlist[]> {
  const data = await spotifyFetch(`${BASE}/me/playlists?limit=50`)
  return data.items
    .filter((p: any) => p && p.id)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0]?.url,
      total: p.tracks?.total ?? 0,
    }))
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const data = await spotifyFetch(
    `${BASE}/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,artists,album))`
  )
  return data.items
    .map((item: any) => item.track)
    .filter((t: any) => t && t.id)
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.[0]?.name ?? 'Unknown',
      artistId: t.artists?.[0]?.id ?? '',
      album: t.album?.name ?? '',
      image: t.album?.images?.[1]?.url,
      uri: `spotify:track:${t.id}`,
    }))
}

const LASTFM_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY!
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/'

export async function getLastfmTags(
  tracks: { id: string; name: string; artist: string }[]
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>()

  // Last.fm 没有批量端点,要逐个请求。控制并发,不然容易被限流
  await Promise.all(
    tracks.map(async (t) => {
      try {
        const url = new URL(LASTFM_BASE)
        url.searchParams.set('method', 'track.getTopTags')
        url.searchParams.set('api_key', LASTFM_KEY)
        url.searchParams.set('artist', t.artist)
        url.searchParams.set('track', t.name)
        url.searchParams.set('format', 'json')
        url.searchParams.set('autocorrect', '1')

        const res = await fetch(url.toString())
        if (!res.ok) {
          result.set(t.id, [])
          return
        }
        const data = await res.json()
        const tags = (data?.toptags?.tag ?? [])
          .map((tg: any) => tg.name?.toLowerCase())
          .filter(Boolean)
          .slice(0, 10)
        result.set(t.id, tags)
      } catch {
        result.set(t.id, [])
      }
    })
  )

  return result
}


export async function getLikedTracks(): Promise<Track[]> {
  const data = await spotifyFetch(`${BASE}/me/tracks?limit=50`)
  return data.items
    .map((item: any) => item.track)
    .filter((t: any) => t && t.id)
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.[0]?.name ?? 'Unknown',
      artistId: t.artists?.[0]?.id ?? '',
      album: t.album?.name ?? '',
      image: t.album?.images?.[1]?.url,
      uri: `spotify:track:${t.id}`,
    }))
}

export async function getTopTracks(): Promise<Track[]> {
  const data = await spotifyFetch(`${BASE}/me/top/tracks?limit=50&time_range=medium_term`)
  return data.items
    .filter((t: any) => t && t.id)
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.[0]?.name ?? 'Unknown',
      artistId: t.artists?.[0]?.id ?? '',
      album: t.album?.name ?? '',
      image: t.album?.images?.[1]?.url,
      uri: `spotify:track:${t.id}`,
    }))
}