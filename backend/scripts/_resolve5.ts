const UA = 'QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
async function titleImage(lang: string, title: string) {
  const url = `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
    action:'query', titles:title, prop:'pageimages', piprop:'original|name', format:'json', origin:'*'
  });
  const r = await fetch(url,{headers:{'User-Agent':UA}});
  const d:any = await r.json();
  const pages = d.query?.pages ?? {};
  const p:any = Object.values(pages)[0];
  if (p?.original) return {url:p.original.source, w:p.original.width, h:p.original.height, file:p.pageimage};
  return null;
}
async function commonsImgs(term: string) {
  const url = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
    action:'query', list:'search', srnamespace:'6', srsearch:term, srlimit:'15', format:'json', origin:'*'
  });
  const r = await fetch(url,{headers:{'User-Agent':UA}});
  const d:any = await r.json();
  const titles = (d.query?.search??[]).map((s:any)=>s.title).filter((t:string)=>/\.(jpe?g|png)$/i.test(t));
  return titles;
}
const tasks = [
  {id:'peter-haber', title:'Peter Haber', term:'Peter Haber'},
  {id:'valter-skarsgard', title:'Valter Skarsgård', term:'Valter Skarsgård'},
  {id:'edvin-ryding', title:'Edvin Ryding', term:'Edvin Ryding'},
  {id:'gizem-erdogan', title:'Gizem Erdoğan', term:'Gizem Erdoğan'},
  {id:'ludmila-engquist', title:'Ludmila Engquist', term:'Ludmila Engquist'},
];
(async()=>{
  for (const t of tasks){
    console.log('\n==== '+t.id+' ====');
    for (const lang of ['sv','en']){
      const r = await titleImage(lang, t.title);
      console.log(`  title[${lang}] "${t.title}": ` + (r?`${r.w}x${r.h} ${r.url}`:'none'));
    }
    const imgs = await commonsImgs(t.term);
    console.log('  commons jpg/png:', imgs.slice(0,8).join(' | ') || '(none)');
  }
})();
