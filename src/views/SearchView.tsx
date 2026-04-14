import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { findRhymes, groupMatches, type RhymeQuality } from '../lib/rhyme';
import { phonemize, rhymeKey } from '../lib/phonetics';

const QUALITY_LABEL: Record<RhymeQuality, string> = {
  multi: 'Mehrsilbig',
  rich: 'Reich',
  perfect: 'Reinreim',
  assonance: 'Assonanz',
  near: 'Unrein',
};

const QUALITY_COLOR: Record<RhymeQuality, string> = {
  multi: 'bg-accent-500 text-ink-900',
  rich: 'bg-accent-400 text-ink-900',
  perfect: 'bg-emerald-400 text-ink-900',
  assonance: 'bg-sky-400 text-ink-900',
  near: 'bg-slate-500 text-ink-50',
};

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [minSyllables, setMinSyllables] = useState(1);
  const [includeAssonance, setIncludeAssonance] = useState(true);
  const [includeNear, setIncludeNear] = useState(true);

  const allWords = useLiveQuery(
    () => db.words.toArray().then((ws) => ws.map((w) => w.original)),
    [],
    [] as string[],
  );

  const q = query.trim();

  const matches = useMemo(() => {
    if (!q || !allWords || allWords.length === 0) return [];
    return findRhymes(q, allWords, {
      minSyllables,
      includeAssonance,
      includeNear,
      limit: 300,
    });
  }, [q, allWords, minSyllables, includeAssonance, includeNear]);

  const groups = useMemo(() => groupMatches(matches), [matches]);
  const phonetic = q ? phonemize(q).join(' ') : '';
  const rKey = q ? rhymeKey(q) : '';

  return (
    <section className="space-y-4">
      <label className="block">
        <span className="sr-only">Wort eingeben</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wort eingeben, z.B. „Herz“"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-ink-800 bg-ink-900 px-4 py-4 text-lg text-ink-50 placeholder:text-ink-100/40 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        />
      </label>

      {q && (
        <div className="rounded-xl border border-ink-800 bg-ink-900/50 px-3 py-2 text-xs text-ink-100/60">
          <div>
            Phonetik: <span className="font-mono text-ink-100">{phonetic}</span>
          </div>
          <div>
            Reim-Key: <span className="font-mono text-accent-400">-{rKey}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <label className="flex items-center gap-1 rounded-full border border-ink-800 bg-ink-900 px-3 py-1.5">
          Silben ≥
          <select
            value={minSyllables}
            onChange={(e) => setMinSyllables(Number(e.target.value))}
            className="bg-transparent outline-none"
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <Toggle
          label="Assonanz"
          checked={includeAssonance}
          onChange={setIncludeAssonance}
        />
        <Toggle
          label="Unreine Reime"
          checked={includeNear}
          onChange={setIncludeNear}
        />
      </div>

      {!q ? (
        <EmptyHint />
      ) : matches.length === 0 ? (
        <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-4 text-sm text-ink-100/70">
          Keine Treffer. Tipp: mehr Wörter über den <b>Import</b>-Tab
          hinzufügen.
        </div>
      ) : (
        <div className="space-y-4">
          {(
            ['multi', 'rich', 'perfect', 'assonance', 'near'] as RhymeQuality[]
          ).map((k) =>
            groups[k].length === 0 ? null : (
              <div key={k}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${QUALITY_COLOR[k]}`}
                  >
                    {QUALITY_LABEL[k]}
                  </span>
                  <span className="text-ink-100/60">
                    {groups[k].length} Treffer
                  </span>
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {groups[k].map((m) => (
                    <li
                      key={m.word + m.quality}
                      className="rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm"
                      title={`Silben: ${m.syllables} · Endung: -${m.sharedSuffix}`}
                    >
                      <span className="font-medium">{m.word}</span>
                      <span className="ml-2 text-[11px] text-ink-100/50">
                        -{m.sharedSuffix}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-full border px-3 py-1.5 transition-colors ${
        checked
          ? 'border-accent-500 bg-accent-500/20 text-accent-400'
          : 'border-ink-800 bg-ink-900 text-ink-100/60'
      }`}
      aria-pressed={checked}
    >
      {checked ? '✓ ' : ''}
      {label}
    </button>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-800 bg-ink-900/30 p-6 text-center text-sm text-ink-100/60">
      <div className="mb-2 text-3xl">✍️</div>
      <p>Gib ein Wort ein, um Reime zu finden.</p>
      <p className="mt-1 text-xs">
        Die App kennt Reinreime, mehrsilbige Reime und Assonanzen.
      </p>
    </div>
  );
}
