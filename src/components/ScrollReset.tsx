'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function shouldKeepCurrentScroll() {
  return window.location.hash.length > 0;
}

function scrollToTop() {
  if (shouldKeepCurrentScroll()) return;

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function resetScrollPosition() {
  scrollToTop();

  requestAnimationFrame(() => {
    scrollToTop();

    requestAnimationFrame(() => {
      scrollToTop();
    });
  });

  const timeouts = [60, 180, 360].map((delay) =>
    window.setTimeout(scrollToTop, delay),
  );

  return () => {
    timeouts.forEach((timeout) => window.clearTimeout(timeout));
  };
}

/**
 * Resets scroll to top on every route change.
 * Also disables browser's native scroll restoration so it
 * doesn't restore mid-page position when pressing Back.
 */
export default function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    return resetScrollPosition();
  }, [pathname]);

  // Disable browser scroll restoration once on load
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const onPageShow = () => resetScrollPosition();
    const onPopState = () => resetScrollPosition();

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPopState);

    const clearInitialReset = resetScrollPosition();

    return () => {
      clearInitialReset();
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  return null;
}
