// hintsDistractorPool.ts — vilka items som får bli svarsalternativ i en
// Hints-fråga. Ren funktion utan React-beroenden så regeln kan testas.
//
// Lager striktast → lösast. Varje lager används om det rymmer minst
// POOL_THRESHOLD items (1 rätt + 4 distraktorer):
//
//   idrottare:  sport+land+kön → land+kön → sport+kön → kön → golvet
//   övriga:     land+kön       → kön                       → golvet
//
// GOLVET är samma kön när könet är känt, annars samma contentSubject.
// Det faller ALDRIG tillbaka till hela IMAGE_QUIZ_QUESTIONS — subject-
// integriteten är absolut (en idrottare får aldrig en skådespelare som
// alternativ), och köns-homogeniteten likaså (Peter 2026-08-12).

import { HINTS_LIBRARY, inferGender, inferNationality, inferSport } from './hintsData';
import type { HintLibrary } from './hintsData';
import { getPersonGender, type PersonGender } from './personGender';
import type { ImageQuizQuestion } from './quizImageQuestions';

/** 1 rätt + 4 distraktorer. */
export const POOL_THRESHOLD = 5;

/**
 * contentSubjects där kön är en meningsfull egenskap. `band` saknas MEDVETET
 * — en grupp har inget kön, så band-frågor är aldrig köns-låsta.
 */
export const GENDERED_SUBJECTS = new Set<string>([
  'artist', 'actor', 'athlete', 'cultural-person', 'celebrity',
]);

/**
 * Kön för ett katalog-item: Wikidata P21 först (personGender.ts), pronomen-
 * heuristiken sist. `inferGender` kan inte bära regeln själv — den läser
 * hint-texterna, som sällan innehåller pronomen, och träffar ~2 % av katalogen.
 */
export function resolveItemGender(itemId: string, lib?: HintLibrary): PersonGender | null {
  return getPersonGender(itemId) ?? (lib ? inferGender(lib) : null);
}

export interface HintsDistractorPool {
  /** Items som `buildImageVariant` får plocka distraktorer ur (rätt svar ingår). */
  itemPool: ImageQuizQuestion[];
  /**
   * true när alla items i poolen har samma kön som rätt svar. Caller MÅSTE då
   * skicka en tom `distractorNames` till `buildImageVariant` — den generiska
   * namn-poolen har inget känt kön och skulle läcka in fel kön som utfyllnad.
   */
  genderLocked: boolean;
}

export function buildHintsDistractorPool(
  correctItem: ImageQuizQuestion,
  allItems: readonly ImageQuizQuestion[],
): HintsDistractorPool {
  const sameSubject = allItems.filter((q) => q.contentSubject === correctItem.contentSubject);
  const correctLib = HINTS_LIBRARY[correctItem.id];

  const correctGender = GENDERED_SUBJECTS.has(correctItem.contentSubject)
    ? resolveItemGender(correctItem.id, correctLib)
    : null;
  const genderLocked = correctGender !== null;

  const sameGender = genderLocked
    ? sameSubject.filter(
        (q) => q.id === correctItem.id || resolveItemGender(q.id, HINTS_LIBRARY[q.id]) === correctGender,
      )
    : sameSubject;

  // Golvet — här slutar nedtrappningen.
  const floor = genderLocked ? sameGender : sameSubject;

  const correctNationality = correctLib ? inferNationality(correctLib) : null;
  const sameNationalityAndGender = correctNationality
    ? sameGender.filter((q) => {
        const lib = HINTS_LIBRARY[q.id];
        return lib ? inferNationality(lib) === correctNationality : false;
      })
    : null;

  const enough = (pool: ImageQuizQuestion[] | null): pool is ImageQuizQuestion[] =>
    pool !== null && pool.length >= POOL_THRESHOLD;

  if (correctItem.contentSubject === 'athlete') {
    const correctSport = correctLib ? inferSport(correctLib) : null;

    const sameSportAndGender = correctSport
      ? sameGender.filter((q) => {
          const lib = HINTS_LIBRARY[q.id];
          return lib ? inferSport(lib) === correctSport : false;
        })
      : null;

    const sameSportNationalityGender =
      sameSportAndGender && sameNationalityAndGender
        ? sameSportAndGender.filter((q) => sameNationalityAndGender.includes(q))
        : null;

    if (enough(sameSportNationalityGender)) return { itemPool: sameSportNationalityGender, genderLocked };
    if (enough(sameNationalityAndGender)) return { itemPool: sameNationalityAndGender, genderLocked };
    if (enough(sameSportAndGender)) return { itemPool: sameSportAndGender, genderLocked };
    if (sameGender.length >= POOL_THRESHOLD) return { itemPool: sameGender, genderLocked };
    return { itemPool: floor, genderLocked };
  }

  if (enough(sameNationalityAndGender)) return { itemPool: sameNationalityAndGender, genderLocked };
  if (sameGender.length >= POOL_THRESHOLD) return { itemPool: sameGender, genderLocked };
  return { itemPool: floor, genderLocked };
}
