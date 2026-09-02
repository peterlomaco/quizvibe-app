// "New update"-signal för Waiting Invites — driver det blinkande guld-märket
// på Home:s "Join with Room Code"-knapp OCH i JoinModal:s "Join Waiting
// Invites"-rad. Exakt samma mönster som MyMatchesSection ("H2H") och
// CompetitionsButton ("Marathon"): en signatur över inbox:en jämförs mot en
// per-konto "sett"-snapshot i AsyncStorage, och signalen släcks när
// användaren öppnar Waiting Invites-listan (markInvitesSeen).
//
// Laddar inbox:en vid varje Home-focus + live via Realtime. Egen channel-namn
// (waiting_invites_signal:) så den inte krockar med JoinModal:s egen
// waiting_invites:-channel för samma user.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '../utils/supabase';
import { loadInvites, type WaitingInvite } from '../utils/waitingInvites';

// Per-user-namespacad (samma skäl som MyMatchesSection:s SEEN_KEY) så User A:s
// "sett" inte tystar signalen för User B på samma device.
const SEEN_KEY_PREFIX = '@quizvibe/waitingInvites/seen/v1/';

// Snapshot = de sedda invite-id:na, sorterade + |-joinade. Vi jämför per
// MEDLEMSKAP (finns en NUVARANDE invite som INTE är sedd?), inte via
// signatur-likhet: annars skulle det räcka att TA BORT en invite (deny/accept
// medan andra ligger kvar) för att signaturen ska skilja sig och märket felaktigt
// tändas igen. Invite-id:n är unika per skapelse (inv-timestamp-random), så en
// ny inbjudan får alltid ett osett id → tänder märket korrekt.
function idsOf(list: WaitingInvite[]): string {
  return list.map((i) => i.id).sort().join('|');
}

function toSet(snapshot: string | null): Set<string> {
  if (!snapshot) return new Set();
  return new Set(snapshot.split('|').filter(Boolean));
}

export interface WaitingInviteSignal {
  invites: WaitingInvite[];
  hasInvites: boolean;
  /** Minst en invite har anlänt sedan användaren senast öppnade listan. */
  hasNewInvite: boolean;
  /** Markera nuvarande invite-uppsättning som sedd → släcker signalen. */
  markInvitesSeen: () => void;
}

export function useWaitingInviteSignal(): WaitingInviteSignal {
  const [invites, setInvites] = useState<WaitingInvite[]>([]);
  // null = ännu inte namespace:at (ingen user-id / guest) → signalen hålls
  // tyst (hellre inget märke än ett som läcker mellan konton).
  const [seen, setSeen] = useState<string | null>(null);
  const seenKeyRef = useRef<string | null>(null);

  const reload = useCallback(async () => {
    const [{ data: userResp }, list] = await Promise.all([
      supabase.auth.getUser(),
      loadInvites(),
    ]);
    setInvites(list);
    const uid = userResp.user?.id;
    const key = uid ? `${SEEN_KEY_PREFIX}${uid}` : null;
    seenKeyRef.current = key;
    if (!key) {
      setSeen(null);
      return;
    }
    try {
      setSeen((await AsyncStorage.getItem(key)) ?? '');
    } catch {
      setSeen('');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Live: en ny invite (INSERT) tänder märket, en borttagen (DELETE — host
  // raderade lobby:n eller startade spelet) släcker det. Defensiv channel-
  // cleanup speglar JoinModal:s pattern (supabase.channel återanvänder
  // topic:en → stale subscribed channels måste rensas före .on()).
  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: userResp } = await supabase.auth.getUser();
      const uid = userResp.user?.id;
      if (!uid || cancelled) return;
      const topic = `realtime:waiting_invites_signal:${uid}`;
      supabase
        .getChannels()
        .filter((c) => c.topic === topic)
        .forEach((c) => supabase.removeChannel(c));
      const onChange = () => {
        void reload();
      };
      channel = supabase
        .channel(`waiting_invites_signal:${uid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'waiting_invites', filter: `to_user_id=eq.${uid}` },
          onChange,
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'waiting_invites', filter: `to_user_id=eq.${uid}` },
          onChange,
        )
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [reload]);

  const currentIds = idsOf(invites);
  const hasInvites = invites.length > 0;
  // seen === null → ännu inte namespace:at (guest/kall) → håll tyst.
  const hasNewInvite =
    hasInvites && seen !== null && invites.some((i) => !toSet(seen).has(i.id));

  const markInvitesSeen = useCallback(() => {
    setSeen(currentIds);
    const key = seenKeyRef.current;
    if (key) void AsyncStorage.setItem(key, currentIds).catch(() => {});
  }, [currentIds]);

  return { invites, hasInvites, hasNewInvite, markInvitesSeen };
}
