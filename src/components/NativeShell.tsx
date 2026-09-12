'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* Native behaviour the web does not need. Every plugin is imported lazily and
   guarded, so the identical bundle still runs in a browser where none of them
   exist. */
export default function NativeShell() {
  const pathname = usePathname();

  /* Hiding the splash is deliberately first, in its own effect, and depends on
     nothing else. Anything that runs before it is something that can fail and
     leave the app showing a green rectangle with no way out. */
  useEffect(() => {
    let done = false;
    const hide = async () => {
      if (done) return;
      done = true;
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch { /* browser, or the plugin is not in this build */ }
    };
    hide();
    /* If the import above is slow, the config's launchAutoHide still ends it. */
    const t = setTimeout(hide, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let removeBack: (() => void) | undefined;

    (async () => {
      let Capacitor: any;
      try {
        ({ Capacitor } = await import('@capacitor/core'));
      } catch {
        return; /* web build */
      }
      if (!Capacitor?.isNativePlatform?.()) return;

      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        if (Capacitor.getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#043F28' });
        }
      } catch { /* plugin absent */ }

      /* Android hardware back: walk app history, exit only from home.
         Without this, back closes the app from anywhere. */
      try {
        const { App } = await import('@capacitor/app');
        const handle = await App.addListener('backButton', ({ canGoBack }) => {
          const atHome = window.location.pathname.replace(/\/index\.html$/, '/') === '/home/';
          if (canGoBack && !atHome) window.history.back();
          else App.exitApp();
        });
        removeBack = () => { handle.remove(); };
      } catch { /* plugin absent */ }
    })();

    return () => { removeBack?.(); };
  }, []);

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
