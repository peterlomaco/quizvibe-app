import { describe, expect, it } from 'vitest';

/**
 * Competition-rematchens settings-reuse (migration 0043). Låser att en
 * re-match/replay via Home → Competitions återanvänder SENASTE spelets
 * inställningar i stället för host:ens profil-defaults.
 *
 * Ligger i backend-sviten (repots enda vitest-harness) men testar
 * klient-modulen under src/utils. Modulen är ren (bara `import type` från de
 * Supabase-kopplade modulerna + mainCategory), så ingen mock behövs.
 */
import {
  buildRematchSettings,
  isGameSettings,
  pickLatestGameSettings,
  type RematchSettingsInput,
} from '../../../src/utils/competitionRematchSettings';
import type { AggregateGameSettings } from '../../../src/utils/aggregateLeaderboards';

const SNAPSHOT: AggregateGameSettings = {
  eraFrom: 1985,
  eraTo: 1999,
  roundsCount: 12,
  answerResponseSeconds: 45,
  youtubeEnabledCategories: ['Music', 'Film'],
  imagesEnabledCategories: ['Sport'],
  selectedExtraPackages: ['pkg-hiphop'],
  parentControlEnabled: true,
  spotifyEnabled: true,
};

const PROFILE_DEFAULTS: RematchSettingsInput = {
  eraFrom: 1970,
  eraTo: 2020,
  roundsCount: 4,
  answerResponseSeconds: 30,
  region: 'Sweden',
};

describe('buildRematchSettings — reuse of the last game settings', () => {
  it('reuses the snapshot over profile defaults for all content fields', () => {
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: SNAPSHOT }, 12);
    expect(s.eraFrom).toBe(1985);
    expect(s.eraTo).toBe(1999);
    expect(s.roundsCount).toBe(12);
    expect(s.answerResponseSeconds).toBe(45);
    expect(s.selectedExtraPackages).toEqual(['pkg-hiphop']);
    expect(s.youtubeEnabledCategories).toEqual(['Music', 'Film']);
    expect(s.imagesEnabledCategories).toEqual(['Sport']);
    expect(s.spotifyEnabled).toBe(true);
  });

  it('keeps structural fields derived from lobby type, never from the snapshot', () => {
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: SNAPSHOT }, 12);
    // Multi är alltid Individual Devices; en PtP-snapshot får aldrig läcka in.
    expect(s.gameMode).toBe('individual-devices');
    expect(s.singlePlayerDefault).toBe(false);
    expect(s.maxPlayers).toBe(12);
    // Parent Control bärs som URL-param, ALDRIG via denna blob.
    expect(s.parentControlEnabled).toBe(false);
  });

  it('falls back to profile defaults when there is no snapshot', () => {
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: null }, 4);
    expect(s.eraFrom).toBe(1970);
    expect(s.eraTo).toBe(2020);
    expect(s.roundsCount).toBe(4);
    expect(s.answerResponseSeconds).toBe(30);
    expect(s.selectedExtraPackages).toEqual([]);
    expect(s.spotifyEnabled).toBe(false);
    // MUSIC-ONLY LAUNCH: default är bara Music (Film/Sport parkerade).
    expect(s.youtubeEnabledCategories).toEqual(['Music']);
  });

  it('ignores an invalid answer-response value from the snapshot', () => {
    const bad = { ...SNAPSHOT, answerResponseSeconds: 999 as unknown as number };
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: bad }, 4);
    expect(s.answerResponseSeconds).toBe(30); // faller på profil-defaulten
  });

  it('drops non-catalog categories and falls back to Music-only when empty', () => {
    const weird = {
      ...SNAPSHOT,
      youtubeEnabledCategories: ['Music', 'Bogus'],
      imagesEnabledCategories: ['Nope'],
    };
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: weird }, 4);
    expect(s.youtubeEnabledCategories).toEqual(['Music']);
    // MUSIC-ONLY LAUNCH: alla ogiltiga → fallback till Music (ej alla tre).
    expect(s.imagesEnabledCategories).toEqual(['Music']);
  });

  it('honors an explicitly-empty images array (Hints turned off last game)', () => {
    // Tom array = källan medvetet AV — får INTE substitueras med alla-3.
    const hintsOff = { ...SNAPSHOT, imagesEnabledCategories: [] as string[] };
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: hintsOff }, 4);
    expect(s.imagesEnabledCategories).toEqual([]);
    // YouTube-kolumnen orörd.
    expect(s.youtubeEnabledCategories).toEqual(['Music', 'Film']);
  });

  it('honors an explicitly-empty youtube array (YouTube turned off last game)', () => {
    const ytOff = { ...SNAPSHOT, youtubeEnabledCategories: [] as string[] };
    const s = buildRematchSettings({ ...PROFILE_DEFAULTS, settings: ytOff }, 4);
    expect(s.youtubeEnabledCategories).toEqual([]);
    // Hints-kolumnen orörd.
    expect(s.imagesEnabledCategories).toEqual(['Sport']);
  });
});

describe('pickLatestGameSettings — newest valid snapshot wins', () => {
  it('picks the game with the max played_at that has a valid snapshot', () => {
    const older: AggregateGameSettings = { ...SNAPSHOT, roundsCount: 6 };
    const newer: AggregateGameSettings = { ...SNAPSHOT, roundsCount: 20 };
    const picked = pickLatestGameSettings([
      { played_at: '2026-08-01T10:00:00Z', settings: older },
      { played_at: '2026-08-10T10:00:00Z', settings: newer },
      { played_at: '2026-08-05T10:00:00Z', settings: null }, // äldre klient, ignoreras
    ]);
    expect(picked?.roundsCount).toBe(20);
  });

  it('skips games without a snapshot and returns null when none has one', () => {
    expect(
      pickLatestGameSettings([
        { played_at: '2026-08-01T10:00:00Z', settings: null },
        { played_at: '2026-08-02T10:00:00Z' },
      ]),
    ).toBeNull();
  });

  it('handles rows without played_at (treats as epoch 0)', () => {
    const picked = pickLatestGameSettings([
      { settings: SNAPSHOT },
      { played_at: '2026-08-10T10:00:00Z', settings: { ...SNAPSHOT, roundsCount: 2 } },
    ]);
    expect(picked?.roundsCount).toBe(2);
  });
});

describe('isGameSettings — shape guard for untrusted jsonb', () => {
  it('accepts a well-formed snapshot', () => {
    expect(isGameSettings(SNAPSHOT)).toBe(true);
  });
  it('rejects null / non-objects / missing numeric fields', () => {
    expect(isGameSettings(null)).toBe(false);
    expect(isGameSettings('nope')).toBe(false);
    expect(isGameSettings({ eraFrom: 1985 })).toBe(false);
    expect(isGameSettings({ ...SNAPSHOT, roundsCount: '12' })).toBe(false);
  });
});
