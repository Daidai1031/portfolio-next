const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/geomelody/callback`
  : ''

const SCOPES = [
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ')

// 生成随机字符串
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// PKCE 需要的 code_verifier 和 code_challenge
async function generateCodeChallenge(verifier: string): Promise<string> {
  // 用简单的 base64 编码作为 fallback（开发环境 http 下 crypto.subtle 不可用）
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(verifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
  // http 环境 fallback：直接用 verifier 的 base64（plain method）
  return btoa(verifier)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function loginWithSpotify(): Promise<void> {
  const state = generateRandomString(16)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const method = window.crypto?.subtle ? 'S256' : 'plain'

  localStorage.setItem('spotify_auth_state', state)
  localStorage.setItem('spotify_code_verifier', codeVerifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: method,
    code_challenge: codeChallenge,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function handleCallback(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const savedState = localStorage.getItem('spotify_auth_state')
  const codeVerifier = localStorage.getItem('spotify_code_verifier')

  console.log('=== handleCallback ===')
  console.log('code:', code ? '存在' : '不存在')
  console.log('state match:', state === savedState)
  console.log('codeVerifier:', codeVerifier ? '存在' : '不存在')

  if (!code || state !== savedState || !codeVerifier) {
    console.log('早期返回 null，原因：', { code: !!code, stateMatch: state === savedState, codeVerifier: !!codeVerifier })
    return null
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  })

  console.log('token 请求状态:', res.status)

  if (!res.ok) {
    const errText = await res.text()
    console.log('token 请求失败:', errText)
    return null
  }

  const data = await res.json()
  console.log('token 获取成功:', !!data.access_token)

  localStorage.setItem('spotify_access_token', data.access_token)
  localStorage.removeItem('spotify_auth_state')
  localStorage.removeItem('spotify_code_verifier')

  return data.access_token
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('spotify_access_token')
}

export function logout(): void {
  localStorage.removeItem('spotify_access_token')
}