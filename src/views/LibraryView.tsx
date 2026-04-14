import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteWord } from '../lib/db';

type Filter = 'all' | 'manual' | 'song' | 'seed';

export default function LibraryView() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const words = useLiveQuery(async () => {
    let q = db.words.orderBy('createdAt').reverse();
    const all = await q.toArray();
    return all.filter((w) => {
      if (filter !== 'all' && w.source !== filter) return false;
      if (search && !w.word.includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search]);

  const pairs = useLiveQuery(
    () => db.pairs.orderBy('createdAt').reverse().limit(50).toArray(),
    [],
  );

  return (
    <section className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="In Bibliothek suchen …"
        className="w-full rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm"
      />
      <div className="flex gap-2 text-xs">
        {(['all', 'manual', 'song', 'seed'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 ${
              filter === f
                ? 'border-accent-500 bg-accent-500/20 text-accent-400'
                : 'border-ink-800 bg-ink-900 text-ink-100/60'
            }`}
          >
            {f === 'all'
              ? 'Alle'
              : f === 'manual'
                ? 'Manuell'
                : f === 'song'
                  ? 'Aus Songs'
                  : 'Grundwortschatz'}
          </button>
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">
          Wörter{' '}
          <span className="text-ink-100/50">({words?.length ?? 0})</span>
        </h2>
        {!words ? null : words.length === 0 ? (
          <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-4 text-sm text-ink-100/70">
            Keine Einträge.
          </div>
        ) : (
          <ul className="divide-y divide-ink-800 overflow-hidden rounded-xl border border-ink-800 bg-ink-900/50">
            {words.slice(0, 200).map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{w.original}</div>
                  <div className="text-[11px] text-ink-100/50">
                    -{w.rhymeKey} · {w.syllables} Silben ·{' '}
                    {w.source === 'song'
                      ? `Song: ${w.songTitle ?? '?'}`
                      : w.source === 'manual'
                        ? 'Manuell'
                        : 'Grundwortschatz'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => w.id && deleteWord(w.id)}
                  className="rounded-full border border-ink-800 px-2 py-1 text-[11px] text-ink-100/60 hover:text-red-400"
                  aria-label="Löschen"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">
          Reimpaare <span className="text-ink-100/50">({pairs?.length ?? 0})</span>
        </h2>
        {!pairs ? null : pairs.length === 0 ? (
          <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-4 text-sm text-ink-100/70">
            Noch keine Paare gespeichert.
          </div>
        ) : (
          <ul className="divide-y divide-ink-800 overflow-hidden rounded-xl border border-ink-800 bg-ink-900/50">
            {pairs.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{p.a}</span>
                  <span className="mx-2 text-ink-100/40">—</span>
                  <span className="font-medium">{p.b}</span>
                </div>
                <span className="text-[11px] text-ink-100/50">
                  {p.songTitle ?? (p.source === 'manual' ? 'manuell' : '')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
