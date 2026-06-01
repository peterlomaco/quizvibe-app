const UA='QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
async function catMembers(cat:string){
  const url='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({
    action:'query',list:'categorymembers',cmtitle:'Category:'+cat,cmtype:'file',cmlimit:'20',format:'json',origin:'*'
  });
  const r=await fetch(url,{headers:{'User-Agent':UA}}); const d:any=await r.json();
  return (d.query?.categorymembers??[]).map((m:any)=>m.title).filter((t:string)=>/\.(jpe?g|png)$/i.test(t));
}
const cats=['Edvin Ryding','Gizem Erdoğan','Gizem Erdogan','Valter Skarsgård','Ludmila Engquist','Lyudmila Narozhilenko','Peter Haber (actor)'];
(async()=>{ for(const c of cats){ const m=await catMembers(c); console.log(`Category:${c} -> `+(m.slice(0,10).join(' | ')||'(none/no category)')); } })();
