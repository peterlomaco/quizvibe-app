// responsive.ts — app-wide device-size constants read ONCE at module load.
//
// Konventionen speglar quizLayout.ts och HintsQuizCard.tsx: appen är
// porträttlåst (app.json) och har ingen runtime-resize-hantering, så
// Dimensions läses en gång vid import i stället för via useWindowDimensions.
//
// quizLayout.ts täcker quiz-skärmens HÖJD-baserade skalning (qh/qf mot usable
// height). Den här modulen täcker BREDD-baserade behov utanför quizet.

import { Dimensions } from 'react-native';

export const SCREEN_W = Dimensions.get('window').width;

/**
 * Viewport-bredd för de centrerade host-setup-track-kontrollerna: Game Era-
 * slidern (Lobby + Profile) och Number of Rounds-linjemätaren (RoundsRuler).
 *
 * Ersätter den tidigare hårdkodade 280 px som klippte på iPhone SE (~254 px
 * kort-innehållsbredd efter screen- + card-padding) och lämnade död yta på
 * Pro Max (~364 px tillgängligt). Fyller tillgänglig bredd = SCREEN_W minus
 * ~72 px horisontell chrome (content paddingHorizontal 16 + quizSettingsBorder
 * padding 16 per sida ≈ 64, + marginal för kant/glow), cappad så marker-
 * avståndet inte blir orimligt brett på stora telefoner, golvad så den aldrig
 * kollapsar.
 *
 * Resultat: 320→248, 375→303, 390→318, 414/430→340 (cappad). Alla ≤ tillgänglig
 * kort-innehållsbredd → RoundsRulers ±13 px klammer-överhäng ryms i card-
 * paddingen i stället för att klippas mot kortkanten.
 *
 * EN delad konstant håller slidern och linjemätaren pixel-alignade (de ligger
 * staplade i samma Card och MÅSTE dela viewport — se koden i LobbyScreen/
 * ProfileScreen/RoundsRuler).
 */
export const TRACK_VIEWPORT_W = Math.max(220, Math.min(340, SCREEN_W - 72));
