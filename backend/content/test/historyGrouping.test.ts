import { describe, expect, it } from 'vitest';

/**
 * Två-nivå-gruppering + spelform-resolver för Marathon-/spelhistorik-listorna
 * (SavedAggregatesCard + PlayerHistorySection). Ligger i backend-sviten (repots
 * enda vitest-harness) men testar klient-modulen under src/utils. Modulen är
 * helt ren (inga imports), så ingen mock behövs.
 */
import {
  GAME_FORM_ORDER,
  groupHistory,
  monthKeyForDate,
  monthLabelForKey,
  resolveGameForm,
  type GroupAccessors,
} from '../../../src/utils/historyGrouping';

interface Item {
  id: string;
  host?: string;
  hostId?: string;
  name?: string;
  date?: string;
  gameMode?: string;
  single?: boolean;
}

const acc: GroupAccessors<Item> = {
  getHostName: (i) => i.host,
  getHostUserId: (i) => i.hostId,
  getName: (i) => i.name,
  getDateISO: (i) => i.date,
  getGameForm: (i) => resolveGameForm(i.gameMode, i.single),
};

describe('resolveGameForm', () => {
  it('singlePlayerDefault vinner över gameMode', () => {
    expect(resolveGameForm('pass-the-phone', true).key).toBe('single-player');
    expect(resolveGameForm('individual-devices', true).key).toBe('single-player');
  });

  it('mappar pass-the-phone och individual-devices', () => {
    expect(resolveGameForm('pass-the-phone', false)).toEqual({
      key: 'pass-the-phone',
      label: 'Pass-the-Phone',
    });
    expect(resolveGameForm('individual-devices').key).toBe('individual-devices');
  });

  it('okänt / saknat / remote-1v1 → Unknown mode', () => {
    expect(resolveGameForm(undefined, undefined).key).toBe('unknown');
    expect(resolveGameForm(null, null).key).toBe('unknown');
    expect(resolveGameForm('remote-1v1').key).toBe('unknown');
    expect(resolveGameForm('garbage-value').key).toBe('unknown');
    expect(resolveGameForm(undefined, undefined).label).toBe('Unknown mode');
  });

  it('GAME_FORM_ORDER har unknown sist', () => {
    expect(GAME_FORM_ORDER[GAME_FORM_ORDER.length - 1]).toBe('unknown');
  });
});

describe('month helpers', () => {
  it('monthKeyForDate ger YYYY-MM och unknown för skräp', () => {
    expect(monthKeyForDate('2026-05-18T10:00:00.000Z')).toBe('2026-05');
    expect(monthKeyForDate('not-a-date')).toBe('unknown');
  });

  it('monthLabelForKey ger "Month Year"', () => {
    expect(monthLabelForKey('2026-05')).toBe('May 2026');
    expect(monthLabelForKey('unknown')).toBe('unknown');
  });
});

describe('groupHistory — host mode', () => {
  it('grupperar per host, alfabetiskt, Unknown host sist', () => {
    const items: Item[] = [
      { id: '1', host: 'Zoe', gameMode: 'pass-the-phone' },
      { id: '2', host: 'Anna', gameMode: 'individual-devices' },
      { id: '3', gameMode: 'pass-the-phone' }, // ingen host
      { id: '4', host: 'Anna', gameMode: 'pass-the-phone' },
    ];
    const groups = groupHistory(items, 'host', acc);
    expect(groups.map((g) => g.l1Label)).toEqual(['Anna', 'Zoe', 'Unknown host']);
    // Anna har två spel, olika spelform → två level-2-grupper.
    const anna = groups[0];
    expect(anna.forms.map((f) => f.formKey)).toEqual([
      'pass-the-phone',
      'individual-devices',
    ]);
    expect(anna.forms[0].items.map((i) => i.id)).toEqual(['4']);
  });
});

