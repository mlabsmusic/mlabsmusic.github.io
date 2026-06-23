const config = {
  appId: 'com.mlabsmusic.recordpool',
  appName: 'MLABS Recordpool',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#f5fbfb',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#f5fbfb',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f5fbfb',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
