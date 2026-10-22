/**
 * Neutral UI tokens for applying the locked QuizVibe Brand Master
 * (design/brand/README.md) on navy. Introduced with Home v2 (locked
 * 2026-10-16).
 *
 * Rule: gold means brand emphasis or an active/selected state, never
 * decoration. Everything neutral, inactive or secondary uses these
 * reduced-opacity whites instead of blue or raw greys.
 */
export const BrandUi = {
  /** Neutral button/card surface on navy. */
  surface: 'rgba(255,255,255,0.06)',
  /** Neutral hairline border. */
  border: 'rgba(255,255,255,0.14)',
  /** Secondary text (tagline, footer, subtitles, section headings). */
  textMuted: 'rgba(255,255,255,0.6)',
  /** Inactive/neutral icons and chevrons. */
  iconMuted: 'rgba(255,255,255,0.55)',
  /** Functional icons on neutral surfaces. */
  icon: '#FFFFFF',
  /** Switch ON — QuizVibe gold (Profile v2, 2026-10-16). Aldrig grön/röd. */
  toggleOn: '#F5A623',
  /** Switch OFF — mörk gunmetal, låg kontrast. */
  toggleOff: '#2A3345',
  // ── QuizVibeToggle (2026-10-19): OFF = navy/gunmetal, ON = QuizVibe-guld ──
  /** Spår i OFF-läge. */
  toggleOffTrack: '#141C2B',
  /** Tunn kant runt spåret i OFF-läge. */
  toggleOffBorder: 'rgba(255,255,255,0.12)',
  /** Mörk gunmetal-knopp (OFF). */
  toggleKnobOff: '#3A4458',
  /** Svag kant runt OFF-knoppen. */
  toggleKnobOffBorder: 'rgba(255,255,255,0.18)',
  /** Spår i ON-läge — fortsatt mörk navy (guldet bärs av knopp, kant, text). */
  toggleOnTrack: '#171D2A',
  /** Kant runt spåret i ON-läge. */
  toggleOnBorder: 'rgba(245,166,35,0.65)',
  /** Glöd (iOS-skugga) runt ON-knoppen. */
  toggleOnGlow: '#F5A623',
  /** Ikon i knoppen när den är guld (mörk så den syns på metallen). */
  toggleIconOn: '#1A1205',
  /** OFF-etikett — tydligt läsbar (inaktiv, inte disabled). */
  toggleLabelOff: 'rgba(255,255,255,0.82)',
  /** Dämpad OFF/ON-etikett på den inaktiva sidan. */
  toggleLabelMuted: 'rgba(255,255,255,0.35)',
  /** Card surface for Profile sections (slightly lighter navy). */
  card: 'rgba(255,255,255,0.04)',
  /**
   * Fyllning för valda/aktiva rutor med guldkant (UI v2 2026-10-22): sval
   * mörk navy/gunmetal. Ersätter Colors.warningMuted som fyllning — den
   * genomskinliga guldtonen blev brunaktig mot navy-bakgrunden.
   */
  selectedFill: '#172234',
} as const;
