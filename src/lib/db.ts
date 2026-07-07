import Dexie, { type Table } from 'dexie';

/**
 * My Book Of Rhymes – Datenmodell.
 *
 *  songs      – die zentrale Tabelle: Releases, Entwürfe und Ideen
 *               (unterschieden nur über status + date).
 *  rhymes     – Reimpaare/-gruppen, die an einem Song hängen.
 *               Design-Entscheidung: Reime gehören immer zu einem
 *               Song (eng verzahnt), damit sie im Kontext bleiben.
 *  vocabulary – optionaler gemeinsamer Wortschatz für spätere
 *               Reim-Vorschläge (Phase 4).
 */

export type SongStatus = 'draft' | 'released';

export interface Song {
  id?: number;
  title: string;
  artist?: string;
  status: SongStatus;
  /** ISO-Datum im Format YYYY-MM-DD. Optional: Ideen/Entwürfe haben oft noch keins. */
  date?: string;
  text: string;
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export type RhymeQuality = 'perfect' | 'multi' | 'slant' | 'assonance';

export interface Rhyme {
  id?: number;
  songId: number;
  /** Die einzelnen Wörter, die miteinander reimen (mind. 2). */
  words: string[];
  quality?: RhymeQuality;
  /** Optional: Zeilennummer(n) im Songtext, wo der Reim vorkommt. */
  lineIndices?: number[];
  note?: string;
  createdAt: number;
}

/**
 * Vokabular-Eintrag – vorerst nicht aktiv in der UI, aber das Schema
 * steht bereit, damit die Reim-Engine in Phase 4 direkt darauf aufbauen
 * kann, ohne Migration.
 */
export interface VocabularyEntry {
  id?: number;
  word: string;
  original: string;
  /** Herkunft: manueller Eintrag oder aus einem Song. */
  source: 'manual' | 'song';
  songId?: number;
  createdAt: number;
}

class MyBookOfRhymesDB extends Dexie {
  songs!: Table<Song, number>;
  rhymes!: Table<Rhyme, number>;
  vocabulary!: Table<VocabularyEntry, number>;

  constructor() {
    super('MyBookOfRhymesDB');
    this.version(1).stores({
      songs: '++id, title, artist, status, date, createdAt, updatedAt',
      rhymes: '++id, songId, createdAt',
      vocabulary: '++id, &word, source, songId, createdAt',
    });
    this.version(2)
      .stores({
        songs: '++id, title, artist, status, date, createdAt, updatedAt',
        rhymes: '++id, songId, createdAt',
        vocabulary: '++id, &word, source, songId, createdAt',
      })
      .upgrade((tx) =>
        tx.table('songs').toCollection().modify((s: Song) => {
          if ((s.status as string) === 'idea') s.status = 'draft';
        }),
      );
  }
}

export const db = new MyBookOfRhymesDB();

/**
 * Einmalig beim App-Start ausführen: die alte v0.1 Datenbank
 * „ReimwoerterbuchDB" entfernen, damit keine Zombie-Daten im
 * Browser liegen bleiben.
 */
export async function cleanupLegacyDatabases(): Promise<void> {
  try {
    await Dexie.delete('ReimwoerterbuchDB');
  } catch {
    // keine Legacy-DB vorhanden – völlig ok
  }
}

// --- Songs ---------------------------------------------------------------

export async function createSong(
  input: Pick<Song, 'title'> & Partial<Omit<Song, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<number> {
  const now = Date.now();
  const song: Song = {
    title: input.title.trim() || 'Ohne Titel',
    artist: input.artist?.trim() || undefined,
    status: input.status ?? 'draft',
    date: input.date || undefined,
    text: input.text ?? '',
    notes: input.notes ?? '',
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  return (await db.songs.add(song)) as number;
}

export async function updateSong(
  id: number,
  patch: Partial<Omit<Song, 'id' | 'createdAt'>>,
): Promise<void> {
  const clean: Partial<Song> = { ...patch, updatedAt: Date.now() };
  await db.songs.update(id, clean);
}

export async function deleteSong(id: number): Promise<void> {
  await db.transaction('rw', db.songs, db.rhymes, async () => {
    await db.rhymes.where('songId').equals(id).delete();
    await db.songs.delete(id);
  });
}

export async function getSong(id: number): Promise<Song | undefined> {
  return db.songs.get(id);
}

// --- Rhymes (am Song) ----------------------------------------------------

export async function addRhymeToSong(
  songId: number,
  words: string[],
  opts: { quality?: RhymeQuality; note?: string; lineIndices?: number[] } = {},
): Promise<number | null> {
  const cleaned = words.map((w) => w.trim()).filter(Boolean);
  if (cleaned.length < 2) return null;
  const rhyme: Rhyme = {
    songId,
    words: cleaned,
    quality: opts.quality,
    note: opts.note,
    lineIndices: opts.lineIndices,
    createdAt: Date.now(),
  };
  return (await db.rhymes.add(rhyme)) as number;
}

export async function updateRhyme(
  id: number,
  patch: Partial<Omit<Rhyme, 'id' | 'songId' | 'createdAt'>>,
): Promise<void> {
  await db.rhymes.update(id, patch);
}

export async function deleteRhyme(id: number): Promise<void> {
  await db.rhymes.delete(id);
}

export async function listRhymesForSong(songId: number): Promise<Rhyme[]> {
  return db.rhymes.where('songId').equals(songId).toArray();
}

// --- Export / Import ----------------------------------------------------

export async function exportAll(): Promise<string> {
  const [songs, rhymes, vocabulary] = await Promise.all([
    db.songs.toArray(),
    db.rhymes.toArray(),
    db.vocabulary.toArray(),
  ]);
  return JSON.stringify(
    {
      app: 'my-book-of-rhymes',
      version: 1,
      exportedAt: new Date().toISOString(),
      songs,
      rhymes,
      vocabulary,
    },
    null,
    2,
  );
}

export async function importAll(json: string): Promise<{ songs: number; rhymes: number; vocabulary: number }> {
  const data = JSON.parse(json) as {
    songs?: Song[];
    rhymes?: Rhyme[];
    vocabulary?: VocabularyEntry[];
  };
  const res = { songs: 0, rhymes: 0, vocabulary: 0 };

  await db.transaction('rw', db.songs, db.rhymes, db.vocabulary, async () => {
    // Songs importieren. IDs remappen, damit Rhymes danach korrekt zuordnen.
    const idMap = new Map<number, number>();
    for (const s of data.songs ?? []) {
      const { id: oldId, ...rest } = s;
      const newId = (await db.songs.add(rest)) as number;
      if (oldId != null) idMap.set(oldId, newId);
      res.songs++;
    }

    for (const r of data.rhymes ?? []) {
      const { id: _id, songId, ...rest } = r;
      void _id;
      const mappedSongId = idMap.get(songId) ?? songId;
      await db.rhymes.add({ ...rest, songId: mappedSongId });
      res.rhymes++;
    }

    for (const v of data.vocabulary ?? []) {
      const { id: _id, ...rest } = v;
      void _id;
      const existing = await db.vocabulary.where('word').equals(rest.word).first();
      if (!existing) {
        await db.vocabulary.add(rest);
        res.vocabulary++;
      }
    }
  });

  return res;
}

export async function clearAll(): Promise<void> {
  await db.transaction('rw', db.songs, db.rhymes, db.vocabulary, async () => {
    await db.songs.clear();
    await db.rhymes.clear();
    await db.vocabulary.clear();
  });
}

export async function songCount(): Promise<number> {
  return db.songs.count();
}
