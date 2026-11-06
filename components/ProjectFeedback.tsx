'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import DaisyDotFlower from '@/components/DaisyDotFlower';

type PublicThought = { id: string; text: string; createdAt: number };

export default function ProjectFeedback({ project }: { project: string }) {
  const likedKey = `liked:${project}`;
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(0);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [contact, setContact] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [thoughts, setThoughts] = useState<PublicThought[]>([]);
  const [showThoughts, setShowThoughts] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLiked(localStorage.getItem(likedKey) === '1');
    fetch(`/api/feedback?project=${encodeURIComponent(project)}`)
      .then(r => r.json())
      .then(d => {
        setLikes(d.likes ?? 0);
        setThoughts(d.thoughts ?? []);
      })
      .catch(() => setLikes(0));
  }, [project, likedKey]);

  useEffect(() => {
    if (open) textRef.current?.focus();
  }, [open]);

  const post = (body: object) =>
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project, ...body }),
    });

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes(n => Math.max(0, (n ?? 0) + (next ? 1 : -1)));
    if (next) {
      localStorage.setItem(likedKey, '1');
      setBurst(b => b + 1);
    } else {
      localStorage.removeItem(likedKey);
    }
    post({ type: next ? 'like' : 'unlike' })
      .then(r => r.json())
      .then(d => typeof d.likes === 'number' && setLikes(d.likes))
      .catch(() => {});
  };

  const send = async () => {
    if (!text.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      const r = await post({ type: 'thought', text, contact, isPublic });
      if (!r.ok) throw new Error('send failed');
      if (isPublic) {
        setThoughts(t => [{ id: String(Date.now()), text: text.trim(), createdAt: Date.now() }, ...t]);
      }
      setStatus('done');
      setText('');
      setContact('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section aria-label="Feedback" className="border-t border-gray-200 pt-6">
      <div className="flex flex-wrap items-center gap-x-9 gap-y-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className="fb-like relative inline-flex items-center gap-2.5 text-[15px] font-bold"
        >
          <DaisyDotFlower
            className={`fb-flower h-7 w-7 ${liked ? 'fb-flower-on' : ''}`}
            primaryColor={liked ? 'var(--color-orange-500)' : '#b5b5b5'}
            secondaryColor="#e2e2e2"
          />
          Like
          {likes !== null && likes > 0 && (
            <span className="font-semibold tabular-nums text-gray-500">{likes}</span>
          )}
          {burst > 0 && (
            <span key={burst} className="pointer-events-none absolute left-0 top-0" aria-hidden>
              {[0, 1, 2, 3, 4].map(i => (
                <span
                  key={i}
                  className="fb-fly absolute left-1 top-1 block h-5 w-5"
                  style={
                    {
                      '--x': `${(i - 1) * 16 + 6}px`,
                      '--r': `${(i - 2) * 30}deg`,
                      animationDelay: `${i * 70}ms`,
                    } as CSSProperties
                  }
                >
                  <DaisyDotFlower className="h-full w-full" />
                </span>
              ))}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(o => !o);
            if (status === 'done') setStatus('idle');
          }}
          aria-expanded={open}
          className="border-b-[1.5px] border-black pb-0.5 text-[15px] font-bold transition-colors hover:border-orange-500 hover:text-orange-500"
        >
          Leave your thinking →
        </button>

        {thoughts.length > 0 && (
          <button
            type="button"
            onClick={() => setShowThoughts(s => !s)}
            className="text-sm text-gray-500 hover:text-black"
          >
            {showThoughts ? 'Hide' : 'Read'} {thoughts.length} public{' '}
            {thoughts.length === 1 ? 'thought' : 'thoughts'}
          </button>
        )}
      </div>

      <div className={`fb-panel ${open ? 'fb-panel-open' : ''}`}>
        <div>
          {status === 'done' ? (
            <p className="pt-5 font-[family-name:var(--font-caveat)] text-2xl font-bold text-orange-500">
              Thank you — got it. 🌼
            </p>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                send();
              }}
              className="grid max-w-[520px] gap-3 pt-5"
            >
              <textarea
                ref={textRef}
                rows={3}
                maxLength={2000}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What did this make you think?"
                className="w-full resize-none border-0 border-b-[1.5px] border-black bg-transparent py-2 text-base outline-none focus:border-orange-500"
              />
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                maxLength={200}
                placeholder="Email or anything, if you'd like a reply (optional)"
                className="w-full border-0 border-b border-dashed border-gray-400 bg-transparent py-2 text-base outline-none focus:border-orange-500"
              />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <button
                  type="submit"
                  disabled={!text.trim() || status === 'sending'}
                  className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-[.96] disabled:opacity-40"
                >
                  {status === 'sending' ? 'Sending…' : 'Send'}
                </button>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  {isPublic ? 'Everyone can see this' : 'Only Daisy can see this'}
                </label>
                {status === 'error' && (
                  <span className="text-sm text-red-600">Couldn’t send. Try again?</span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {showThoughts && (
        <ul className="mt-6 max-w-[520px] space-y-4 border-l-2 border-gray-200 pl-4">
          {thoughts.map(t => (
            <li key={t.id} className="whitespace-pre-wrap text-sm text-gray-700">
              {t.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
