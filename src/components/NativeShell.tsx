'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/* Native behaviour the web does not need. Everything is imported lazily and
   guarded, so the same bundle runs unchanged in a browser where none of these
   plugins exist. */
export default function NativeShell() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let removeBack: (() => void) | undefined;

    (async () => {
      const { Capacitor } = await import('@capacitor/core').catch(() => ({ Capacitor: null as any }));
      if (!Capacitor?.isNativePlatform?.()) return;

      /* Dark green status bar over the app's dark green headers. */
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#043F28' });
        }
      } catch { /* plugin not installed in this build */ }

      /* Hide the splash only once React has painted — otherwise Android
         flashes white between the splash and the first screen. */
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch { /* no splash plugin */ }

      /* Android hardware back: go back through app history, and exit only
         from the home screen. Without this, back closes the app from anywhere,
         which reviewers do notice. */
      try {
        const { App } = await import('@capacitor/app');
        const handle = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack && window.location.pathname !== '/home/') window.history.back();
          else App.exitApp();
        });
        removeBack = () => { handle.remove(); };
      } catch { /* no app plugin */ }
    })();

    return () => { removeBack?.(); };
  }, [router]);

  /* A light tap when the screen changes — the small thing that separates an
     app from a page. */
  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch { /* browser, or haptics unavailable */ }
    })();
  }, [pathname]);

  return null;
}
