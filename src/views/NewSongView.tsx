import { useState } from 'react';
import { createSong, type SongStatus } from '../lib/db';
import { useNav } from '../nav';
import { Button, Card, TextArea, TextField } from '../components/UI';
import { CheckIcon, ChevronLeftIcon } from '../components/Icon';

const STATUS_OPTIONS: { value: SongStatus; label: string; hint: string }[] = [
  { value: 'draft', label: 'Entwurf', hint: 'In Arbeit – noch nicht draußen' },
  { value: 'released', label: 'Veröffentlicht', hint: 'Fertig und raus' },
];

export default function NewSongView() {
  const { go, back } = useNav();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<SongStatus>('draft');
  const [text, setText] = useState('');

  const canSave = title.trim().length > 0;

  async function handleCreate() {
    if (!canSave) return;
    const id = await createSong({
      title: title.trim(),
      artist: artist.trim() || undefined,
      date: date || undefined,
      status,
      text,
    });
    go({ name: 'song', id });
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeftIcon size={16} />}
          onClick={back}
        >
          Zurück
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<CheckIcon size={16} />}
          onClick={handleCreate}
          disabled={!canSave}
        >
          Anlegen
        </Button>
      </div>

      <h2 className="font-display text-2xl font-semibold text-stone-900">
        Neuer Eintrag
      </h2>

      <Card className="space-y-4 p-5">
        <TextField
          label="Titel"
          placeholder="Wie soll dieser Eintrag heißen?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Artist"
            placeholder="optional"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <TextField
            label="Datum"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            help="YYYY-MM-DD"
          />
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-stone-500">
            Status
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setStatus(o.value)}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  status === o.value
                    ? 'border-leaf-600 bg-leaf-50'
                    : 'border-stone-200 bg-cream-50 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-medium text-stone-900">{o.label}</div>
                <div className="text-xs text-stone-500">{o.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <TextArea
          label="Text (optional, kannst du später ausfüllen)"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Erste Zeile …\n…'}
          className="font-mono text-sm leading-relaxed"
        />
      </Card>
    </section>
  );
}
