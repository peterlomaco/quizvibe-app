// Dynamisk config ovanpå app.json.
//
// APP_VARIANT=development ger dev-bygget ett EGET bundle-id + namn så det kan
// ligga installerat bredvid TestFlight/App Store-appen (samma id gjorde att de
// skrev över varandra, och man öppnade PROD-appen i tron att det var dev-bygget).
//
// Variabeln sätts ENBART i EAS-miljön "development" (eas env), inte i eas.json —
// eas.json ingår i runtime-fingerprinten, och production/preview-byggen ska få
// exakt samma config (och fingerprint) som innan. Utan APP_VARIANT returneras
// app.json orörd.
const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = ({ config }) => {
  if (!IS_DEV) return config;
  return {
    ...config,
    name: 'QuizVibe Dev',
    ios: { ...config.ios, bundleIdentifier: 'se.quizvibe.app.dev' },
    android: { ...config.android, package: 'se.quizvibe.app.dev' },
  };
};
