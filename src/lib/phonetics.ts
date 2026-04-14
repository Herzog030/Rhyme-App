/**
 * Vereinfachte deutsche Phonetisierung für die Reim-Erkennung.
 *
 * Ziele:
 *  - Rechtschreibung → lautliche Repräsentation
 *    (ausreichend genau, um Reime zu erkennen – kein vollständiger IPA-Konverter)
 *  - Umgang mit Digraphen: ch, sch, ck, ng, qu, ph, ie, ei, eu, äu, au
 *  - Auslautverhärtung: b→p, d→t, g→k am Wort-/Silbenende
 *  - Schwa-Behandlung: finales "e" und Endungen -en, -er, -el
 *  - Umlaute und ß bleiben erhalten (separate Laute)
 *
 * Die Ausgabe ist eine eigene, kompakte Laut-Notation (keine IPA), die
 * sich gut für Suffix-Matching eignet.
 */

export type Phoneme = string;

/** Vokale in der internen Notation (einschl. Diphthonge & Umlaute). */
export const VOWELS = new Set<Phoneme>([
  'a',
  'e',
  'i',
  'o',
  'u',
  'A', // "ä"
  'O', // "ö"
  'U', // "ü"
  'Y', // Diphthong "eu/äu" → wie [ɔʏ]
  'E', // Diphthong "ei/ai/ay/ey" → wie [aɪ]
  'W', // Diphthong "au" → wie [aʊ]
  '@', // Schwa (z.B. "-e", "-en")
  '6', // vokalisiertes R (z.B. "-er")
]);

export function isVowel(p: Phoneme): boolean {
  return VOWELS.has(p);
}

/**
 * Wandelt ein deutsches Wort in eine Folge vereinfachter Phoneme um.
 * Keine Trennzeichen – die Ausgabe ist ein String aus Lautsymbolen.
 */
export function phonemize(word: string): Phoneme[] {
  const w = word.toLowerCase().trim();
  const out: Phoneme[] = [];
  let i = 0;
  const n = w.length;

  const peek = (offset = 0, len = 1) => w.slice(i + offset, i + offset + len);

  while (i < n) {
    const c = w[i];
    const c2 = peek(0, 2);
    const c3 = peek(0, 3);

    // --- Trigraphen ---
    if (c3 === 'sch') {
      out.push('S');
      i += 3;
      continue;
    }
    if (c3 === 'tsch') {
      // wird ohnehin nie getroffen (4 chars), aber zur Klarheit:
      out.push('t', 'S');
      i += 4;
      continue;
    }

    // --- Digraphen ---
    if (c2 === 'ch') {
      // ch wird als eigener Laut behandelt (ich-/ach-Laut zusammengefasst)
      out.push('x');
      i += 2;
      continue;
    }
    if (c2 === 'ck') {
      out.push('k');
      i += 2;
      continue;
    }
    if (c2 === 'ng') {
      out.push('N'); // velarer Nasal
      i += 2;
      continue;
    }
    if (c2 === 'nk') {
      out.push('N', 'k');
      i += 2;
      continue;
    }
    if (c2 === 'ph') {
      out.push('f');
      i += 2;
      continue;
    }
    if (c2 === 'qu') {
      out.push('k', 'v');
      i += 2;
      continue;
    }
    if (c2 === 'pf') {
      out.push('p', 'f');
      i += 2;
      continue;
    }
    if (c2 === 'ts' || c === 'z') {
      out.push('t', 's');
      i += c === 'z' ? 1 : 2;
      continue;
    }
    if (c2 === 'tz') {
      out.push('t', 's');
      i += 2;
      continue;
    }

    // --- Diphthonge ---
    if (c2 === 'ei' || c2 === 'ai' || c2 === 'ay' || c2 === 'ey') {
      out.push('E');
      i += 2;
      continue;
    }
    if (c2 === 'eu' || c2 === 'äu') {
      out.push('Y');
      i += 2;
      continue;
    }
    if (c2 === 'au') {
      out.push('W');
      i += 2;
      continue;
    }
    // "ie" → langes i
    if (c2 === 'ie') {
      out.push('i');
      i += 2;
      continue;
    }

    // --- Schwa-Endungen und vokalisiertes R ---
    // -er am Wortende → "6" (vokalisiertes R)
    if (c2 === 'er' && i + 2 === n) {
      out.push('6');
      i += 2;
      continue;
    }
    // -en am Wortende → Schwa + n
    if (c2 === 'en' && i + 2 === n) {
      out.push('@', 'n');
      i += 2;
      continue;
    }
    // -el am Wortende → Schwa + l
    if (c2 === 'el' && i + 2 === n) {
      out.push('@', 'l');
      i += 2;
      continue;
    }
    // -em am Wortende → Schwa + m
    if (c2 === 'em' && i + 2 === n) {
      out.push('@', 'm');
      i += 2;
      continue;
    }

    // --- Einzelne Buchstaben ---
    switch (c) {
      case 'ä':
        out.push('A');
        break;
      case 'ö':
        out.push('O');
        break;
      case 'ü':
      case 'y':
        out.push('U');
        break;
      case 'ß':
        out.push('s');
        break;
      case 'v':
        out.push('f');
        break;
      case 'w':
        out.push('v');
        break;
      case 'x':
        out.push('k', 's');
        break;
      case 'c':
        // im Deutschen selten isoliert – meist Fremdwörter.
        out.push('k');
        break;
      case 'h':
        // Dehnungs-h nach Vokal ignorieren, sonst [h]
        if (out.length > 0 && isVowel(out[out.length - 1]!)) {
          // Dehnungs-h: überspringen
        } else {
          out.push('h');
        }
        break;
      case 's':
        out.push('s');
        break;
      case 'j':
        out.push('j');
        break;
      case 'e':
        // Finales "e" → Schwa
        if (i + 1 === n) {
          out.push('@');
        } else {
          out.push('e');
        }
        break;
      case 'a':
      case 'i':
      case 'o':
      case 'u':
        out.push(c);
        break;
      case 'b':
      case 'd':
      case 'f':
      case 'g':
      case 'k':
      case 'l':
      case 'm':
      case 'n':
      case 'p':
      case 'r':
      case 't':
        out.push(c);
        break;
      default:
        // Unbekanntes Zeichen überspringen (Zahlen, Interpunktion …)
        break;
    }
    i += 1;
  }

  // --- Post-Processing: Auslautverhärtung ---
  // Am Wortende und vor stimmlosem Konsonanten: b→p, d→t, g→k
  for (let k = 0; k < out.length; k++) {
    const next = out[k + 1];
    const atEnd = k === out.length - 1;
    const beforeVoiceless =
      next !== undefined && /[pftksSxh]/.test(next);
    if (out[k] === 'b' && (atEnd || beforeVoiceless)) out[k] = 'p';
    else if (out[k] === 'd' && (atEnd || beforeVoiceless)) out[k] = 't';
    else if (out[k] === 'g' && (atEnd || beforeVoiceless)) out[k] = 'k';
  }

  // Doppelte Konsonanten im Ergebnis zu einem machen (Orthographie ≠ Phonetik)
  const dedup: Phoneme[] = [];
  for (const p of out) {
    if (dedup.length > 0 && dedup[dedup.length - 1] === p && !isVowel(p)) {
      continue;
    }
    dedup.push(p);
  }

  return dedup;
}

