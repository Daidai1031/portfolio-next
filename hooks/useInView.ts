// hooks/useInView.ts
import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref and a boolean `inView`.
 * `inView` becomes true once the element has been scrolled into view
 * beyond `threshold` (0–1) and stays true (one-shot).
 */
export function useInView(threshold = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // one-shot: once colored, stay colored
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
