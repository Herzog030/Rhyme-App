import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Rhyme, type Song } from '../lib/db';
import { useNav } from '../nav';
import { Card, EmptyState, TextField } from '../components/UI';
import { CalendarIcon, ChevronRightIcon, SearchIcon } from '../components/Icon';

type Sort = 'recent' | 'alpha' | 'by-song';

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'recent', label: 'Zuletzt hinzugefügt' },
  { value: 'alpha', label: 'Alphabetisch' },
  { value: 'by-song', label: 'Nach Text gruppiert' },
];

interface RhymeRow {
  rhyme: Rhyme;
  song: Song | undefined;
}

export default function RhymesView() {
  const { go } = useNav();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');

  const rhymes = useLiveQuery(() => db.rhymes.toArray(), []);
  const songs = useLiveQuery(() => db.songs.toArray(), []);

  const rows: RhymeRow[] = useMemo(() => {
    if (!rhymes || !songs) return [];
    const songMap = new Map<number, Song>();
    for (const s of songs) if (s.id != null) songMap.set(s.id, s);
    return rhymes.map((r) => ({ rhyme: r, song: songMap.get(r.songId) }));
  }, [rhymes, songs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter(
          ({ rhyme, song }) =>
            rhyme.words.some((w) => w.toLowerCase().includes(q)) ||
            (rhyme.note ?? '').toLowerCase().includes(q) ||
            (song?.title ?? '').toLowerCase().includes(q),
        )
      : rows.slice();

    switch (sort) {
      case 'recent':
        return list.sort((a, b) => b.rhyme.createdAt - a.rhyme.createdAt);
      case 'alpha':
        return list.sort((a, b) =>
          (a.rhyme.words[0] ?? '').localeCompare(b.rhyme.words[0] ?? '', 'de'),
        );
      case 'by-song':
        return list.sort((a, b) => {
          const ta = a.song?.title ?? '';
          const tb = b.song?.title ?? '';
          const cmp = ta.localeCompare(tb, 'de');
          if (cmp !== 0) return cmp;
          return b.rhyme.createdAt - a.rhyme.createdAt;
        });
    }
  }, [rows, query, sort]);

  const groups: { songTitle: string; songId: number | undefined; rows: RhymeRow[] }[] =
    useMemo(() => {
      if (sort !== 'by-song') return [];
      const map = new Map<string, { songTitle: string; songId: number | undefined; rows: RhymeRow[] }>();
      for (const r of filtered) {
        const key = r.song?.id != null ? `s-${r.song.id}` : 'unknown';
        const title = r.song?.title ?? 'Ohne Text-Verknüpfung';
        if (!map.has(key)) map.set(key, { songTitle: title, songId: r.song?.id, rows: [] });
        map.get(key)!.rows.push(r);
      }
      return Array.from(map.values());
    }, [filtered, sort]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-stone-900">
          Reime
          <span className="ml-2 text-base font-normal text-stone-400">
            {rhymes?.length ?? 0}
          </span>
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Alle Reime, die du in deinen Texten festgehalten hast.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <TextField
            aria-label="Reime durchsuchen"
            placeholder="Wort, Notiz oder Titel suchen …"
            className="!py-2.5 pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="shrink-0 rounded-xl border border-stone-200 bg-cream-50 px-3 py-2.5 text-sm text-stone-800 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/15"
          aria-label="Sortierung"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {rhymes === undefined ? null : filtered.length === 0 ? (
        <EmptyState
          title={rhymes.length === 0 ? 'Noch keine Reime' : 'Keine Treffer'}
          description={
            rhymes.length === 0
              ? 'Öffne einen Text im Archiv und trag dort Reime ein – sie erscheinen dann hier gesammelt.'
              : 'Versuch einen anderen Suchbegriff.'
          }
        />
      ) : sort === 'by-song' ? (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.songId ?? g.songTitle}>
              <button
                type="button"
                onClick={() => g.songId && go({ name: 'song', id: g.songId })}
                className="group mb-2 flex w-full items-center justify-between text-left"
                disabled={!g.songId}
              >
                <h3 className="font-display text-base font-semibold text-stone-800 group-hover:text-leaf-700">
                  {g.songTitle}
                </h3>
                {g.songId && (
                  <ChevronRightIcon size={16} className="text-stone-400 group-hover:text-leaf-700" />
                )}
              </button>
              <ul className="space-y-2">
                {g.rows.map(({ rhyme }) => (
                  <RhymeItem
                    key={rhyme.id}
                    rhyme={rhyme}
                    showSong={false}
                    song={g.songId ? { id: g.songId, title: g.songTitle } : undefined}
                    onSongClick={() => g.songId && go({ name: 'song', id: g.songId })}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map(({ rhyme, song }) => (
            <RhymeItem
              key={rhyme.id}
              rhyme={rhyme}
              song={song ? { id: song.id, title: song.title, date: song.date } : undefined}
              showSong
              onSongClick={() => song?.id && go({ name: 'song', id: song.id })}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RhymeItem({
  rhyme,
  song,
  showSong,
  onSongClick,
}: {
  rhyme: Rhyme;
  song?: { id?: number; title: string; date?: string };
  showSong: boolean;
  onSongClick: () => void;
}) {
  return (
    <li>
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {rhyme.words.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-sm font-medium text-leaf-800"
            >
              {w}
            </span>
          ))}
        </div>
        {rhyme.note && (
          <p className="mt-2 text-xs text-stone-500">{rhyme.note}</p>
        )}
        {showSong && song && (
          <button
            type="button"
            onClick={onSongClick}
            disabled={!song.id}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-leaf-700"
          >
            <span className="font-medium">{song.title}</span>
            {song.date && (
              <span className="inline-flex items-center gap-1 text-stone-400">
                <CalendarIcon size={12} />
                {song.date}
              </span>
            )}
            {song.id && <ChevronRightIcon size={12} />}
          </button>
        )}
      </Card>
    </li>
  );
}