/**
 * Index der letzten betonten Silbe – als Näherung nehmen wir die
 * letzte "Voll-Vokal-Silbe" vor einem evtl. Schwa/vokalisierten R.
 *
 * Gibt den Index des Vokals zurück, ab dem der Reim beginnt.
 */
export function rhymeNucleusIndex(phonemes: Phoneme[]): number {
  if (phonemes.length === 0) return -1;

  // Suche den letzten Voll-Vokal (keine Schwa/vokalisiertes R)
  let last = -1;
  for (let i = phonemes.length - 1; i >= 0; i--) {
    const p = phonemes[i]!;
    if (isVowel(p) && p !== '@' && p !== '6') {
      last = i;
      break;
    }
  }
  if (last !== -1) return last;

  // Fallback: letzter Vokal überhaupt
  for (let i = phonemes.length - 1; i >= 0; i--) {
    if (isVowel(phonemes[i]!)) return i;
  }
  return -1;
}

/**
 * Extrahiert den Reim-Suffix ab der letzten betonten Silbe.
 */
export function rhymeKey(word: string): string {
  const ph = phonemize(word);
  const idx = rhymeNucleusIndex(ph);
  if (idx === -1) return '';
  return ph.slice(idx).join('');
}

/**
 * Extrahiert einen mehrsilbigen Reim-Key (für "double rhymes"): die letzten
 * N Silben – als Näherung alle Phoneme ab dem N-letzten Vokal.
 */
export function multiSyllableKey(word: string, syllables: number): string {
  const ph = phonemize(word);
  if (ph.length === 0) return '';
  let found = 0;
  for (let i = ph.length - 1; i >= 0; i--) {
    if (isVowel(ph[i]!)) {
      found++;
      if (found === syllables) {
        return ph.slice(i).join('');
      }
    }
  }
  return ph.join('');
}

/**
 * Assonanz-Key: nur die Vokalfolge ab der letzten betonten Silbe.
 * (Konsonanten werden ignoriert.)
 */
export function assonanceKey(word: string): string {
  const ph = phonemize(word);
  const idx = rhymeNucleusIndex(ph);
  if (idx === -1) return '';
  return ph
    .slice(idx)
    .filter((p) => isVowel(p))
    .join('');
}
