import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Dubbeltrycks-skydd + spinner-state för knappar som väntar på backend.
 *
 *   const action = useAsyncAction();
 *   onPress={() => action.run('join', handleJoin)}
 *   <LoadingContent loading={action.isBusy('join')} ...>
 *
 * Bara EN action åt gången per hook-instans: ett andra tryck (på samma eller
 * en annan knapp i samma formulär) medan något är i luften ignoreras. Låset
 * är en ref (synkron) så två tryck i samma frame aldrig båda slinker igenom;
 * state:t finns bara för renderingen. Ingen artificiell fördröjning —
 * spinnern försvinner i samma ögonblick som handlern returnerar.
 */
export function useAsyncAction() {
  const lockRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (key: string, fn: () => unknown) => {
    if (lockRef.current) return;
    lockRef.current = key;
    setBusyKey(key);
    try {
      await fn();
    } finally {
      lockRef.current = null;
      if (mountedRef.current) setBusyKey(null);
    }
  }, []);

  const isBusy = useCallback((key: string) => busyKey === key, [busyKey]);

  return { run, isBusy, busy: busyKey !== null, busyKey };
}
