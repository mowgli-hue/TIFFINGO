import type { CapacitorConfig } from '@capacitor/cli';

/* The web assets are BUILT INTO the binary (webDir below), not loaded from a
   remote URL. Apple rejects apps that are only a window onto a website
   (Guideline 4.2); an app that ships its own UI and talks to an API over the
   network is an app. Only /api calls leave the device. */
const config: CapacitorConfig = {
  appId: 'com.mowglicfd.tiffingo',
  appName: 'TiffinGo',
  webDir: 'mobile-out',
  ios: {
    contentInset: 'always',
    backgroundColor: '#F5F5F0',
  },
  android: {
    backgroundColor: '#F5F5F0',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#043F28',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#043F28',
    },
  },
};

export default config;
