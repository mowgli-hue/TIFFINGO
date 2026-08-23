'use client';
import { useEffect } from 'react';

/* Mounts the hero scene after hydration. three.js loads lazily so it never
   blocks first paint - the page is fully readable without it. */
export default function TiffinScene() {
  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const THREE = await import('three');
        const { initTiffinScene } = await import('@/lib/tiffin-scene');
        if (cancelled) return;
        dispose = initTiffinScene(THREE);
      } catch (err) {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('done');
        console.warn('[TiffinGo] hero scene unavailable:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (dispose) dispose();
    };
  }, []);

  return null;
}
