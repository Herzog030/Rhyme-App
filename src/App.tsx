import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { addWords, db, wordCount } from './lib/db';
import { SEED_WORDS } from './lib/seed';
import SearchView from './views/SearchView';
import ImportView from './views/ImportView';
import LibraryView from './views/LibraryView';
import SettingsView from './views/SettingsView';

type Tab = 'search' | 'import' | 'library' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'search', label: 'Suchen', icon: '🔍' },
  { id: 'import', label: 'Import', icon: '🎤' },
  { id: 'library', label: 'Bibliothek', icon: '📚' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙︎' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('search');
  const [seeded, setSeeded] = useState(false);
  const total = useLiveQuery(() => wordCount(), [], 0);

  useEffect(() => {
    (async () => {
      const existing = await db.words.count();
      if (existing === 0) {
        await addWords(SEED_WORDS, { source: 'seed' });
      }
      setSeeded(true);
    })();
  }, []);

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <header className="sticky top-0 z-10 border-b border-ink-800 bg-ink-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Reim<span className="text-accent-400">wörter</span>buch
            </h1>
            <p className="text-xs text-ink-100/60">
              {total ?? 0} Wörter · offline verfügbar
            </p>
          </div>
          <div className="text-2xl">🎼</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {!seeded ? (
          <div className="flex h-64 items-center justify-center text-ink-100/60">
            Lade Wortschatz …
          </div>
        ) : (
          <>
            {tab === 'search' && <SearchView />}
            {tab === 'import' && <ImportView />}
            {tab === 'library' && <LibraryView />}
            {tab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-2xl border-t border-ink-800 bg-ink-950/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid grid-cols-4">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex w-full flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                  tab === t.id
                    ? 'text-accent-400'
                    : 'text-ink-100/60 hover:text-ink-100'
                }`}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                <span className="text-xl" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
