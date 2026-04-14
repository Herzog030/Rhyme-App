# Deutsches Reimwörterbuch (PWA)

Ein offline-fähiges deutsches Reimwörterbuch als Progressive Web App –
optimiert für die Nutzung auf dem Handy und durch eigene Songtexte
beliebig erweiterbar.

## Features

- 🔍 **Reim-Suche** mit phonetischer Analyse (keine reine Text-Endungssuche)
  - Reinreime (`Herz` ↔ `Schmerz`)
  - Mehrsilbige Reime / „double rhymes" (`Liebe` ↔ `Triebe`)
  - Assonanzen (gleicher Vokal, andere Konsonanten)
  - Unreine Reime (konfigurierbar)
- 🎤 **Songtext-Import:** Text einfügen → App erkennt Reimpaare am Zeilenende
  automatisch und ergänzt den Wortschatz
- ✏️ **Manuelle Reime** hinzufügen (Wortpaare, Notizen)
- 📚 **Bibliothek** mit Filtern (Grundwortschatz / aus Songs / manuell) und
  Löschfunktion
- 💾 **Backup & Restore** per JSON-Export/Import
- 📴 **Offline** nutzbar – alle Daten liegen lokal (IndexedDB)
- 📱 **Installierbar** auf iOS/Android/Desktop (über „Zum Startbildschirm
  hinzufügen")

## Tech Stack

- **Vite + React + TypeScript**
- **Dexie.js** (IndexedDB-Wrapper) für lokale Persistenz
- **vite-plugin-pwa** für Service Worker & Manifest
- **Tailwind CSS** für die mobile UI
- **Vitest** für Tests der Phonetik/Reim-Engine

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server (mit LAN-Zugriff)
npm run typecheck  # TypeScript-Prüfung
npm run test       # Unit-Tests (Phonetik & Reim-Matching)
npm run build      # Produktions-Build
npm run preview    # Produktions-Build testen
```

## Architektur

```
src/
├── lib/
│   ├── phonetics.ts   # DE-Wort → Phoneme (Digraphen, Diphthonge,
│   │                    Auslautverhärtung, Schwa, vokalisiertes R)
│   ├── rhyme.ts       # Reim-Keys, Match-Logik, Qualitätsstufen
│   ├── db.ts          # IndexedDB (Dexie) – Wörter/Songs/Paare
│   ├── importer.ts    # Songtext-Parser (Zeilenende-Reime)
│   └── seed.ts        # Grundwortschatz (offen, eigene Zusammenstellung)
├── views/
│   ├── SearchView.tsx
│   ├── ImportView.tsx
│   ├── LibraryView.tsx
│   └── SettingsView.tsx
├── App.tsx            # Tab-Navigation + Shell
└── main.tsx           # Einstiegspunkt
```

## Reim-Algorithmus

Wörter werden in eine vereinfachte Phonem-Sequenz übersetzt (keine
vollständige IPA-Transkription, aber genau genug für Reim-Erkennung).
Die Reim-Qualität wird anhand gemeinsamer End-Phoneme ab der letzten
betonten Silbe bestimmt:

| Qualität    | Beispiel                         |
|-------------|----------------------------------|
| Mehrsilbig  | `Liebe` – `Triebe` (`-iebe`)     |
| Reich       | `Gesicht` – `Gericht` (`-icht`)  |
| Reinreim    | `Herz` – `Schmerz` (`-erz`)      |
| Assonanz    | `Tag` – `Bahn` (Vokal `a`)       |
| Unrein      | Teil-Übereinstimmung am Ende     |

## Hinweis zu double-rhyme.com

Diese App orientiert sich am **Konzept** von double-rhyme.com
(mehrsilbige Reime, Assonanzen), übernimmt aber **keine Daten** aus
dieser Seite. Der Wortschatz wird aus einem offenen Grundwortschatz
und deinen eigenen Songtexten gebaut.
