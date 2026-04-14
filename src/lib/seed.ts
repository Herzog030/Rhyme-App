/**
 * Kompakter deutscher Grundwortschatz zum Starten (~600 häufige Wörter).
 *
 * Rechtlicher Hinweis:
 *   Diese Liste basiert auf freiem Allgemeinwortschatz (eigene Zusammen-
 *   stellung, orientiert an Grundwortschatz-Empfehlungen). Sie ersetzt
 *   kein vollständiges Wörterbuch – die App wächst durch eigene Import-
 *   Vorgänge (Songtexte, manuelle Einträge).
 *
 * Der Reim-Algorithmus funktioniert unabhängig von der Größe der Liste:
 *  je mehr Wörter du importierst, desto besser werden die Treffer.
 */

export const SEED_WORDS: string[] = [
  // Substantive (häufig)
  'Herz', 'Schmerz', 'Scherz', 'Kerze', 'Terz',
  'Liebe', 'Triebe', 'Diebe', 'Hiebe', 'Siebe', 'Rübe', 'Stube',
  'Zeit', 'Leid', 'Neid', 'Eid', 'Streit', 'Kleid', 'Brot', 'Tod',
  'Traum', 'Raum', 'Schaum', 'Baum', 'Saum', 'Zaum',
  'Licht', 'Gesicht', 'Gericht', 'Gewicht', 'Bericht', 'Pflicht', 'Sicht',
  'Nacht', 'Macht', 'Pracht', 'Schlacht', 'Acht', 'Fracht', 'Jagd',
  'Tag', 'Schlag', 'Vertrag', 'Betrag', 'Ertrag', 'Antrag',
  'Welt', 'Geld', 'Held', 'Feld', 'Zelt', 'Gewalt',
  'Leben', 'Streben', 'Weben', 'Geben', 'Kleben', 'Beben', 'Reben',
  'Liebe', 'Seele', 'Kehle', 'Quelle', 'Stelle', 'Welle', 'Fälle', 'Zelle',
  'Weg', 'Steg', 'Schnee', 'See', 'Idee', 'Armee', 'Kaffee',
  'Wind', 'Kind', 'Rind', 'Sinn', 'Beginn', 'Gewinn', 'Zinn',
  'Mann', 'Bann', 'Kann', 'Tann', 'Plan', 'Wahn', 'Bahn', 'Schwan',
  'Haus', 'Maus', 'Laus', 'Graus', 'Applaus', 'Klaus',
  'Feuer', 'Steuer', 'Mauer', 'Trauer', 'Schauer', 'Bauer', 'Dauer',
  'Regen', 'Segen', 'Wegen', 'Legen', 'Bewegen', 'Verlegen',
  'Liebe', 'Farbe', 'Narbe', 'Garbe', 'Erbe', 'Scherbe', 'Werbe',
  'Nebel', 'Flügel', 'Spiegel', 'Engel', 'Mangel', 'Angel', 'Zange', 'Schlange',
  'Sonne', 'Wonne', 'Tonne', 'Krone', 'Bohne', 'Drohne', 'Zone',
  'Mond', 'Horizont', 'Kont', 'Font', 'Kontinent',
  'Stern', 'Kern', 'Fern', 'Gern', 'Modern',
  'Liebe', 'Frage', 'Sage', 'Lage', 'Plage', 'Klage', 'Tage', 'Wage',
  'Musik', 'Kritik', 'Politik', 'Technik', 'Klinik', 'Tonic',
  'Sänger', 'Finger', 'Hunger', 'Ringer', 'Anfänger', 'Empfänger',
  'Meer', 'Heer', 'Schwer', 'Leer', 'Quer', 'Herr', 'Bär',
  'Rhythmus', 'Stimmung', 'Wirkung', 'Haltung', 'Spannung',
  'Mut', 'Blut', 'Glut', 'Flut', 'Wut', 'Gut', 'Hut', 'Ruf', 'Puff',
  'Sein', 'Schein', 'Wein', 'Stein', 'Bein', 'Rein', 'Klein', 'Fein', 'Mein', 'Dein',
  'Haar', 'Paar', 'Jahr', 'Klar', 'Bar', 'Gar', 'Star',
  'Weise', 'Reise', 'Leise', 'Preise', 'Kreise', 'Eise', 'Speise',
  'Flamme', 'Stamme', 'Damme', 'Kamme', 'Schwamm',
  'Angst', 'Fangst', 'Längst', 'Bangst',
  'Straße', 'Maße', 'Blaße', 'Rasse', 'Klasse', 'Kasse', 'Gasse',

  // Verben (Infinitiv / Präsens)
  'gehen', 'sehen', 'stehen', 'drehen', 'flehen', 'wehen',
  'lieben', 'schieben', 'trieben', 'blieben', 'geblieben',
  'singen', 'klingen', 'bringen', 'ringen', 'springen', 'zwingen', 'schwingen', 'gelingen',
  'reden', 'jeden', 'beten', 'treten', 'geben', 'streben',
  'schlafen', 'strafen', 'hafen', 'trafen', 'schaffen',
  'fallen', 'knallen', 'schallen', 'ballen', 'prallen',
  'hören', 'stören', 'schwören', 'gehören', 'empören',
  'finden', 'binden', 'winden', 'schinden', 'erfinden', 'verschwinden',
  'denken', 'schenken', 'lenken', 'kränken', 'senken',
  'leben', 'weben', 'streben', 'kleben', 'schweben',
  'rennen', 'brennen', 'trennen', 'kennen', 'nennen', 'bekennen',
  'stehen', 'gestehen', 'verstehen', 'entstehen', 'vergehen',
  'sagen', 'tragen', 'fragen', 'jagen', 'schlagen', 'wagen', 'klagen',
  'machen', 'lachen', 'wachen', 'rachen', 'krachen', 'erwachen',
  'glauben', 'rauben', 'tauben', 'schrauben',
  'rufen', 'schufen', 'pusten', 'husten', 'kosten', 'rosten',
  'lieben', 'üben', 'grüßen', 'küssen', 'wissen', 'müssen', 'gewissen',
  'fühlen', 'spielen', 'zielen', 'wählen', 'erzählen',
  'zeigen', 'schweigen', 'steigen', 'neigen', 'eigen', 'reigen',

  // Adjektive / Adverbien
  'schön', 'Krön', 'Föhn',
  'frei', 'drei', 'Brei', 'Schrei', 'Reih', 'zwei',
  'still', 'will', 'mill', 'still',
  'rot', 'tot', 'Not', 'Brot', 'Boot', 'Flott',
  'hart', 'Fahrt', 'Art', 'Bart', 'Start', 'zart', 'Part',
  'kalt', 'bald', 'Wald', 'Halt', 'Gestalt', 'Altar',
  'klein', 'fein', 'rein', 'mein', 'dein', 'sein', 'kein', 'nein', 'allein',
  'weit', 'breit', 'Zeit', 'bereit', 'Seite', 'Heide',
  'hell', 'schnell', 'Fell', 'Welle', 'Stelle', 'Quelle',
  'groß', 'bloß', 'Stoß', 'Schoss', 'Ross', 'Moos',
  'wahr', 'klar', 'bar', 'Jahr', 'Haar', 'Paar',
  'leicht', 'reicht', 'weicht', 'zeigt', 'steigt',
  'laut', 'Braut', 'Haut', 'Kraut', 'Maut', 'vertraut',
  'tief', 'schief', 'Brief', 'Dieb', 'lieb', 'trieb', 'rief',
  'neu', 'Reu', 'Treu', 'scheu', 'Heu',

  // Gefühle / Alltag (für Songtexte besonders relevant)
  'Seele', 'Kehle', 'Befehle', 'Quälen', 'Stehlen', 'Erzählen', 'Fehler',
  'Traum', 'Schaum', 'Baum', 'Raum', 'kaum', 'Zaun',
  'Kuss', 'Schluss', 'Fluss', 'Genuss', 'Verdruss', 'Muss',
  'Angst', 'fängst', 'bangst', 'längst', 'kränkst',
  'Blick', 'Glück', 'Stück', 'zurück', 'Brücke', 'Lücke', 'Mücke',
  'Tränen', 'Sehnen', 'Wähnen', 'Dehnen', 'verwöhnen', 'Szenen',
  'Schatten', 'Matten', 'Ratten', 'Platten', 'glatten',
  'Flügel', 'Zügel', 'Hügel', 'Riegel', 'Siegel', 'Spiegel',
  'Wunden', 'Stunden', 'Kunden', 'Hunden', 'verschwunden', 'gefunden', 'gebunden',
  'Lügen', 'Zügen', 'fügen', 'genügen', 'betrügen', 'vergnügen',
  'Sorgen', 'morgen', 'borgen', 'verborgen', 'geborgen',
  'Liebe', 'Triebe', 'Hiebe', 'Siebe', 'Diebe', 'Schiebe',
  'Licht', 'Pflicht', 'Sicht', 'Gericht', 'Bericht', 'verzicht', 'Gesicht',
  'Nacht', 'Pracht', 'Macht', 'Schlacht', 'gedacht', 'gemacht', 'gelacht', 'verbracht',
  'Stille', 'Hülle', 'Fülle', 'Wille', 'Pille', 'Mille', 'Grille',

  // Füllwörter / Funktionswörter (zur Vervollständigung von Reimen)
  'hier', 'dir', 'mir', 'wir', 'ihr', 'Bier', 'Tier', 'vier', 'Papier', 'Klavier',
  'da', 'ja', 'nah', 'sah', 'sah',
  'so', 'wo', 'froh', 'roh', 'Stroh', 'Floh',
  'nie', 'sie', 'die', 'wie', 'Knie', 'Vieh',
  'nun', 'tun', 'ruhn', 'Huhn',
];
