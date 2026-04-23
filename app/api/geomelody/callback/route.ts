import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const saved = req.cookies.get('spotify_state')?.value;

  if (!code || !state || state !== saved) {
    return NextResponse.redirect(new URL('/playground/mood-music?error=auth', req.url));
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    const res = NextResponse.redirect(new URL('/playground/mood-music', req.url));
    res.cookies.set('spotify_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expires_in,
      path: '/',
    });
    return res;
  } catch (e) {
    return NextResponse.redirect(new URL('/playground/mood-music?error=token', req.url));
  }
}