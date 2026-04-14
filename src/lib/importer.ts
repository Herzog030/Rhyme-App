import { compareWords } from './rhyme';

export interface ExtractedRhyme {
  a: string;
  b: string;
  quality: string;
  lineA: string;
  lineB: string;
  lineIndexA: number;
  lineIndexB: number;
}

export interface ParsedSong {
  words: string[];
  pairs: ExtractedRhyme[];
  lines: string[];
}

const WORD_RE = /[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß\-']*/g;

function lastWord(line: string): string | null {
  const matches = line.match(WORD_RE);
  if (!matches || matches.length === 0) return null;
  return matches[matches.length - 1]!;
}

function isSectionMarker(line: string): boolean {
  const t = line.trim();
  // [Strophe 1], [Refrain], (Chorus) etc.
  return /^[\[(].*[\])]$/.test(t);
}

/**
 * Extrahiert einzelne Wörter aus einem Text.
 */
export function extractWords(text: string): string[] {
  const set = new Set<string>();
  const all = text.match(WORD_RE) ?? [];
  for (const w of all) {
    if (w.length >= 2) set.add(w);
  }
  return Array.from(set);
}

/**
 * Analysiert einen Songtext und findet potenzielle Reimpaare am Zeilenende.
 *
 * Strategie:
 *  - Leere Zeilen und Section-Marker ([Strophe 1] etc.) überspringen
 *  - Für jede Zeile das letzte Wort nehmen
 *  - Innerhalb eines Fensters (bis zu 3 Zeilen Abstand) nach reimenden
 *    Endwörtern suchen
 *  - Klassische Schemata (AABB, ABAB, ABBA) werden so abgedeckt
 */
export function parseSong(text: string, windowSize = 3): ParsedSong {
  const rawLines = text.split(/\r?\n/);
  const endWords: { word: string; line: string; idx: number }[] = [];

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || isSectionMarker(trimmed)) return;
    const last = lastWord(trimmed);
    if (!last) return;
    endWords.push({ word: last, line: trimmed, idx });
  });

  const pairs: ExtractedRhyme[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < endWords.length; i++) {
    const a = endWords[i]!;
    for (let j = i + 1; j < endWords.length && j <= i + windowSize; j++) {
      const b = endWords[j]!;
      if (a.word.toLowerCase() === b.word.toLowerCase()) continue;
      const m = compareWords(a.word, b.word);
      if (!m) continue;
      // nur "gute" Reime übernehmen
      if (m.quality === 'near') continue;
      const key = [a.word.toLowerCase(), b.word.toLowerCase()].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({
        a: a.word,
        b: b.word,
        quality: m.quality,
        lineA: a.line,
        lineB: b.line,
        lineIndexA: a.idx,
        lineIndexB: b.idx,
      });
    }
  }

  return {
    words: extractWords(text),
    pairs,
    lines: rawLines,
  };
}
