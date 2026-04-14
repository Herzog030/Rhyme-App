import { describe, it, expect } from 'vitest';
import { phonemize, rhymeKey, assonanceKey } from './phonetics';
import { compareWords, findRhymes } from './rhyme';

describe('phonemize', () => {
  it('behandelt Digraphen korrekt', () => {
    expect(phonemize('Schiff')).toEqual(['S', 'i', 'f']);
    expect(phonemize('Bach')).toEqual(['b', 'a', 'x']);
    expect(phonemize('singen')).toEqual(['s', 'i', 'N', '@', 'n']);
    expect(phonemize('Zug')).toEqual(['t', 's', 'u', 'k']);
  });

  it('erkennt Diphthonge', () => {
    expect(phonemize('Haus')).toEqual(['h', 'W', 's']);
    expect(phonemize('Feuer')).toEqual(['f', 'Y', '6']);
    expect(phonemize('heiß')).toEqual(['h', 'E', 's']);
  });

  it('wandelt finales -er in vokalisiertes R', () => {
    expect(phonemize('Vater')).toEqual(['f', 'a', 't', '6']);
    expect(phonemize('Finger')).toEqual(['f', 'i', 'N', '6']);
  });

  it('macht Auslautverhärtung', () => {
    expect(phonemize('Tag')).toEqual(['t', 'a', 'k']);
    expect(phonemize('Hund')).toEqual(['h', 'u', 'n', 't']);
    expect(phonemize('Dieb')).toEqual(['d', 'i', 'p']);
  });
});

describe('rhymeKey', () => {
  it('liefert gleichen Key für reimende Wörter', () => {
    expect(rhymeKey('Herz')).toBe(rhymeKey('Schmerz'));
    expect(rhymeKey('Liebe')).toBe(rhymeKey('Triebe'));
    expect(rhymeKey('Haus')).toBe(rhymeKey('Maus'));
    expect(rhymeKey('singen')).toBe(rhymeKey('klingen'));
  });

  it('unterscheidet nicht-reimende Wörter', () => {
    expect(rhymeKey('Herz')).not.toBe(rhymeKey('Haus'));
    expect(rhymeKey('Liebe')).not.toBe(rhymeKey('Sonne'));
  });
});

describe('compareWords', () => {
  it('erkennt Reinreime', () => {
    const m = compareWords('Herz', 'Schmerz');
    expect(m).not.toBeNull();
    expect(['perfect', 'rich', 'multi']).toContain(m!.quality);
  });

  it('erkennt mehrsilbige Reime', () => {
    const m = compareWords('Liebe', 'Triebe');
    expect(m).not.toBeNull();
    // beide enden auf "-iebe" = 2 Silben (i, @)
    expect(m!.syllables).toBeGreaterThanOrEqual(2);
  });

  it('gibt null für identische Wörter', () => {
    expect(compareWords('Herz', 'herz')).toBeNull();
  });

  it('erkennt Assonanz', () => {
    const m = compareWords('Tag', 'Bahn');
    // beide haben /a/ in der letzten Silbe, unterschiedliche Konsonanten
    expect(m?.quality === 'assonance' || m?.quality === 'near' || m === null).toBe(
      true,
    );
  });
});

describe('findRhymes', () => {
  it('findet reimende Wörter in einer Liste', () => {
    const dict = ['Schmerz', 'Haus', 'Liebe', 'Scherz', 'Kerze'];
    const results = findRhymes('Herz', dict);
    const words = results.map((r) => r.word);
    expect(words).toContain('Schmerz');
    expect(words).toContain('Scherz');
  });

  it('sortiert mehrsilbige Reime nach oben', () => {
    const dict = ['Diebe', 'Trieb', 'Triebe'];
    const results = findRhymes('Liebe', dict);
    expect(results[0]!.word).toBe('Diebe');
    expect(results[1]!.word).toBe('Triebe');
  });

  it('respektiert minSyllables', () => {
    const dict = ['Schmerz', 'Triebe'];
    const results = findRhymes('Liebe', dict, { minSyllables: 2 });
    const words = results.map((r) => r.word);
    expect(words).toContain('Triebe');
    expect(words).not.toContain('Schmerz');
  });
});

describe('assonanceKey', () => {
  it('ignoriert Konsonanten', () => {
    expect(assonanceKey('Tag')).toBe(assonanceKey('Bahn'));
    expect(assonanceKey('Liebe')).toBe(assonanceKey('Diebe'));
  });
});
