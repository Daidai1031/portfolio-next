'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Music } from 'lucide-react';

const NAV_PADDING = 'clamp(24px, 10vw, 144px)';

const MOODS = [
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Melancholic' },
  { id: 'chill', label: 'Chill' },
  { id: 'focused', label: 'Focused' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'angry', label: 'Intense' },
];

const CONTEXTS = [
  { id: 'study', label: 'Studying' },
  { id: 'workout', label: 'Workout' },
  { id: 'commute', label: 'Commute' },
  { id: 'sleep', label: 'Winding Down' },
  { id: 'party', label: 'Party' },
  { id: 'coding', label: 'Coding' },
];

export default function MoodMusicApp() {
  const [mood, setMood] = useState('chill');
  const [context, setContext] = useState('study');
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spotify/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, context }),
      });
      if (res.status === 401) {
        window.location.href = '/api/spotify/login';
        return;
      }
      const data = await res.json();
      setTracks(data.tracks || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Nav — 直接复用你现有的结构 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="py-4 lg:py-6" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg lg:text-xl font-bold tracking-tight hover:text-orange-500 transition-colors">
              DINGRAN DAI
            </Link>
            <div className="hidden md:flex items-center gap-8 lg:gap-16">
              <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">Projects</Link>
              <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
              <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="h-16 lg:h-32" />

      {/* Hero */}
      <section className="pt-12 pb-12 lg:pt-24 lg:pb-16" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <p className="text-sm text-gray-500 mb-3 lg:mb-4 uppercase tracking-wider">Playground</p>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 lg:mb-8 leading-tight">
          Mood <span className="text-orange-500">Music</span>
        </h1>
        <p className="text-base lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
          A Spotify-powered recommender that maps your mood and context to audio features — valence, energy, acousticness — to find tracks that actually fit the moment.
        </p>
      </section>

      {/* Selector */}
      <section className="pb-12 lg:pb-16" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <div className="mb-10">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-4">01 — How are you feeling?</p>
          <div className="flex flex-wrap gap-3">
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`px-5 py-2.5 text-sm border rounded-full transition-all ${
                  mood === m.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:text-orange-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-4">02 — What are you doing?</p>
          <div className="flex flex-wrap gap-3">
            {CONTEXTS.map(c => (
              <button
                key={c.id}
                onClick={() => setContext(c.id)}
                className={`px-5 py-2.5 text-sm border rounded-full transition-all ${
                  context === c.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
          className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-sm font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          <Music className="w-4 h-4" />
          {loading ? 'Finding your tracks…' : 'Get Recommendations'}
        </button>
      </section>

      {/* Tracks */}
      {tracks.length > 0 && (
        <section className="pb-24" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">20 tracks for you</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tracks.map(t => (
              
                key={t.id}
                href={t.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-3 border border-gray-100 hover:border-orange-500 transition-colors"
              >
                <img
                  src={t.album.images[2]?.url || t.album.images[0]?.url}
                  alt=""
                  className="w-14 h-14 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate group-hover:text-orange-500 transition-colors">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {t.artists.map((a: any) => a.name).join(', ')}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Footer — 复用你的 */}
      <footer className="border-t border-gray-200 py-10 lg:py-16 bg-gray-50" style={{ paddingLeft: NAV_PADDING, paddingRight: NAV_PADDING }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Dingran Dai. All rights reserved.</p>
          <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
}