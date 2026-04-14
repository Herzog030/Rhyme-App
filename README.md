# My Book Of Rhymes

Persönliche PWA für mein **Textarchiv, Entwürfe und Reimwörterbuch** –
offline nutzbar, mobile-first, alle Daten liegen lokal auf dem Gerät.

## Features

- 📖 **Textarchiv** – vollständige Diskografie + Entwürfe + Ideen in einem
  Archiv, unterschieden nur über Status-Flag (Idee / Entwurf / Released)
  und Datum (YYYY-MM-DD)
- ✍️ **Song-Editor** mit Titel, Artist, Datum, Status, Text, Notizen, Tags
- 🎯 **Reime am Song** – pro Song kannst du Reimpaare oder -gruppen
  festhalten. In Phase 4 werden diese zum kuratierten Reim-Wörterbuch
- 💾 **Backup & Restore** per JSON-Export/Import
- 📴 **Offline** – alle Daten in IndexedDB, keine Konten, kein Tracking
- 📱 **Installierbar** auf iOS/Android/Desktop als PWA

## Roadmap

| Phase | Status | Inhalt |
|-------|--------|--------|
| 1 | ✓ | Umbenennung, neues DB-Schema, alte Reim-Engine entfernt |
| 2 | ✓ | Neues Design (cremiges Weiß, grüne Akzente, SVG-Icons) |
| 3 | ✓ | Textarchiv mit Songs, Entwürfen, Ideen + Reime am Song |
| 4 | ⏳ | Reim-Wörterbuch: hybrider Ansatz aus kuratierten Reimen und präzisen Vorschlägen |

## Tech Stack

- **Vite + React + TypeScript**
- **Dexie.js** (IndexedDB) für lokale Persistenz
- **vite-plugin-pwa** für Service Worker & Manifest
- **Tailwind CSS** mit eigenem Token-System (`cream`, `leaf`, `stone`)

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server (mit LAN-Zugriff)
npm run typecheck  # TypeScript-Prüfung
npm run test       # Unit-Tests
npm run build      # Produktions-Build
npm run preview    # Produktions-Build lokal testen
```

## Datenmodell

```
songs      id, title, artist, status, date, text, notes, tags,
           createdAt, updatedAt
rhymes     id, songId, words[], quality?, lineIndices?, note, createdAt
vocabulary id, word, original, source, songId?, createdAt    (für Phase 4)
```

Reime gehören immer zu genau einem Song (enge Verzahnung – sie behalten so
ihren Kontext). Die `vocabulary`-Tabelle liegt bereits im Schema vor, wird
aber erst in Phase 4 von der UI genutzt.

## Deployment

Automatisch über GitHub Actions nach GitHub Pages:
`https://herzog030.github.io/Rhyme-App/`
