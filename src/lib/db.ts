import Dexie, { type Table } from 'dexie';
import { computeIndexKeys } from './rhyme';

/**
 * Ein Eintrag im persönlichen Reimwörterbuch.
 *
 * `word`      – die normalisierte Form (lowercase, getrimmt)
 * `original`  – Original-Schreibung (z.B. Großschreibung bei Substantiven)
 * `source`    – woher der Eintrag kommt (Seed / Song / Manuell)
 * `songTitle` – optional: Titel des Songs, aus dem das Wort stammt
 * `tags`      – freie Tags (z.B. "Liebe", "Rap", "Battle")
 * `syllables` – grobe Silbenzahl (nur zur Anzeige)
 * `rhymeKey`  – Phonem-Suffix ab letzter betonter Silbe (für schnelle Suche)
 * `doubleKey` – Phonem-Suffix ab zweitletzter Silbe (Doppelreim)
 * `tripleKey` – Phonem-Suffix ab drittletzter Silbe (Tripelreim)
 * `assonance` – nur Vokalfolge am Wortende (Assonanz)
 * `createdAt` – Zeitstempel (ms)
 */
export interface WordEntry {
  id?: number;
  word: string;
  original: string;
  source: 'seed' | 'song' | 'manual';
  songTitle?: string;
  tags?: string[];
  syllables: number;
  rhymeKey: string;
  doubleKey: string;
  tripleKey: string;
  assonance: string;
  createdAt: number;
}

export interface SongEntry {
  id?: number;
  title: string;
  artist?: string;
  text: string;
  createdAt: number;
}

export interface RhymePair {
  id?: number;
  a: string;
  b: string;
  source: 'song' | 'manual';
  songId?: number;
  songTitle?: string;
  note?: string;
  createdAt: number;
}

class RhymeDB extends Dexie {
  words!: Table<WordEntry, number>;
  songs!: Table<SongEntry, number>;
  pairs!: Table<RhymePair, number>;

  constructor() {
    super('ReimwoerterbuchDB');
    this.version(1).stores({
      words:
        '++id, &word, rhymeKey, doubleKey, tripleKey, assonance, source, createdAt',
      songs: '++id, title, createdAt',
      pairs: '++id, a, b, songId, source, createdAt',
    });
  }
}

export const db = new RhymeDB();

function countSyllablesApprox(word: string): number {
  // Sehr grobe Schätzung: Anzahl Vokalgruppen
  const lower = word.toLowerCase();
  const groups = lower.match(/[aeiouäöüy]+/g);
  return groups ? groups.length : 1;
}

/**
 * Fügt ein Wort hinzu – falls es schon existiert, werden Quelle/Tags ggf.
 * aktualisiert. Gibt die ID zurück.
 */
export async function addWord(
  original: string,
  opts: {
    source?: WordEntry['source'];
    songTitle?: string;
    tags?: string[];
  } = {},
): Promise<number | null> {
  const word = original.toLowerCase().trim();
  if (!word || !/^[a-zäöüß\-']+$/.test(word)) return null;
  const keys = computeIndexKeys(word);
  if (!keys.rhymeKey) return null;

  const existing = await db.words.where('word').equals(word).first();
  if (existing) {
    const merged: WordEntry = {
      ...existing,
      source: opts.source ?? existing.source,
      songTitle: opts.songTitle ?? existing.songTitle,
      tags: Array.from(new Set([...(existing.tags ?? []), ...(opts.tags ?? [])])),
    };
    await db.words.put(merged);
    return existing.id ?? null;
  }

  const entry: WordEntry = {
    word,
    original: original.trim(),
    source: opts.source ?? 'manual',
    songTitle: opts.songTitle,
    tags: opts.tags,
    syllables: countSyllablesApprox(word),
    ...keys,
    createdAt: Date.now(),
  };
  return (await db.words.add(entry)) as number;
}

export async function addWords(
  words: string[],
  opts: { source?: WordEntry['source']; songTitle?: string; tags?: string[] } = {},
): Promise<number> {
  let added = 0;
  await db.transaction('rw', db.words, async () => {
    for (const w of words) {
      const id = await addWord(w, opts);
      if (id !== null) added++;
    }
  });
  return added;
}

export async function deleteWord(id: number): Promise<void> {
  await db.words.delete(id);
}

export async function wordCount(): Promise<number> {
  return db.words.count();
}

export async function addSong(song: Omit<SongEntry, 'id' | 'createdAt'>): Promise<number> {
  return (await db.songs.add({ ...song, createdAt: Date.now() })) as number;
}

export async function addPair(
  a: string,
  b: string,
  opts: {
    source?: RhymePair['source'];
    songId?: number;
    songTitle?: string;
    note?: string;
  } = {},
): Promise<number | null> {
  const aa = a.toLowerCase().trim();
  const bb = b.toLowerCase().trim();
  if (!aa || !bb || aa === bb) return null;
  const [x, y] = [aa, bb].sort();
  const existing = await db.pairs.where({ a: x, b: y }).first();
  if (existing) return existing.id ?? null;
  return (await db.pairs.add({
    a: x,
    b: y,
    source: opts.source ?? 'manual',
    songId: opts.songId,
    songTitle: opts.songTitle,
    note: opts.note,
    createdAt: Date.now(),
  })) as number;
}

/**
 * Komplett-Export aller Daten als JSON (z.B. für Backup/Transfer).
 */
export async function exportAll(): Promise<string> {
  const [words, songs, pairs] = await Promise.all([
    db.words.toArray(),
    db.songs.toArray(),
    db.pairs.toArray(),
  ]);
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      words,
      songs,
      pairs,
    },
    null,
    2,
  );
}

/**
 * Import aus JSON – fügt zu den bestehenden Daten hinzu (ohne zu löschen).
 */
export async function importAll(json: string): Promise<{ words: number; songs: number; pairs: number }> {
  const data = JSON.parse(json) as {
    words?: WordEntry[];
    songs?: SongEntry[];
    pairs?: RhymePair[];
  };
  const res = { words: 0, songs: 0, pairs: 0 };
  await db.transaction('rw', db.words, db.songs, db.pairs, async () => {
    for (const w of data.words ?? []) {
      const { id: _id, ...rest } = w;
      void _id;
      const existing = await db.words.where('word').equals(rest.word).first();
      if (!existing) {
        await db.words.add(rest);
        res.words++;
      }
    }
    for (const s of data.songs ?? []) {
      const { id: _id, ...rest } = s;
      void _id;
      await db.songs.add(rest);
      res.songs++;
    }
    for (const p of data.pairs ?? []) {
      const { id: _id, ...rest } = p;
      void _id;
      const existing = await db.pairs.where({ a: rest.a, b: rest.b }).first();
      if (!existing) {
        await db.pairs.add(rest);
        res.pairs++;
      }
    }
  });
  return res;
}

export async function clearAll(): Promise<void> {
  await db.transaction('rw', db.words, db.songs, db.pairs, async () => {
    await db.words.clear();
    await db.songs.clear();
    await db.pairs.clear();
  });
}
