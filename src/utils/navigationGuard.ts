/**
 * Global navigations-guard för vyer som kan ha osparade ändringar.
 *
 * BottomBanner lever i app/_layout.tsx utanför skärm-trädet och kan därför
 * inte nå en skärms egen guardedNavigate. En skärm som har osparade
 * ändringar (i dag Profile) registrerar sin guard här när den får fokus och
 * avregistrerar den när den tappar fokus; BottomBanner kör sin navigation
 * genom runWithNavigationGuard så samma "Unsaved changes"-popup visas.
 */
type Guard = (navigate: () => void) => void;

let currentGuard: Guard | null = null;

/** Registrerar en guard. Returnerar en funktion som avregistrerar just den. */
export function setNavigationGuard(guard: Guard): () => void {
  currentGuard = guard;
  return () => {
    if (currentGuard === guard) currentGuard = null;
  };
}

/** Kör navigate via den registrerade guarden, eller direkt om ingen finns. */
export function runWithNavigationGuard(navigate: () => void): void {
  if (currentGuard) currentGuard(navigate);
  else navigate();
}
