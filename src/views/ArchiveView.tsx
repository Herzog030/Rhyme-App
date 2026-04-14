import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song, type SongStatus } from '../lib/db';
import { useNav } from '../nav';
import { Button, Card, EmptyState, StatusBadge, TextField } from '../components/UI';
import { CalendarIcon, ChevronRightIcon, PlusIcon, SearchIcon } from '../components/Icon';

type Filter = 'all' | SongStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'released', label: 'Released' },
  { key: 'draft', label: 'Entwürfe' },
  { key: 'idea', label: 'Ideen' },
];

export default function ArchiveView() {
  const { go } = useNav();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const songs = useLiveQuery(async () => {
    const all = await db.songs.orderBy('updatedAt').reverse().toArray();
    return all;
  }, []);

  const filtered = useMemo(() => {
    if (!songs) return [] as Song[];
    const q = query.trim().toLowerCase();
    return songs.filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.artist ?? '').toLowerCase().includes(q) ||
        s.text.toLowerCase().includes(q) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [songs, filter, query]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, draft: 0, released: 0, idea: 0 };
    for (const s of songs ?? []) {
      c.all += 1;
      c[s.status] += 1;
    }
    return c;
  }, [songs]);

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <TextField
            aria-label="In Archiv suchen"
            placeholder="In Archiv suchen …"
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

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'border-leaf-600 bg-leaf-600 text-white'
                : 'border-stone-200 bg-cream-50 text-stone-600 hover:border-stone-300'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {songs === undefined ? null : filtered.length === 0 ? (
        <EmptyState
          title={songs.length === 0 ? 'Dein Archiv ist leer' : 'Keine Treffer'}
          description={
            songs.length === 0
              ? 'Leg deinen ersten Release, Entwurf oder Gedankenblitz an.'
              : 'Versuch einen anderen Filter oder Suchbegriff.'
          }
          action={
            songs.length === 0 && (
              <Button
                variant="primary"
                icon={<PlusIcon size={18} />}
                onClick={() => go({ name: 'new-song' })}
              >
                Ersten Song anlegen
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <li key={s.id}>
              <Card as="button" onClick={() => s.id && go({ name: 'song', id: s.id })} className="w-full">
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
                        {s.text ? `${s.text.split(/\s+/).filter(Boolean).length} Wörter` : 'leer'}
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
