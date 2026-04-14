import { Card, EmptyState } from '../components/UI';
import { SparkIcon } from '../components/Icon';

/**
 * Reim-Bereich – Phase 4.
 *
 * Gerüst für das spätere Reimwörterbuch. Die alte, fehleranfällige
 * Engine wurde entfernt. In Phase 4 bauen wir einen hybriden Ansatz:
 * kuratierte Reime (aus deinen Songs) + bessere automatische
 * Vorschläge, die du bestätigen kannst – ähnlich double-rhyme.com.
 */
export default function RhymesView() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-stone-900">
          Reime
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Dein persönliches Reimwörterbuch – aus deinen Songs und mit präzisen
          Vorschlägen. Kommt in Phase 4.
        </p>
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-leaf-50 p-2 text-leaf-700">
            <SparkIcon size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-stone-900">
              Was hier entsteht
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              <li>
                <strong className="text-stone-800">Kuratiertes Wörterbuch</strong>
                {' '}– jeder Reim, den du in einem Song festhältst, füttert
                dein Nachschlagewerk.
              </li>
              <li>
                <strong className="text-stone-800">Präzise Vorschläge</strong>
                {' '}– statt algorithmischem Rateraten nur Reime, die wirklich
                klingen (manuell bestätigbar).
              </li>
              <li>
                <strong className="text-stone-800">Verbindung zum Archiv</strong>
                {' '}– siehst direkt, in welchem Song ein Reim schon mal
                vorkam.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <EmptyState
        title="Bald hier"
        description="Bis dahin legst du deine Reime direkt in den jeweiligen Songs an – sie werden später automatisch ins Wörterbuch übernommen."
      />
    </section>
  );
}
