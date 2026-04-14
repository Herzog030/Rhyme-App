import { useEffect } from 'react';
import { NavProvider, useNav } from './nav';
import { cleanupLegacyDatabases } from './lib/db';
import ArchiveView from './views/ArchiveView';
import SongView from './views/SongView';
import NewSongView from './views/NewSongView';
import RhymesView from './views/RhymesView';
import SettingsView from './views/SettingsView';
import { ArchiveIcon, BookIcon, SettingsIcon } from './components/Icon';

export default function App() {
  useEffect(() => {
    // Einmalig die v0.1-DB aus dem Browser räumen (falls noch da).
    cleanupLegacyDatabases();
  }, []);

  return (
    <NavProvider>
      <Shell />
    </NavProvider>
  );
}

function Shell() {
  const { route } = useNav();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto px-5 pb-32 pt-4">
        {route.name === 'archive' && <ArchiveView />}
        {route.name === 'song' && <SongView id={route.id} />}
        {route.name === 'new-song' && <NewSongView />}
        {route.name === 'rhymes' && <RhymesView />}
        {route.name === 'settings' && <SettingsView />}
      </main>
      <BottomNav />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-cream-100/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold leading-none tracking-tight text-stone-900">
            My <span className="text-leaf-700">Book</span> Of Rhymes
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Textarchiv · Entwürfe · Reimwörterbuch
          </p>
        </div>
      </div>
    </header>
  );
}

type TabKey = 'archive' | 'rhymes' | 'settings';

function BottomNav() {
  const { route, go } = useNav();

  const items: { key: TabKey; label: string; icon: typeof ArchiveIcon; target: () => void; active: boolean }[] = [
    {
      key: 'archive',
      label: 'Archiv',
      icon: ArchiveIcon,
      target: () => go({ name: 'archive' }),
      active: route.name === 'archive' || route.name === 'song' || route.name === 'new-song',
    },
    {
      key: 'rhymes',
      label: 'Reime',
      icon: BookIcon,
      target: () => go({ name: 'rhymes' }),
      active: route.name === 'rhymes',
    },
    {
      key: 'settings',
      label: 'Einstellungen',
      icon: SettingsIcon,
      target: () => go({ name: 'settings' }),
      active: route.name === 'settings',
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl border-t border-stone-200 bg-cream-50/95 backdrop-blur"
      style={{ paddingBottom: 'var(--sat-bottom)' }}
    >
      <ul className="grid grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={item.target}
                className={`flex w-full flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  item.active ? 'text-leaf-700' : 'text-stone-500 hover:text-stone-800'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                <Icon size={22} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
