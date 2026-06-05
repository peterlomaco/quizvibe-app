// Redirectar till /guess-who-demo (Hints demo) — sketch-demo ersatt av Hints-preview.
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function SketchDemoRedirect() {
  useEffect(() => {
    router.replace('/guess-who-demo');
  }, []);
  return null;
}
