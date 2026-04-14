import { useMemo, useState } from 'react';
import { addPair, addSong, addWords, addWord } from '../lib/db';
import { parseSong } from '../lib/importer';

type Mode = 'song' | 'manual';

export default function ImportView() {
  const [mode, setMode] = useState<Mode>('song');

  return (
    <section className="space-y-4">
      <div className="flex rounded-full border border-ink-800 bg-ink-900 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('song')}
          className={`flex-1 rounded-full px-3 py-2 ${
            mode === 'song' ? 'bg-accent-500 text-ink-900' : 'text-ink-100/70'
          }`}
        >
          🎤 Songtext
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 rounded-full px-3 py-2 ${
            mode === 'manual' ? 'bg-accent-500 text-ink-900' : 'text-ink-100/70'
          }`}
        >
          ✏️ Manuell
        </button>
      </div>

      {mode === 'song' ? <SongImporter /> : <ManualImporter />}
    </section>
  );
}

function SongImporter() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(() => (text.trim() ? parseSong(text) : null), [text]);

  async function handleSave() {
    if (!parsed) return;
    setBusy(true);
    setStatus(null);
    try {
      const songId = await addSong({
        title: title.trim() || 'Ohne Titel',
        artist: artist.trim() || undefined,
        text,
      });
      const addedWords = await addWords(parsed.words, {
        source: 'song',
        songTitle: title.trim() || 'Ohne Titel',
      });
      let addedPairs = 0;
      for (const p of parsed.pairs) {
        const id = await addPair(p.a, p.b, {
          source: 'song',
          songId,
          songTitle: title.trim() || 'Ohne Titel',
        });
        if (id !== null) addedPairs++;
      }
      setStatus(
        `✓ Gespeichert: ${addedWords} neue Wörter, ${addedPairs} Reimpaare.`,
      );
      setText('');
      setTitle('');
      setArtist('');
    } catch (e) {
      setStatus(`Fehler: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel"
          className="rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist (optional)"
          className="rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'Songtext hier einfügen …\n\nIch hab ein Herz aus Gold\nDas niemals rosten soll'}
        rows={10}
        className="w-full rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 font-mono text-sm leading-relaxed"
      />

      {parsed && (
        <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3 text-xs">
          <div className="mb-2 text-ink-100/70">
            Vorschau: {parsed.words.length} einzigartige Wörter,{' '}
            {parsed.pairs.length} erkannte Reimpaare.
          </div>
          {parsed.pairs.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {parsed.pairs.slice(0, 50).map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-md bg-ink-900 px-2 py-1"
                >
                  <span>
                    <b>{p.a}</b> — <b>{p.b}</b>
                  </span>
                  <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-100/60">
                    {p.quality}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!parsed || busy}
        onClick={handleSave}
        className="w-full rounded-xl bg-accent-500 px-4 py-3 font-semibold text-ink-900 disabled:opacity-40"
      >
        {busy ? 'Speichere …' : 'Song speichern & Reime extrahieren'}
      </button>

      {status && (
        <div className="rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-2 text-sm">
          {status}
        </div>
      )}
    </div>
  );
}

function ManualImporter() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleAdd() {
    if (!a.trim() || !b.trim()) {
      setStatus('Bitte beide Wörter eintragen.');
      return;
    }
    await addWord(a, { source: 'manual' });
    await addWord(b, { source: 'manual' });
    const id = await addPair(a, b, { source: 'manual', note });
    setStatus(id ? `✓ Reim „${a} – ${b}“ hinzugefügt.` : 'Reim war schon bekannt.');
    setA('');
    setB('');
    setNote('');
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="Wort A"
          className="rounded-xl border border-ink-800 bg-ink-900 px-3 py-3"
        />
        <input
          type="text"
          value={b}
          onChange={(e) => setB(e.target.value)}
          placeholder="Wort B"
          className="rounded-xl border border-ink-800 bg-ink-900 px-3 py-3"
        />
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notiz (optional)"
        className="w-full rounded-xl border border-ink-800 bg-ink-900 px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-xl bg-accent-500 px-4 py-3 font-semibold text-ink-900"
      >
        Reim hinzufügen
      </button>
      {status && (
        <div className="rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-2 text-sm">
          {status}
        </div>
      )}
    </div>
  );
}
