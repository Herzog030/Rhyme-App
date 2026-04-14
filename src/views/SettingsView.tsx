import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { clearAll, db, exportAll, importAll, songCount } from '../lib/db';
import { Button, Card, SectionTitle, Toast } from '../components/UI';
import { DownloadIcon, TrashIcon, UploadIcon } from '../components/Icon';

export default function SettingsView() {
  const [toast, setToast] = useState<{ tone: 'info' | 'success' | 'error'; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const songs = useLiveQuery(() => songCount(), [], 0);
  const rhymes = useLiveQuery(() => db.rhymes.count(), [], 0);

  async function handleExport() {
    const json = await exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-book-of-rhymes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ tone: 'success', msg: 'Backup heruntergeladen.' });
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const r = await importAll(text);
      setToast({
        tone: 'success',
        msg: `Importiert: ${r.songs} Songs, ${r.rhymes} Reime.`,
      });
    } catch (e) {
      setToast({ tone: 'error', msg: `Fehler: ${(e as Error).message}` });
    }
  }

  async function handleReset() {
    if (
      !confirm(
        'Alle Songs, Entwürfe und Reime wirklich löschen? Das lässt sich nicht rückgängig machen.',
      )
    )
      return;
    await clearAll();
    setToast({ tone: 'info', msg: 'Alle Daten gelöscht.' });
  }

  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-stone-900">
        Einstellungen
      </h2>

      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Songs im Archiv" value={songs ?? 0} />
          <Stat label="Reime gesamt" value={rhymes ?? 0} />
        </div>
      </Card>

      <SectionTitle>Daten sichern</SectionTitle>
      <div className="space-y-2">
        <Card
          as="button"
          onClick={handleExport}
          className="w-full p-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-leaf-50 p-2 text-leaf-700">
              <DownloadIcon />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="font-medium text-stone-900">Backup exportieren</div>
              <div className="text-xs text-stone-500">
                Alle Songs und Reime als JSON-Datei sichern.
              </div>
            </div>
          </div>
        </Card>

        <Card
          as="button"
          onClick={() => fileRef.current?.click()}
          className="w-full p-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-cream-200 p-2 text-stone-700">
              <UploadIcon />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="font-medium text-stone-900">Backup importieren</div>
              <div className="text-xs text-stone-500">
                Fügt Daten aus einer JSON-Datei zum bestehenden Archiv hinzu.
              </div>
            </div>
          </div>
        </Card>
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

      <SectionTitle>Gefahrenzone</SectionTitle>
      <Button
        variant="danger"
        size="lg"
        icon={<TrashIcon size={18} />}
        onClick={handleReset}
        className="w-full"
      >
        Alle Daten löschen
      </Button>

      <div className="rounded-2xl border border-stone-200 bg-cream-50/60 p-4 text-xs text-stone-500">
        <p className="mb-1 font-medium text-stone-700">Über die App</p>
        <p>
          My Book Of Rhymes · Progressive Web App · Alle Daten liegen
          ausschließlich lokal auf deinem Gerät (IndexedDB). Kein Konto,
          kein Server, kein Tracking.
        </p>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-3xl justify-center px-5">
          <Toast tone={toast.tone} message={toast.msg} />
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-leaf-700">{value}</div>
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
    </div>
  );
}