describe('groupHistory — host mode, self first', () => {
  it('pinnar egen host (selfUserId) överst, resten alfabetiskt, Unknown sist', () => {
    const items: Item[] = [
      { id: '1', host: 'Anna', hostId: 'u-anna', gameMode: 'pass-the-phone' },
      { id: '2', host: 'Zoe', hostId: 'u-zoe', gameMode: 'pass-the-phone' },
      { id: '3', gameMode: 'pass-the-phone' }, // ingen host
      { id: '4', host: 'Mia', hostId: 'u-mia', gameMode: 'pass-the-phone' },
    ];
    // Jag = Zoe (alfabetiskt sist bland namnen) → ska ändå hamna först.
    const groups = groupHistory(items, 'host', acc, 'u-zoe');
    expect(groups.map((g) => g.l1Label)).toEqual([
      'Zoe',
      'Anna',
      'Mia',
      'Unknown host',
    ]);
  });

  it('utan selfUserId-match → ren alfabetisk (bakåtkompatibelt)', () => {
    const items: Item[] = [
      { id: '1', host: 'Zoe', hostId: 'u-zoe', gameMode: 'pass-the-phone' },
      { id: '2', host: 'Anna', hostId: 'u-anna', gameMode: 'pass-the-phone' },
    ];
    expect(groupHistory(items, 'host', acc).map((g) => g.l1Label)).toEqual([
      'Anna',
      'Zoe',
    ]);
    expect(
      groupHistory(items, 'host', acc, 'u-nobody').map((g) => g.l1Label),
    ).toEqual(['Anna', 'Zoe']);
  });
});

describe('groupHistory — name mode', () => {
  it('grupperar per tabellnamn, alfabetiskt, Unnamed sist', () => {
    const items: Item[] = [
      { id: '1', name: 'Zeta Cup', gameMode: 'pass-the-phone' },
      { id: '2', name: 'Alpha League', gameMode: 'individual-devices' },
      { id: '3', gameMode: 'pass-the-phone' }, // saknar namn
    ];
    const groups = groupHistory(items, 'name', acc);
    expect(groups.map((g) => g.l1Label)).toEqual([
      'Alpha League',
      'Zeta Cup',
      'Unnamed',
    ]);
  });
});

describe('groupHistory — date mode', () => {
  it('grupperar per månad, nyast först, Unknown date sist', () => {
    const items: Item[] = [
      { id: 'a', date: '2026-05-18T10:00:00Z', gameMode: 'pass-the-phone' },
      { id: 'b', date: '2026-06-01T10:00:00Z', gameMode: 'pass-the-phone' },
      { id: 'c', date: 'garbage', gameMode: 'pass-the-phone' },
      { id: 'd', date: '2026-05-02T10:00:00Z', single: true },
    ];
    const groups = groupHistory(items, 'date', acc);
    expect(groups.map((g) => g.l1Label)).toEqual([
      'June 2026',
      'May 2026',
      'Unknown date',
    ]);
    // May har två spelformer i fast ordning (single-player före pass-the-phone).
    const may = groups[1];
    expect(may.forms.map((f) => f.formKey)).toEqual([
      'single-player',
      'pass-the-phone',
    ]);
  });

  it('släng tomma spelform-hinkar + bevara leaf-ordning', () => {
    const items: Item[] = [
      { id: 'x', date: '2026-05-03T10:00:00Z', gameMode: 'individual-devices' },
      { id: 'y', date: '2026-05-01T10:00:00Z', gameMode: 'individual-devices' },
    ];
    const groups = groupHistory(items, 'date', acc);
    expect(groups).toHaveLength(1);
    expect(groups[0].forms).toHaveLength(1);
    expect(groups[0].forms[0].formKey).toBe('individual-devices');
    // Inkommande ordning bevaras (x före y).
    expect(groups[0].forms[0].items.map((i) => i.id)).toEqual(['x', 'y']);
  });

  it('tom input → tom output', () => {
    expect(groupHistory([], 'date', acc)).toEqual([]);
    expect(groupHistory([], 'host', acc)).toEqual([]);
  });
});
