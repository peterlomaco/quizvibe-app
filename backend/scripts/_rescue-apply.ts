import * as fs from 'fs';
import * as path from 'path';
import { fetchImage, processImage, saveProcessedImage } from '../wikimedia/processor';
const UA='QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
const ASSETS=path.join(__dirname,'..','..','assets','quiz-images');
async function info(file:string){
  const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',titles:'File:'+file,prop:'imageinfo',iiprop:'url|extmetadata|size',format:'json',origin:'*'});
  const r=await fetch(u,{headers:{'User-Agent':UA}}); const d:any=await r.json();
  const p:any=Object.values(d.query?.pages??{})[0]; const ii=p?.imageinfo?.[0]; if(!ii)return null;
  const strip=(s?:string)=>s?s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim():null;
  return {url:ii.url,license:strip(ii.extmetadata?.LicenseShortName?.value),artist:strip(ii.extmetadata?.Artist?.value),w:ii.width,h:ii.height};
}
const items=[
  {id:'nordman',file:'Nordman on stage.jpg'},
  {id:'robin-olsen',file:'Loco-Kopenhagen (10).jpg'},
  {id:'tobias-karlsson-handball',file:'Tobias Karlsson 20180217.jpg'},
];
const out:any[]=[];
(async()=>{
  for(const it of items){
    const f=await info(it.file); if(!f){console.log('no info',it.id);continue;}
    const buf=await fetchImage(f.url); const pr=await processImage(buf);
    await saveProcessedImage(pr.buffer, path.join(ASSETS, it.id+'.webp'));
    console.log(`${it.id}: ${pr.width}x${pr.height} ${f.license} <- ${it.file}`);
    out.push({id:it.id,name:it.id,status:'success',source:'wikidata-rescue',url:f.url,license:f.license,artist:f.artist,outW:pr.width,outH:pr.height,file:it.file});
    await new Promise(r=>setTimeout(r,800));
  }
  fs.writeFileSync(path.join(__dirname,'_rescue-manifest.json'),JSON.stringify(out,null,2));
})();
