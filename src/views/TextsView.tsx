import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '../lib/db';
import { useNav } from '../nav';
import { Button, Card, EmptyState, StatusBadge, TextField } from '../components/UI';
import { CalendarIcon, ChevronRightIcon, PlusIcon, SearchIcon } from '../components/Icon';

type Sort =
  | 'date-desc'
  | 'date-asc'
  | 'released-first'
  | 'draft-first';

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'date-desc', label: 'Datum (neueste zuerst)' },
  { value: 'date-asc', label: 'Datum (älteste zuerst)' },
  { value: 'released-first', label: 'Veröffentlicht zuerst' },
  { value: 'draft-first', label: 'Entwürfe zuerst' },
];

function sortKey(song: Song): number {
  if (song.date) {
    const t = Date.parse(song.date);
    if (!Number.isNaN(t)) return t;
  }
  return song.updatedAt;
}

function compareSongs(a: Song, b: Song, sort: Sort): number {
  switch (sort) {
    case 'date-desc':
      return sortKey(b) - sortKey(a);
    case 'date-asc':
      return sortKey(a) - sortKey(b);
    case 'released-first': {
      const byStatus =
        (a.status === 'released' ? 0 : 1) - (b.status === 'released' ? 0 : 1);
      if (byStatus !== 0) return byStatus;
      return sortKey(b) - sortKey(a);
    }
    case 'draft-first': {
      const byStatus =
        (a.status === 'draft' ? 0 : 1) - (b.status === 'draft' ? 0 : 1);
      if (byStatus !== 0) return byStatus;
      return sortKey(b) - sortKey(a);
    }
  }
}

export default function TextsView() {
  const { go } = useNav();
  const [sort, setSort] = useState<Sort>('date-desc');
  const [query, setQuery] = useState('');

  const songs = useLiveQuery(() => db.songs.toArray(), []);

  const filtered = useMemo(() => {
    if (!songs) return [] as Song[];
    const q = query.trim().toLowerCase();
    const list = q
      ? songs.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.artist ?? '').toLowerCase().includes(q) ||
            s.text.toLowerCase().includes(q) ||
            (s.tags ?? []).some((t) => t.toLowerCase().includes(q)),
        )
      : songs.slice();
    return list.sort((a, b) => compareSongs(a, b, sort));
  }, [songs, query, sort]);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <TextField
            aria-label="In Texten suchen"
            placeholder="In Texten suchen …"
            className="!py-2.5 pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="primary"
          icon={<PlusIcon size={18} />}
          onClick={() => go({ name: 'new-song' })}
          aria-label="Neu"
        >
          Neu
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-stone-900">
          Texte
          <span className="ml-2 text-base font-normal text-stone-400">
            {songs?.length ?? 0}
          </span>
        </h2>

        <label className="inline-flex items-center gap-2 text-xs text-stone-500">
          <span className="font-medium uppercase tracking-wide">Sortieren</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-stone-200 bg-cream-50 px-3 py-2 text-sm text-stone-800 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/15"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {songs === undefined ? null : filtered.length === 0 ? (
        <EmptyState
          title={songs.length === 0 ? 'Noch keine Texte' : 'Keine Treffer'}
          description={
            songs.length === 0
              ? 'Leg deinen ersten Text an – Entwurf oder veröffentlicht.'
              : 'Versuch einen anderen Suchbegriff.'
          }
          action={
            songs.length === 0 && (
              <Button
                variant="primary"
                icon={<PlusIcon size={18} />}
                onClick={() => go({ name: 'new-song' })}
              >
                Ersten Text anlegen
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <li key={s.id}>
              <Card
                as="button"
                onClick={() => s.id && go({ name: 'song', id: s.id })}
                className="w-full"
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold leading-tight text-stone-900">
                        {s.title}
                      </h3>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                      {s.artist && <span>{s.artist}</span>}
                      {s.date && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon size={12} />
                          {s.date}
                        </span>
                      )}
                      <span>
                        {s.text
                          ? `${s.text.split(/\s+/).filter(Boolean).length} Wörter`
                          : 'leer'}
                      </span>
                    </div>
                    {s.text && (
                      <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                        {s.text.split('\n').slice(0, 2).join(' · ')}
                      </p>
                    )}
                  </div>
                  <ChevronRightIcon className="mt-1 shrink-0 text-stone-400" />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
