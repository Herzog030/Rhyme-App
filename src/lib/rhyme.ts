import {
  assonanceKey,
  multiSyllableKey,
  phonemize,
  rhymeKey,
  rhymeNucleusIndex,
  isVowel,
} from './phonetics';

export type RhymeQuality = 'perfect' | 'rich' | 'multi' | 'assonance' | 'near';

export interface RhymeMatch {
  word: string;
  quality: RhymeQuality;
  /** Anzahl gemeinsamer Phoneme ab dem Reim-Nukleus. */
  score: number;
  /** Gemeinsame End-Phoneme (für Debug/Anzeige). */
  sharedSuffix: string;
  /** Anzahl gemeinsamer Silben am Ende. */
  syllables: number;
}

/** Gemeinsames Suffix zweier Phonem-Sequenzen zählen. */
function commonSuffixLength(a: string[], b: string[]): number {
  let i = 0;
  while (
    i < a.length &&
    i < b.length &&
    a[a.length - 1 - i] === b[b.length - 1 - i]
  ) {
    i++;
  }
  return i;
}

function countVowels(phonemes: string[]): number {
  let c = 0;
  for (const p of phonemes) if (isVowel(p)) c++;
  return c;
}

/**
 * Vergleicht zwei Wörter und liefert einen Reim-Match oder null,
 * wenn sie nicht reimen.
 */
export function compareWords(query: string, candidate: string): RhymeMatch | null {
  if (query.toLowerCase() === candidate.toLowerCase()) return null;

  const a = phonemize(query);
  const b = phonemize(candidate);
  if (a.length === 0 || b.length === 0) return null;

  const aNuc = rhymeNucleusIndex(a);
  const bNuc = rhymeNucleusIndex(b);
  if (aNuc === -1 || bNuc === -1) return null;

  const aTail = a.slice(aNuc);
  const bTail = b.slice(bNuc);

  // Exakter Reim (ab betontem Vokal identisch)?
  if (aTail.join('') === bTail.join('')) {
    const syl = Math.min(countVowels(aTail), countVowels(bTail));
    const quality: RhymeQuality =
      syl >= 2 ? 'multi' : aTail.length >= 3 ? 'rich' : 'perfect';
    return {
      word: candidate,
      quality,
      score: aTail.length * 2 + syl,
      sharedSuffix: aTail.join(''),
      syllables: syl,
    };
  }

  // Assonanz: Vokalfolge stimmt überein, aber Konsonanten nicht
  const aAss = assonanceKey(query);
  const bAss = assonanceKey(candidate);
  if (aAss.length >= 1 && aAss === bAss) {
    const shared = commonSuffixLength(a, b);
    return {
      word: candidate,
      quality: 'assonance',
      score: aAss.length + shared,
      sharedSuffix: a.slice(a.length - shared).join(''),
      syllables: aAss.length,
    };
  }

  // Unreiner Reim: zumindest gemeinsamer Vokal + Konsonant am Ende
  const shared = commonSuffixLength(a, b);
  if (shared >= 2) {
    const tailHasVowel = a.slice(a.length - shared).some((p) => isVowel(p));
    if (tailHasVowel) {
      return {
        word: candidate,
        quality: 'near',
        score: shared,
        sharedSuffix: a.slice(a.length - shared).join(''),
        syllables: countVowels(a.slice(a.length - shared)),
      };
    }
  }

  return null;
}

/**
 * Findet Reime auf `query` in einer gegebenen Wortliste.
 * Ergebnisse sind nach Qualität und Score sortiert.
 */
export function findRhymes(
  query: string,
  dictionary: Iterable<string>,
  options: {
    minSyllables?: number;
    includeAssonance?: boolean;
    includeNear?: boolean;
    limit?: number;
  } = {},
): RhymeMatch[] {
  const {
    minSyllables = 1,
    includeAssonance = true,
    includeNear = true,
    limit = 200,
  } = options;

  const matches: RhymeMatch[] = [];
  for (const word of dictionary) {
    const m = compareWords(query, word);
    if (!m) continue;
    if (m.syllables < minSyllables) continue;
    if (!includeAssonance && m.quality === 'assonance') continue;
    if (!includeNear && m.quality === 'near') continue;
    matches.push(m);
  }

  const qualityRank: Record<RhymeQuality, number> = {
    multi: 0,
    rich: 1,
    perfect: 2,
    assonance: 3,
    near: 4,
  };

  matches.sort((x, y) => {
    const qr = qualityRank[x.quality] - qualityRank[y.quality];
    if (qr !== 0) return qr;
    if (y.syllables !== x.syllables) return y.syllables - x.syllables;
    if (y.score !== x.score) return y.score - x.score;
    return x.word.localeCompare(y.word, 'de');
  });

  return matches.slice(0, limit);
}

/**
 * Gruppiert Matches nach Qualität.
 */
export function groupMatches(matches: RhymeMatch[]): Record<RhymeQuality, RhymeMatch[]> {
  const g: Record<RhymeQuality, RhymeMatch[]> = {
    multi: [],
    rich: [],
    perfect: [],
    assonance: [],
    near: [],
  };
  for (const m of matches) g[m.quality].push(m);
  return g;
}

/** Reim-Keys für Indizierung in IndexedDB. */
export function computeIndexKeys(word: string): {
  rhymeKey: string;
  doubleKey: string;
  tripleKey: string;
  assonance: string;
} {
  return {
    rhymeKey: rhymeKey(word),
    doubleKey: multiSyllableKey(word, 2),
    tripleKey: multiSyllableKey(word, 3),
    assonance: assonanceKey(word),
  };
}
