'use client';

import type { CSSProperties, MouseEvent } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface SiteHeaderProps {
  reveal?: boolean;
  style?: CSSProperties;
}

const mobileGutters: CSSProperties = {
  paddingLeft: 'clamp(24px, 12vw, 180px)',
  paddingRight: 'clamp(24px, 12vw, 180px)',
};

export default function SiteHeader({ reveal = false, style }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Publish the header's real rendered height so sticky bars underneath it
  // (e.g. the /projects category filter) can pin flush against it instead of
  // relying on a hard-coded top offset that drifts out of sync and leaves a
  // gap or overlap.
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const setHeightVar = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${el.offsetHeight}px`,
      );
    };

    setHeightVar();
    const observer = new ResizeObserver(setHeightVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobileMenuOpen]);

  const handleWordmarkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.location.reload();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      ref={navRef}
      data-reveal={reveal || undefined}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50"
      style={style}
    >
      <div className="site-page-gutters py-4 lg:py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="DINGRAN DAI"
            className="site-wordmark text-lg lg:text-xl hover:text-orange-500 transition-colors"
            onClick={handleWordmarkClick}
          >
            <span>DINGRAN</span><span aria-hidden className="site-wordmark-icon" /><span>DAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 lg:gap-16">
            <Link href="/projects" className="text-sm font-medium hover:text-orange-500 transition-colors">Projects</Link>
            <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-colors">About</Link>
            <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 transition-colors">Contact</Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="site-mobile-navigation"
          className="md:hidden bg-white border-t border-gray-100 py-4 flex flex-col gap-4"
          style={mobileGutters}
        >
          <Link href="/projects" className="text-sm font-medium hover:text-orange-500 py-2" onClick={closeMobileMenu}>Projects</Link>
          <Link href="/about" className="text-sm font-medium hover:text-orange-500 py-2" onClick={closeMobileMenu}>About</Link>
          <Link href="/about#connect" className="text-sm font-medium hover:text-orange-500 py-2" onClick={closeMobileMenu}>Contact</Link>
        </div>
      )}
    </nav>
  );
}
