import { useRef, useState } from 'react';
import { clearAll, exportAll, importAll } from '../lib/db';

export default function SettingsView() {
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    const json = await exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reimwoerterbuch-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('✓ Backup heruntergeladen.');
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const res = await importAll(text);
      setStatus(
        `✓ Importiert: ${res.words} Wörter, ${res.songs} Songs, ${res.pairs} Paare.`,
      );
    } catch (e) {
      setStatus(`Fehler: ${(e as Error).message}`);
    }
  }

  async function handleReset() {
    if (!confirm('Alle Daten wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return;
    await clearAll();
    setStatus('Alle Daten gelöscht.');
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Daten sichern</h2>
        <button
          type="button"
          onClick={handleExport}
          className="w-full rounded-xl border border-ink-800 bg-ink-900 px-4 py-3 text-left text-sm"
        >
          💾 Als JSON exportieren
          <div className="text-xs text-ink-100/60">
            Lädt ein Backup herunter. Ideal zum Übertragen auf ein anderes Gerät.
          </div>
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border border-ink-800 bg-ink-900 px-4 py-3 text-left text-sm"
        >
          ⬆️ JSON importieren
          <div className="text-xs text-ink-100/60">
            Fügt Daten aus einem Backup zu den bestehenden hinzu.
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
          }}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Gefahrenzone</h2>
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-left text-sm text-red-300"
        >
          🗑 Alle Daten löschen
          <div className="text-xs text-red-300/70">
            Leert Wortschatz, Songs und Reimpaare vollständig.
          </div>
        </button>
      </div>

      <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3 text-xs text-ink-100/60">
        <p className="mb-1 font-semibold text-ink-100/80">Über diese App</p>
        <p>
          Deutsches Reimwörterbuch · Progressive Web App ·{' '}
          Daten liegen <b>lokal</b> auf deinem Gerät (IndexedDB).
        </p>
        <p className="mt-1">
          Der Reim-Algorithmus analysiert Wörter phonetisch und findet
          Reinreime, mehrsilbige Reime sowie Assonanzen – orientiert am
          Konzept von double-rhyme.com, aber mit deinem eigenen Wortschatz.
        </p>
      </div>

      {status && (
        <div className="rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-2 text-sm">
          {status}
        </div>
      )}
    </section>
  );
}
