// questionStats.ts — fire-and-forget-skrivning av svar till question_answers-tabellen.
// Används för att bygga upp svårighetsgrad-statistik per fråga (% rätt globalt
// över alla QuizVibe-spelare). Logik för att ANVÄNDA statistiken implementeras
// i ett framtida pass — detta är bara datainsamlingsgrunden.
//
// Anropas från recordRoundScore i quiz.tsx efter varje besvarad fråga.
// Fel tystas — ett missat svar-record ska aldrig påverka spelflödet.

import { supabase } from './supabase';

export async function recordQuestionAnswer(
  questionId: string,
  isCorrect: boolean,
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('question_answers').insert({
      question_id: questionId,
      is_correct: isCorrect,
      user_id: user?.id ?? null,
    });
  } catch (err) {
    if (__DEV__) console.warn('[questionStats] recordQuestionAnswer failed:', err);
  }
}
