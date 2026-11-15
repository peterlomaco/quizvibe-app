// Tester för parseRoomCode (Paste code i Join with Room Code). Testar
// klient-utilen under src/utils (repots enda vitest-harness ligger här).

import { describe, it, expect } from 'vitest';
import { parseRoomCode } from '../../../src/utils/roomCode';

describe('parseRoomCode', () => {
  it('accepterar kanonisk kod', () => {
    expect(parseRoomCode('AB23XY')).toBe('AB23XY');
  });
  it('normaliserar gemener', () => {
    expect(parseRoomCode('ab23xy')).toBe('AB23XY');
  });
  it('accepterar bindestreck och mellanslag', () => {
    expect(parseRoomCode('AB-23-XY')).toBe('AB23XY');
    expect(parseRoomCode('AB 23 XY')).toBe('AB23XY');
    expect(parseRoomCode('  ab-23-xy \n')).toBe('AB23XY');
  });
  it('avvisar otillåtna bokstäver (O, I)', () => {
    expect(parseRoomCode('AO23XY')).toBeNull();
    expect(parseRoomCode('AB23XI')).toBeNull();
  });
  it('avvisar blockerade bokstavspar', () => {
    expect(parseRoomCode('SS23XY')).toBeNull();
    expect(parseRoomCode('AB23SS')).toBeNull();
  });
  it('avvisar ofullständig eller felformad kod', () => {
    expect(parseRoomCode('')).toBeNull();
    expect(parseRoomCode('AB23X')).toBeNull();
    expect(parseRoomCode('AB23XYZ')).toBeNull();
    expect(parseRoomCode('A1B2CD')).toBeNull();
    expect(parseRoomCode('AB2XYZ')).toBeNull();
    expect(parseRoomCode('AB.23.XY')).toBeNull();
  });
  it('söker inte efter kod i annan text', () => {
    expect(parseRoomCode('Join AB23XY')).toBeNull();
    expect(parseRoomCode('Code: AB-23-XY')).toBeNull();
  });
});
