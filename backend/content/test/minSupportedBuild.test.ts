import { describe, expect, it } from 'vitest';
import {
  isBuildSupported,
  nextConfirmedMin,
  parseMinBuildConfig,
  parseMinBuildMessage,
  parseNativeBuild,
} from '../../../src/utils/minSupportedBuildCore';

// Forced-update gate (Build 41, 2026-11-26) — pure rules.

describe('parseMinBuildConfig', () => {
  it('reads a positive integer ios value', () => {
    expect(parseMinBuildConfig({ ios: 41 })).toBe(41);
    expect(parseMinBuildConfig({ ios: '41' })).toBe(41);
  });
  it('no or invalid requirement → null', () => {
    for (const v of [null, undefined, {}, { ios: 0 }, { ios: -1 }, { ios: 4.5 }, { ios: 'x' }, { android: 9 }, 41, 'ios'])
      expect(parseMinBuildConfig(v)).toBeNull();
  });
  it('optional message', () => {
    expect(parseMinBuildMessage({ ios: 41, message: '  Please update ' })).toBe('Please update');
    expect(parseMinBuildMessage({ ios: 41, message: ' ' })).toBeNull();
    expect(parseMinBuildMessage({ ios: 41 })).toBeNull();
  });
});

describe('parseNativeBuild', () => {
  it('parses CFBundleVersion strings', () => {
    expect(parseNativeBuild('40')).toBe(40);
    expect(parseNativeBuild(' 41 ')).toBe(41);
    expect(parseNativeBuild(41)).toBe(41);
  });
  it('Expo Go / dev / odd values → null', () => {
    for (const v of [null, undefined, '', '1.0.1', '41a', '0'])
      expect(parseNativeBuild(v as string | null | undefined)).toBeNull();
  });
});

describe('isBuildSupported', () => {
  it('blocks only a known build below a known minimum', () => {
    expect(isBuildSupported(40, 41)).toBe(false);
    expect(isBuildSupported(41, 41)).toBe(true);
    expect(isBuildSupported(42, 41)).toBe(true);
  });
  it('fails open', () => {
    expect(isBuildSupported(null, 41)).toBe(true);
    expect(isBuildSupported(40, null)).toBe(true);
  });
});

describe('nextConfirmedMin (cache semantics)', () => {
  it('a failed fetch keeps the last confirmed requirement', () => {
    expect(nextConfirmedMin(41, { kind: 'error' })).toBe(41);
    expect(nextConfirmedMin(null, { kind: 'error' })).toBeNull();
  });
  it('a successful fetch without a requirement clears it', () => {
    expect(nextConfirmedMin(41, { kind: 'ok', value: null })).toBeNull();
    expect(nextConfirmedMin(41, { kind: 'ok', value: {} })).toBeNull();
  });
  it('a successful fetch replaces the requirement', () => {
    expect(nextConfirmedMin(null, { kind: 'ok', value: { ios: 41 } })).toBe(41);
    expect(nextConfirmedMin(41, { kind: 'ok', value: { ios: 42 } })).toBe(42);
  });
});
