// personGender.ts — kön per katalog-item, för köns-homogena svarsalternativ.
//
// REGEL (Peter 2026-08-12): är rätt svar en kvinna ska ALLA svarsalternativ
// vara kvinnor; är det en man ska alla vara män. Blandade alternativ gör
// frågan lättare än den ska vara — halva fältet kan sorteras bort på en
// blick utan att man känner igen personen.
//
// KÄLLA: Wikidata P21 (sex or gender), hämtad av
// `backend/scripts/fetch-person-gender.ts` → `personGenderGenerated.ts`.
//
// ⚠ Använd INTE `inferGender()` i hintsData.ts för det här. Den räknar
// he/his/him vs she/her/hers i hint-TEXTERNA, men hint-värden är fakta-
// fragment ('"Billie Jean" (1983)', 'Born: August 29, 1958') som sällan
// innehåller pronomen — den gav kön för 16 av 836 items (~2 %) och lämnade
// alltså köns-filtret verkningslöst. Den finns kvar som sista fallback här.
//
// Kön är MEDVETET inte definierat för band/grupper (`contentSubject: 'band'`)
// — en grupp har inget kön, så köns-låsningen gäller inte band-frågor.

import { PERSON_GENDER_GENERATED, type PersonGender } from './personGenderGenerated';

export type { PersonGender };

/**
 * Manuella rättelser — åsidosätter den genererade filen, som skrivs om i sin
 * helhet vid varje ny körning av fetch-person-gender. Lägg till id:n härifrån
 * `backend/output/person-gender-report.md` (items som inte kunde lösas upp)
 * eller när Wikidata haft fel person.
 */
export const PERSON_GENDER_MANUAL: Record<string, PersonGender> = {
  // Scriptets födelseårs-kontroll avvisade Wikidata-träffen för de här tre
  // (namnet delas med en annan person), men könet är otvetydigt.
  'michael-owen': 'male',
  'ngolo-kante': 'male',
  'sergio-aguero': 'male',

  // Sökningen fångade en TV-serie med samma namn ("Olivia Newton-John",
  // Q28224394, "television series") i stället för personen (Q185165,
  // "British–Australian singer (1948–2022)") — bekräftat manuellt 2026-08-27.
  'olivia-newton-john': 'female',

  // En-namns-/tvetydiga artister vars sökning inte kunde disambigueras av
  // scriptets födelseårs-kontroll — könet är otvetydigt (bekräftat manuellt
  // 2026-08-30). Nemo (Schweiz, ESC 2024) är MEDVETET utelämnad: öppet
  // icke-binär → ska sakna kön (se not nedan + test-exkludering).
  'frans': 'male',      // Frans Jeppsson Wall (SE, ESC 2016)
  'lena': 'female',     // Lena Meyer-Landrut (DE, ESC 2010)
  'psy': 'male',        // Park Jae-sang (KR, "Gangnam Style")
  'ruslana': 'female',  // Ruslana Lyzhychko (UA, ESC 2004)
  'snow': 'male',       // Darrin O'Brien ("Informer")
  'zayn': 'male',       // Zayn Malik

  // ⚠ Lägg INTE in items vars P21 är icke-binär (Miley Cyrus, Demi Lovato,
  // Sam Smith, Nemo). De ska sakna kön här → ingen låsning, subject-poolen gäller.
};

const MERGED: Record<string, PersonGender> = {
  ...PERSON_GENDER_GENERATED,
  ...PERSON_GENDER_MANUAL,
};

/** Kön för ett katalog-item, eller null när det är okänt/ej tillämpligt. */
export function getPersonGender(itemId: string): PersonGender | null {
  return MERGED[itemId] ?? null;
}

/** Antal items med känt kön — används av tester/diagnostik. */
export function personGenderCoverage(): number {
  return Object.keys(MERGED).length;
}
