// vectorize — gör en svart-på-vit line art-sketch till VEKTOR-paths (potrace) så
// frontend kan rita varje bläck-linje "för hand" (strokeDashoffset längs path:en),
// tutorial-stil, istället för en raster-mask-reveal.
//
// Flöde: assets/quiz-sketches/<id>.webp → PNG (sharp) → potrace → kombinerad path-d
// → splitta i delpaths (= "streck") → längd + topp-y per streck (svg-path-properties)
// → ordna top→bottom (ritas uppifrån) → skriv src/utils/quizSketchPaths.ts.
//
// Frontend väljer vektor-self-draw om id finns i quizSketchPaths, annars raster-fallback.
//
// CLI: npm run sketch-vectorize -- --id <id> [--turd 8] [--min-len 3]
//
// OBS: ett foto-edges-underlag har mer detalj än en handritad tutorial → många
// delpaths. turdSize (släpp specks) + min-len + optTolerance simplifierar.

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as potrace from 'potrace';
import { svgPathProperties } from 'svg-path-properties';

const SKETCH_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-sketches');
const OUT_FILE = path.join(__dirname, '..', '..', 'src', 'utils', 'quizSketchPaths.ts');

interface Stroke {
  d: string;
  len: number;
}
interface SketchPaths {
  w: number;
  h: number;
  strokes: Stroke[];
}

function tracePng(png: Buffer, turdSize: number, threshold: number): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.trace(
      png,
      {
        turdSize, // släpp regioner mindre än N px (brus-specks)
        turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
        alphaMax: 1,
        optCurve: true,
        optTolerance: 0.4, // högre = mer kurv-simplifiering → färre segment
        // Pixlar MÖRKARE än threshold spåras. Line art har grå linjer (150-200) —
        // för låg tröskel (128) släpper dem → "saknade" linjer. Höj för att fånga
        // gråa linjer, men ej så högt att off-vit bakgrund/halos blir specks.
        threshold,
        blackOnWhite: true,
      },
      (err: Error | null, svg: string) => (err ? reject(err) : resolve(svg)),
    );
  });
}

function parseSvg(svg: string): { w: number; h: number; d: string } {
  const w = Number(/width="(\d+)/.exec(svg)?.[1] ?? 0);
  const h = Number(/height="(\d+)/.exec(svg)?.[1] ?? 0);
  // potrace lägger all geometri i ETT <path d="...">; subpaths separeras av M/m.
  const d = /<path[^>]*\bd="([^"]+)"/.exec(svg)?.[1] ?? '';
  return { w, h, d };
}

function splitSubpaths(d: string): string[] {
  return d
    .split(/(?=[Mm])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

function roundD(d: string): string {
  return d.replace(/-?\d+\.\d+/g, (m) => (Math.round(parseFloat(m) * 10) / 10).toString());
}

function topY(props: InstanceType<typeof svgPathProperties>, len: number): number {
  let min = Infinity;
  const N = 8;
  for (let i = 0; i <= N; i++) {
    const p = props.getPointAtLength((len * i) / N);
    if (p.y < min) min = p.y;
  }
  return min;
}

async function main() {
  const args = process.argv.slice(2);
  let id = '';
  let turd = 8;
  let minLen = 3;
  let threshold = 128;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id') id = args[++i];
    else if (args[i] === '--turd') turd = Number(args[++i]);
    else if (args[i] === '--min-len') minLen = Number(args[++i]);
    else if (args[i] === '--threshold') threshold = Number(args[++i]);
  }
  if (!id) {
    console.error('Usage: npm run sketch-vectorize -- --id <id> [--turd 8] [--min-len 3] [--threshold 128]');
    process.exit(1);
  }

  const webp = path.join(SKETCH_DIR, `${id}.webp`);
  if (!fs.existsSync(webp)) throw new Error(`Sketch saknas: ${webp}`);

  // potrace via jimp klarar inte webp → konvertera till PNG-buffer först.
  const png = await sharp(webp).png().toBuffer();
  const svg = await tracePng(png, turd, threshold);
  const { w, h, d } = parseSvg(svg);
  if (!d) throw new Error('potrace returnerade ingen path-data.');

  const subpaths = splitSubpaths(d);
  const strokes: (Stroke & { _top: number })[] = [];
  for (const sub of subpaths) {
    let props: InstanceType<typeof svgPathProperties>;
    let len: number;
    try {
      props = new svgPathProperties(sub);
      len = props.getTotalLength();
    } catch {
      continue;
    }
    if (len < minLen) continue; // släpp pyttesmå streck (brus)
    strokes.push({ d: roundD(sub), len: Math.round(len * 10) / 10, _top: topY(props, len) });
  }
  // Ordna top→bottom så ritandet börjar uppe (hår) och går nedåt.
  strokes.sort((a, b) => a._top - b._top);
  const clean: Stroke[] = strokes.map((s) => ({ d: s.d, len: s.len }));

  const data: Record<string, SketchPaths> = { [id]: { w, h, strokes: clean } };
  const json = JSON.stringify(data, null, 2);

  const out = [
    '// Auto-genererad vektor-path-data för line-art-sketcher (self-drawing i SketchCanvas).',
    '// Genererad av backend/sketch/vectorize.ts (potrace). Varje stroke ritas via',
    '// strokeDashoffset längs sin egen bana → "ritas för hand", tutorial-stil.',
    '// REDIGERA INTE FÖR HAND. Kör: npm run sketch-vectorize -- --id <id>',
    '',
    'export interface SketchStroke { d: string; len: number; }',
    'export interface SketchPathData { w: number; h: number; strokes: SketchStroke[]; }',
    '',
    `export const QUIZ_SKETCH_PATHS: Record<string, SketchPathData> = ${json};`,
    '',
    '/** Vektor-paths för self-drawing, eller null om sketchen inte vektoriserats. */',
    'export function getSketchPaths(id: string): SketchPathData | null {',
    '  return QUIZ_SKETCH_PATHS[id] ?? null;',
    '}',
    '',
  ].join('\n');

  fs.writeFileSync(OUT_FILE, out, 'utf8');
  console.log(`Vektoriserade ${id}: ${clean.length} strokes (källa ${w}×${h}) → ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(`ERROR: ${(e as Error).message}`);
  process.exit(1);
});
