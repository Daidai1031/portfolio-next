import { getAccessToken } from './auth'

const BASE = 'https://api.spotify.com/v1'

function headers(): HeadersInit {
  return { Authorization: `Bearer ${getAccessToken()}` }
}

export interface Track {
  id: string
  name: string
  artist: string
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

export async function getUserPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${BASE}/me/playlists?limit=50`, { headers: headers() })
  if (!res.ok) throw new Error(`Failed to fetch playlists: ${res.status}`)
  const data = await res.json()
  return data.items
    .filter((p: any) => p && p.id)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0]?.url,
      total: p.tracks?.total ?? p.items?.total ?? 0,
    }))
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const res = await fetch(
    `${BASE}/playlists/${playlistId}/items?limit=100&fields=items(track(id,name,artists,album))`,
    { headers: headers() }
  )
  if (!res.ok) throw new Error(`Failed to fetch tracks: ${res.status}`)
  const data = await res.json()
  return data.items
    .map((item: any) => item.track)
    .filter((t: any) => t && t.id)
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.[0]?.name ?? 'Unknown',
      album: t.album?.name ?? '',
      image: t.album?.images?.[1]?.url,
      uri: `spotify:track:${t.id}`,
    }))
}