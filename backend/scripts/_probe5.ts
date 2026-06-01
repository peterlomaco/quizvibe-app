import { findWikipediaPageImage, searchCommons } from '../wikimedia/client';
const items = [
  {id:'peter-haber',hints:['Peter Haber actor Beck','Peter Haber']},
  {id:'valter-skarsgard',hints:['Valter Skarsgård','Valter Skarsgård actor']},
  {id:'edvin-ryding',hints:['Edvin Ryding','Edvin Ryding actor']},
  {id:'gizem-erdogan',hints:['Gizem Erdogan','Gizem Erdoğan']},
  {id:'ludmila-engquist',hints:['Ludmila Engquist','Ljudmila Engquist']},
];
(async () => {
  for (const it of items) {
    console.log('\n==== '+it.id+' ====');
    for (const lang of ['sv','en'] as const) {
      for (const h of it.hints) {
        try {
          const r = await findWikipediaPageImage(h, {lang});
          if (r) console.log(`  pageimage[${lang}] "${h}": ${r.width}x${r.height} ${r.license} -> ${r.url}`);
          else console.log(`  pageimage[${lang}] "${h}": none`);
        } catch(e){ console.log(`  pageimage[${lang}] "${h}": ERR ${(e as Error).message}`); }
      }
    }
    try {
      const c = await searchCommons(it.hints[0],{limit:6});
      console.log('  commons:', c.slice(0,4).map(x=>`${x.width}x${x.height} ${x.title}`).join(' | '));
    } catch(e){ console.log('  commons ERR'); }
  }
})();
