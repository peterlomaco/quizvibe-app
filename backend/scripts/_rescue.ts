const UA='QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
async function search(name:string,lang:string){
  const u='https://www.wikidata.org/w/api.php?'+new URLSearchParams({action:'wbsearchentities',search:name,language:lang,uselang:lang,type:'item',limit:'20',format:'json',origin:'*'});
  const r=await fetch(u,{headers:{'User-Agent':UA}}); const d:any=await r.json(); return d.search??[];
}
async function p18(qid:string){
  const u='https://www.wikidata.org/w/api.php?'+new URLSearchParams({action:'wbgetentities',ids:qid,props:'claims',format:'json',origin:'*'});
  const r=await fetch(u,{headers:{'User-Agent':UA}}); const d:any=await r.json();
  return d.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
}
const targets=[
  {id:'nordman',q:'Nordman',want:['band','grupp','musical','duo','folk']},
  {id:'robin-olsen',q:'Robin Olsen',want:['football','soccer','fotboll','goalkeeper','målvakt']},
  {id:'tobias-karlsson-handball',q:'Tobias Karlsson',want:['handball','handboll']},
];
(async()=>{
  for(const t of targets){
    console.log('\n==== '+t.id+' ====');
    const cands=[...await search(t.q,'sv'),...await search(t.q,'en')];
    const seen=new Set();
    for(const c of cands){
      if(seen.has(c.id))continue; seen.add(c.id);
      const desc=(c.description||'').toLowerCase();
      const match=t.want.some(w=>desc.includes(w));
      if(match){ const img=await p18(c.id); console.log(`  ${c.id} "${c.description}" P18=${img||'none'}`); }
    }
  }
})();
