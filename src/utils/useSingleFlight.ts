import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

// Single-flight-spärr för async-knappar (Peter 2026-10-15: dubbeltryck skapade
// två lobbys, gav dubbla Register-popups, kunde dra två credits).
//
// Varför en REF och inte bara state: två tryck i samma frame läser båda samma
// gamla state-värde och passerar en state-baserad guard. Ref:en sätts synkront
// i första trycket, så tryck nummer två studsar direkt.
//
// Kontrakt för fn:
//   - returnerar `false` (eller kastar) = flödet AVBRÖTS (credit-Alert, Cancel,
//     valideringsfel) → spärren släpps direkt så användaren kan försöka igen.
//   - returnerar något annat = flödet LYCKADES (typiskt navigerade). Spärren
//     hålls då kvar (`holdAfterSuccess`), så ett tryck under slide-out-
//     animationen eller innan skärmen unmountas aldrig kan starta flödet en
//     gång till. Den släpps när skärmen får fokus igen, vid unmount, eller
//     efter `holdMs` som skyddsnät om navigeringen inte blev av.
//   - `holdAfterSuccess: false` → släpps direkt även vid lyckat flöde (knappar
//     som inte navigerar, t.ex. Register Confirm där modalen står kvar).
export type SingleFlightRun = <T>(
  fn: () => Promise<T> | T,
  opts?: { key?: string; holdAfterSuccess?: boolean },
) => Promise<T | undefined>;

const DEFAULT_HOLD_MS = 5000;

export function useSingleFlight(holdMs: number = DEFAULT_HOLD_MS) {
  const inFlightRef = useRef(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const release = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    inFlightRef.current = false;
    if (mountedRef.current) setBusyKey(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  // Skärmen fick fokus igen (t.ex. Back från lobbyn) → knapparna ska fungera.
  useFocusEffect(
    useCallback(() => {
      if (inFlightRef.current && !holdTimerRef.current) return;
      release();
    }, [release]),
  );

  const run: SingleFlightRun = useCallback(
    async (fn, opts) => {
      if (inFlightRef.current) return undefined;
      inFlightRef.current = true;
      setBusyKey(opts?.key ?? 'default');
      let result;
      try {
        result = await fn();
      } catch (e) {
        release();
        console.warn('[useSingleFlight] action failed', e);
        return undefined;
      }
      if (result === false || opts?.holdAfterSuccess === false) {
        release();
      } else {
        // Behåll spärren; skyddsnät om navigeringen aldrig blev av.
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        holdTimerRef.current = setTimeout(release, holdMs);
      }
      return result;
    },
    [release, holdMs],
  );

  return { run, busy: busyKey !== null, busyKey, release, isInFlight: () => inFlightRef.current };
}
