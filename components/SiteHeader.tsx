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
  const projectsActive = pathname.startsWith('/projects');
  const aboutActive = pathname.startsWith('/about');

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
      className="site-header fixed inset-x-0 top-0 z-50 bg-black text-white"
      style={style}
    >
      <div className="site-header-surface">
        <div className="site-page-gutters">
          <div className="flex min-h-14 items-center justify-between lg:min-h-[68px]">
            <Link
              href="/"
              aria-label="DINGRAN DAI"
              className="site-header-wordmark site-wordmark min-h-11 text-xl lg:text-[1.375rem]"
              onClick={handleWordmarkClick}
            >
              <span>DINGRAN</span>
              <span aria-hidden className="site-wordmark-icon" />
              <span>DAI</span>
            </Link>

            <div className="ml-auto hidden self-stretch md:flex">
              <Link
                href="/projects"
                aria-current={projectsActive ? 'page' : undefined}
                data-active={projectsActive || undefined}
                className="site-header-link"
              >
                Projects
              </Link>
              <Link
                href="/about"
                aria-current={aboutActive ? 'page' : undefined}
                data-active={aboutActive || undefined}
                className="site-header-link"
              >
                About
              </Link>
            </div>

            <button
              type="button"
              className="site-header-menu-button md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="site-mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="site-mobile-navigation"
            className="flex flex-col gap-2 border-t border-white/15 py-3 md:hidden"
            style={mobileGutters}
          >
            <Link
              href="/projects"
              aria-current={projectsActive ? 'page' : undefined}
              data-active={projectsActive || undefined}
              className="site-header-mobile-link"
              onClick={closeMobileMenu}
            >
              Projects
            </Link>
            <Link
              href="/about"
              aria-current={aboutActive ? 'page' : undefined}
              data-active={aboutActive || undefined}
              className="site-header-mobile-link"
              onClick={closeMobileMenu}
            >
              About
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
