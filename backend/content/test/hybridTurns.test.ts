// Multiplayer v2 Step 4 — hybrid 1 by 1 pure helpers.
import { describe, it, expect } from 'vitest';
import {
  acceptsHybridScore,
  allTurnsResolved,
  hybridRole,
  mergeServerResults,
  missingScoreDue,
  parseOwnDeviceIds,
  turnOwner,
  turnOwnerIndex,
  HYBRID_MISSING_SCORE_GRACE_MS,
  type TurnResultRow,
} from '../../../src/utils/hybridTurns';

const order = [{ id: '1' }, { id: 'kimmo' }, { id: 'guest' }];
const own = new Set(['kimmo']);

describe('turn ownership', () => {
  it('rotates like PtP: question N → turnOrder[N % n]', () => {
    expect([0, 1, 2, 3, 4].map((q) => turnOwner(order, q)?.id)).toEqual(['1', 'kimmo', 'guest', '1', 'kimmo']);
    expect(turnOwnerIndex(5, 0)).toBe(0);
  });
});

describe('hybridRole', () => {
  it('host answers its own and host-device turns, watches own-device turns', () => {
    expect(hybridRole({ isHost: true, selfPlayerId: '', ownerId: '1', ownDeviceIds: own })).toBe('answer');
    expect(hybridRole({ isHost: true, selfPlayerId: '', ownerId: 'guest', ownDeviceIds: own })).toBe('answer');
    expect(hybridRole({ isHost: true, selfPlayerId: '', ownerId: 'kimmo', ownDeviceIds: own })).toBe('watch');
  });
  it('own-device participant answers only its own turn', () => {
    expect(hybridRole({ isHost: false, selfPlayerId: 'kimmo', ownerId: 'kimmo', ownDeviceIds: own })).toBe('answer');
    expect(hybridRole({ isHost: false, selfPlayerId: 'kimmo', ownerId: '1', ownDeviceIds: own })).toBe('watch');
    expect(hybridRole({ isHost: false, selfPlayerId: 'kimmo', ownerId: 'guest', ownDeviceIds: own })).toBe('watch');
  });
  it('unknown owner never lets a non-host answer', () => {
    expect(hybridRole({ isHost: false, selfPlayerId: 'kimmo', ownerId: undefined, ownDeviceIds: own })).toBe('watch');
  });
});

describe('acceptsHybridScore', () => {
  it('only the turn owner may score a question', () => {
    expect(acceptsHybridScore('kimmo', 1, order)).toBe(true);
    expect(acceptsHybridScore('kimmo', 0, order)).toBe(false);
    expect(acceptsHybridScore('guest', 2, order)).toBe(true);
  });
});

describe('missingScoreDue', () => {
  it('fires only after the grace period', () => {
    expect(missingScoreDue(1000, 1000 + HYBRID_MISSING_SCORE_GRACE_MS - 1)).toBe(false);
    expect(missingScoreDue(1000, 1000 + HYBRID_MISSING_SCORE_GRACE_MS)).toBe(true);
    expect(missingScoreDue(0, 99999)).toBe(false);
  });
});

const row = (q: number, player: string, correct: boolean, extra: Partial<TurnResultRow> = {}): TurnResultRow => ({
  question_index: q,
  player_id: player,
  points: correct ? 1 : 0,
  correct,
  time_used: 5,
  answer: null,
  connection_error: false,
  ...extra,
});

describe('server-confirmed results', () => {
  it('allTurnsResolved needs a row for every question', () => {
    expect(allTurnsResolved([row(0, '1', true), row(1, 'kimmo', false)], 2)).toBe(true);
    expect(allTurnsResolved([row(0, '1', true)], 2)).toBe(false);
    expect(allTurnsResolved([], 0)).toBe(false);
  });

  it('host "No answer" replaces a late real answer on the owner device', () => {
    const local = [
      [{ playerId: '1', points: 1, correct: true, timeUsed: 3, questionIndex: 0 }],
      [{ playerId: 'kimmo', points: 1, correct: true, timeUsed: 9, questionIndex: 1, answer: '1985' }],
    ];
    const merged = mergeServerResults(local, [
      row(0, '1', true),
      row(1, 'kimmo', false, { connection_error: true, time_used: 30 }),
    ]);
    const q1 = merged.flat().filter((s) => s.questionIndex === 1);
    expect(q1).toHaveLength(1);
    expect(q1[0]).toMatchObject({ playerId: 'kimmo', correct: false, connectionError: true });
  });

  it('keeps entries for undecided questions and dedupes decided ones', () => {
    const local = [
      [{ playerId: '1', points: 1, correct: true, timeUsed: 3, questionIndex: 0 }],
      [{ playerId: '1', points: 1, correct: true, timeUsed: 3, questionIndex: 0 }],
      [{ playerId: 'kimmo', points: 0, correct: false, timeUsed: 4, questionIndex: 1 }],
    ];
    const merged = mergeServerResults(local, [row(0, '1', true)]);
    expect(merged.flat().filter((s) => s.questionIndex === 0)).toHaveLength(1);
    expect(merged.flat().filter((s) => s.questionIndex === 1)).toHaveLength(1);
  });
});

describe('parseOwnDeviceIds', () => {
  it('parses the quiz param tolerantly', () => {
    expect([...parseOwnDeviceIds('["kimmo","x"]')]).toEqual(['kimmo', 'x']);
    expect(parseOwnDeviceIds('nope').size).toBe(0);
    expect(parseOwnDeviceIds(undefined).size).toBe(0);
  });
});

import { DELETED_TURN_PLAYER_ID } from '../../../src/utils/hybridTurns';

describe('deleted turns (owner left the game)', () => {
  it('count as resolved but give no score to anyone', () => {
    const rows = [row(0, '1', true), row(1, DELETED_TURN_PLAYER_ID, false)];
    expect(allTurnsResolved(rows, 2)).toBe(true);
    const merged = mergeServerResults(
      [[{ playerId: 'kimmo', points: 0, correct: false, timeUsed: 30, questionIndex: 1 }]],
      rows,
    );
    expect(merged.flat().some((s) => s.questionIndex === 1)).toBe(false);
    expect(merged.flat().some((s) => s.playerId === DELETED_TURN_PLAYER_ID)).toBe(false);
  });
});
