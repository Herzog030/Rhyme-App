import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  addRhymeToSong,
  db,
  deleteRhyme,
  deleteSong,
  updateSong,
  type Song,
  type SongStatus,
} from '../lib/db';
import { useNav } from '../nav';
import { Button, Card, SectionTitle, TextArea, TextField, Toast } from '../components/UI';
import {
  CheckIcon,
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '../components/Icon';

const STATUS_OPTIONS: { value: SongStatus; label: string }[] = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'released', label: 'Veröffentlicht' },
];

interface SongViewProps {
  id: number;
}

export default function SongView({ id }: SongViewProps) {
  const { go, back } = useNav();
  const song = useLiveQuery(() => db.songs.get(id), [id]);
  const rhymes = useLiveQuery(
    () => db.rhymes.where('songId').equals(id).toArray(),
    [id],
    [],
  );

  // Lokaler Draft-State, damit das Tippen nicht jedes Zeichen persistiert.
  const [draft, setDraft] = useState<Song | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (song) setDraft(song);
  }, [song]);

  const dirty = useMemo(() => {
    if (!song || !draft) return false;
    return (
      song.title !== draft.title ||
      (song.artist ?? '') !== (draft.artist ?? '') ||
      song.status !== draft.status ||
      (song.date ?? '') !== (draft.date ?? '') ||
      song.text !== draft.text ||
      (song.notes ?? '') !== (draft.notes ?? '') ||
      (song.tags ?? []).join(',') !== (draft.tags ?? []).join(',')
    );
  }, [song, draft]);

  async function handleSave() {
    if (!draft || !draft.id) return;
    await updateSong(draft.id, {
      title: draft.title.trim() || 'Ohne Titel',
      artist: draft.artist?.trim() || undefined,
      status: draft.status,
      date: draft.date || undefined,
      text: draft.text,
      notes: draft.notes,
      tags: draft.tags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleDelete() {
    if (!song?.id) return;
    if (!confirm(`„${song.title}" wirklich löschen?`)) return;
    await deleteSong(song.id);
    back();
  }

  if (!song || !draft) {
    return <div className="py-10 text-center text-stone-500">Lade Song …</div>;
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeftIcon size={16} />}
          onClick={() => go({ name: 'archive' })}
        >
          Texte
        </Button>
        <div className="flex items-center gap-2">
          {saved && <Toast tone="success" message="Gespeichert" />}
          <Button
            variant="secondary"
            size="sm"
            icon={<TrashIcon size={16} />}
            onClick={handleDelete}
          >
            Löschen
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<CheckIcon size={16} />}
            onClick={handleSave}
            disabled={!dirty}
          >
            Speichern
          </Button>
        </div>
      </div>

      <Card className="space-y-4 p-5">
        <TextField
          label="Titel"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Artist"
            value={draft.artist ?? ''}
            onChange={(e) => setDraft({ ...draft, artist: e.target.value })}
            placeholder="optional"
          />
          <TextField
            label="Datum"
            type="date"
            value={draft.date ?? ''}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            help="YYYY-MM-DD"
          />
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
            Status
          </span>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setDraft({ ...draft, status: o.value })}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  draft.status === o.value
                    ? 'border-leaf-600 bg-leaf-600 text-white'
                    : 'border-stone-200 bg-cream-50 text-stone-600 hover:border-stone-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <TagsEditor
          tags={draft.tags ?? []}
          onChange={(tags) => setDraft({ ...draft, tags })}
        />
      </Card>

      <div>
        <SectionTitle>Songtext</SectionTitle>
        <TextArea
          rows={16}
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          placeholder={'Erste Strophe\nZweite Zeile\n\n[Refrain]\n…'}
          className="font-mono text-sm leading-relaxed"
        />
      </div>

      <div>
        <SectionTitle>Notizen</SectionTitle>
        <TextArea
          rows={4}
          value={draft.notes ?? ''}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Stimmung, Referenzen, offene Stellen …"
        />
      </div>

      <RhymesSection songId={id} existing={rhymes ?? []} />

      {dirty && (
        <div className="fixed inset-x-0 bottom-20 z-10 mx-auto flex max-w-3xl justify-center px-5">
          <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-cream-50/95 px-4 py-2 shadow-pop backdrop-blur">
            <span className="text-sm text-stone-600">Ungespeicherte Änderungen</span>
            <Button size="sm" onClick={handleSave} icon={<CheckIcon size={16} />}>
              Speichern
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function TagsEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');
  function addTag() {
    const t = input.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setInput('');
      return;
    }
    onChange([...tags, t]);
    setInput('');
  }
  return (
    <div>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
        Tags
      </span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-cream-50 px-2.5 py-1 text-xs"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="text-stone-400 hover:text-stone-700"
              aria-label={`Tag „${t}" entfernen`}
            >
              <XIcon size={12} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder="+ Tag"
          className="inline-flex min-w-[6rem] rounded-full border border-dashed border-stone-300 bg-transparent px-2.5 py-1 text-xs outline-none focus:border-leaf-600"
        />
      </div>
    </div>
  );
}

function RhymesSection({
  songId,
  existing,
}: {
  songId: number;
  existing: { id?: number; words: string[]; note?: string }[];
}) {
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');

  async function handleAdd() {
    const words = draft
      .split(/[,\s/|]+/)
      .map((w) => w.trim())
      .filter(Boolean);
    if (words.length < 2) return;
    await addRhymeToSong(songId, words, { note: note.trim() || undefined });
    setDraft('');
    setNote('');
  }

  return (
    <div>
      <SectionTitle>Reime zum Song</SectionTitle>
      <Card className="p-4">
        <div className="space-y-3">
          <TextField
            label="Reim"
            placeholder="z.B. Herz, Schmerz, Scherz"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            help="Wörter mit Komma, Schrägstrich oder Leerzeichen trennen."
          />
          <TextField
            label="Notiz"
            placeholder="optional – Strophe, Idee, Kontext"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={handleAdd}
            disabled={draft.trim().split(/\s+/).length < 2}
          >
            Reim hinzufügen
          </Button>
        </div>
      </Card>

      {existing.length === 0 ? null : (
        <ul className="mt-3 space-y-2">
          {existing.map((r) => (
            <li key={r.id}>
              <Card className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.words.map((w, i) => (
                      <span
                        key={`${w}-${i}`}
                        className="rounded-full bg-leaf-50 px-2.5 py-0.5 text-sm font-medium text-leaf-800"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                  {r.note && (
                    <p className="mt-1.5 text-xs text-stone-500">{r.note}</p>
                  )}
                </div>
                {r.id !== undefined && (
                  <button
                    type="button"
                    onClick={() => deleteRhyme(r.id!)}
                    className="shrink-0 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600"
                    aria-label="Reim löschen"
                  >
                    <TrashIcon size={14} />
                  </button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
