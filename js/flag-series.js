window.MEPFlagSeries=(()=>{
 const SERIES_ID="flags-50-states",LOCAL_KEY="mep-state-flags-shared-ratings-v1";
 const theme={bg:"#e9dec0",ink:"#243340",dark:"#25303f",red:"#ae5550",gold:"#e5b850",blue:"#5d849f",cream:"#f9f0d9",mute:"#87939a"};
 const codes=["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
 let manifest={states:[]},byCode=new Map(),ratings={},assetCache=new Map();
 const rasterCache=new Map(),MAX_RASTERS=16;
 function getFlagRaster(url,img){
  if(!img||typeof document==="undefined")return img;
  if(rasterCache.has(url)){const value=rasterCache.get(url);rasterCache.delete(url);rasterCache.set(url,value);return value}
  try{const width=Math.min(720,Math.max(320,img.naturalWidth||640)),height=Math.max(160,Math.min(520,Math.round(width*(img.naturalHeight||480)/(img.naturalWidth||640))));
   const bitmap=document.createElement("canvas");bitmap.width=width;bitmap.height=height;
   const c=bitmap.getContext("2d",{alpha:true});if(!c)return img;
   c.drawImage(img,0,0,width,height);
   rasterCache.set(url,bitmap);while(rasterCache.size>MAX_RASTERS)rasterCache.delete(rasterCache.keys().next().value);return bitmap;
  }catch(e){return img}
 }

 let pendingImageRedraw=false;
 function requestImageRedraw(){
  if(pendingImageRedraw)return;pendingImageRedraw=true;
  requestAnimationFrame(()=>{pendingImageRedraw=false;window.dispatchEvent(new Event("mep-flag-image-ready"))})
 }

 const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 const goodGrade=g=>/^[ABCDF]$/.test(g||"");
 function loadLocal(){try{ratings=JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}")||{}}catch{ratings={}}return ratings}
 function setRatings(next){ratings={...ratings,...(next||{})};try{localStorage.setItem(LOCAL_KEY,JSON.stringify(ratings))}catch{}window.dispatchEvent(new Event("mep-flag-ratings-changed"))}
 function getRatings(){return ratings}
 function updateRating(code,changes){if(!codes.includes(code))throw Error("Invalid state");const prev=ratings[code]||{};const next={...prev,...changes};if(next.grade&&!goodGrade(next.grade))throw Error("Grade must be A, B, C, D or F");if(next.done&&!goodGrade(next.grade))throw Error("Choose a grade before marking a flag completed");next.updatedAt=new Date().toISOString();setRatings({[code]:next});return next}
 async function load(){try{const r=await fetch("flags/manifest.json",{cache:"no-store"});if(!r.ok)throw Error("Flag manifest returned "+r.status);manifest=await r.json();byCode=new Map((manifest.states||[]).map(s=>[s.code,s]));window.dispatchEvent(new Event("mep-flags-ready"));}catch(e){console.warn("Flag manifest unavailable",e)}return manifest}

 async function warm(sh){
  if(!byCode.size)await load();
  const needed=new Set();
  for(const scene of sh?.scenes||[]){
    const b=scene.flagBeat;if(!b)continue;
    if(b.stateCode==="US")needed.add("flags/current/us.svg");
    else if(byCode.has(b.stateCode))needed.add(byCode.get(b.stateCode).current.art);
    if((b.mode==="timeline"||b.mode==="compare")&&byCode.get(b.stateCode)?.history?.some(x=>x.status==="source-verified"))needed.add(byCode.get(b.stateCode).history.filter(x=>x.status==="source-verified").at(-1).art);
    if(b.mode==="montage")for(const code of ["AL","AK","AZ","CA","CO","FL","TX","MN","UT","MS","MD","SC"])needed.add(byCode.get(code)?.current.art);
  }
  const loadOne=url=>new Promise(resolve=>{
    if(!url){resolve(false);return}
    const cached=assetCache.get(url);
    if(cached?.status==="ready"){resolve(true);return}
    if(cached?.status==="error"){resolve(false);return}
    getImage(url);const row=assetCache.get(url);
    if(row.status==="ready"){resolve(true);return}
    const done=()=>resolve(row.status==="ready");
    row.img.addEventListener("load",done,{once:true});row.img.addEventListener("error",done,{once:true});
    setTimeout(done,8000);
  });
  const result=await Promise.all([...needed].map(loadOne));
  return{requested:needed.size,ready:result.filter(Boolean).length,missing:result.filter(x=>!x).length};
 }

 function flagInfo(code){return byCode.get(code)||null}
 function episodeOf(code){const i=codes.indexOf(code);return i<0?0:Math.floor(i/3)+1}
 function getImage(url){
  if(!url)return null;
  if(!assetCache.has(url)){
   const img=new Image();if(/^https?:/i.test(url))img.crossOrigin="anonymous";
   assetCache.set(url,{img,status:"loading"});img.onload=()=>{assetCache.get(url).status="ready";requestImageRedraw()};
   img.onerror=()=>{assetCache.get(url).status="error";requestImageRedraw()};img.src=url;
  }
  const v=assetCache.get(url);return v.status==="ready"?v.img:null
 }
 function rounded(ctx,x,y,w,h,r=16){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
 function text(ctx,str,x,y,size=32,color=theme.cream,{align="center",bold=true,max=660}={}){
  ctx.font=(bold?"900 ":"600 ")+size+"px system-ui";ctx.textAlign=align;ctx.textBaseline="middle";ctx.lineWidth=Math.max(3,size*.14);ctx.lineJoin="round";ctx.strokeStyle="rgba(30,37,45,.7)";ctx.strokeText(str,x,y,max);ctx.fillStyle=color;ctx.fillText(str,x,y,max)
 }
 function bg(ctx,w,h){
  ctx.fillStyle=theme.dark;ctx.fillRect(0,0,w,h);ctx.fillStyle="#344a5a";ctx.fillRect(0,h*.12,w,h*.76);
  ctx.strokeStyle="rgba(249,240,217,.08)";ctx.lineWidth=2;
  for(let x=0;x<w;x+=w/7){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=h/12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  ctx.fillStyle=theme.gold;ctx.fillRect(0,0,w,h*.009)
 }
 function gradeColor(g){return({A:"#55bc83",B:"#84b6da",C:"#e6c05f",D:"#d99655",F:"#db6868"})[g]||theme.mute}
 function flagCard(ctx,code,x,y,w,h,progress=1,{variant="current",title=true}={}){
  const info=flagInfo(code);
  ctx.save();const entrance=1-clamp(progress,0,1);ctx.translate(x+w*.5,y+h*.5);ctx.translate(0,Math.pow(entrance,2)*65);ctx.scale(.92+.08*progress,.92+.08*progress);
  ctx.globalAlpha*=.3+.7*progress;
  const x0=-w*.5,y0=-h*.5;
  ctx.fillStyle=theme.cream;rounded(ctx,x0,y0,w,h,22);ctx.fill();
  const margin=18,top=title?64:22,bottom=22,availW=w-2*margin,availH=h-top-bottom;
  ctx.fillStyle="#d5d5cc";ctx.fillRect(x0+margin,y0+top,availW,availH);
  let art=info?.current?.art;if(code==="US")art="flags/current/us.svg";
  if(variant==="history"&&info?.history?.some(x=>x.status==="source-verified"))art=info.history.filter(x=>x.status==="source-verified").at(-1).art;
  const original=getImage(art),img=original?getFlagRaster(art,original):null;
  if(img){const iw0=img.naturalWidth||img.width||640,ih0=img.naturalHeight||img.height||480;const f=Math.min(availW/iw0,availH/ih0),iw=iw0*f,ih=ih0*f;ctx.drawImage(img,x0+margin+(availW-iw)/2,y0+top+(availH-ih)/2,iw,ih)}
  else{ctx.fillStyle=theme.dark;ctx.fillRect(x0+margin,y0+top,availW,availH);ctx.fillStyle=theme.cream;ctx.font="700 20px system-ui";ctx.textAlign="center";ctx.fillText("Loading flag art...",0,y0+top+availH*.5)}
  if(title){ctx.fillStyle=theme.dark;ctx.font="800 28px system-ui";ctx.textAlign="center";ctx.fillText(info?.name||"United States",0,y0+42,w-30)}
  ctx.restore()
 }
 function tierBoard(ctx,x,y,w,h,{highlight=null,full=false}={}){
  ctx.save();const grades=["A","B","C","D","F"],rh=h/5;
  grades.forEach((g,i)=>{
   const yy=y+i*rh,color=gradeColor(g);ctx.fillStyle="#1b2632";rounded(ctx,x,yy,w,rh-8,8);ctx.fill();ctx.fillStyle=color;rounded(ctx,x,yy,80,rh-8,8);ctx.fill();
   ctx.fillStyle=theme.dark;ctx.font="900 46px system-ui";ctx.textAlign="center";ctx.fillText(g,x+40,yy+(rh-8)*.65);
   const members=codes.filter(code=>ratings[code]?.grade===g);
   ctx.font="700 20px system-ui";ctx.textAlign="left";ctx.fillStyle=theme.cream;
   const labels=members.map(code=>code+(highlight===code?" ★":"")).join("  ");
   ctx.fillText(labels||"—",x+98,yy+(rh-8)*.58,w-116)
  });
  ctx.restore()
 }
 function draw(ctx,beat,time=0,duration=3.3){
  if(!beat)return false;const w=ctx.canvas.width,h=ctx.canvas.height,p=clamp(time/Math.max(.1,duration),0,1),mode=beat.mode||"full",code=beat.stateCode||"US";
  ctx.save();bg(ctx,w,h);
  const state=flagInfo(code),name=state?.name||"United States",ep=beat.episode||0,score=ratings[code]||{};
  text(ctx,ep?"STATE FLAG RANKINGS · EPISODE "+ep:"50 STATE FLAGS · THE RULES",w*.5,h*.065,25,theme.gold);
  const enter=clamp(p*4,0,1),ease=1-(1-enter)**3;
  if(mode==="tiers"){
   text(ctx,"WHAT THE GRADES MEAN",w*.5,h*.19,36,theme.gold);
   const names=[["A","STANDOUT"],["B","GREAT"],["C","SOLID"],["D","WEAK"],["F","RETHINK"]];
   names.forEach(([g,label],i)=>{const x=w*.15,y=h*(.27+i*.102);ctx.fillStyle=gradeColor(g);rounded(ctx,x,y,w*.70,h*.085,12);ctx.fill();text(ctx,g,x+w*.085,y+h*.043,45,theme.dark);text(ctx,label,x+w*.40,y+h*.043,28,theme.dark)});
  }else if(mode==="board"||mode==="rate"){
   if(mode==="rate"){flagCard(ctx,code,w*.17,h*.20,w*.66,h*.31,ease);text(ctx,name+" → "+(goodGrade(score.grade)?score.grade:"YOUR GRADE?"),w*.5,h*.56,35,score.grade?gradeColor(score.grade):theme.gold)}
   else{const subject=beat.episode?name:"RUNNING TIER LIST";text(ctx,subject,w*.5,h*.20,31,theme.gold)}
   tierBoard(ctx,w*.05,mode==="rate"?h*.64:h*.29,w*.90,mode==="rate"?h*.21:h*.46,{highlight:code})
  }else if(mode==="intro-title"||mode==="outro"){
   flagCard(ctx,"US",w*.18,h*.22,w*.64,h*.38,ease);
   text(ctx,mode==="outro"?"LET'S RANK THEM":"50 STATE FLAGS",w*.5,h*.72,54,theme.gold);
   text(ctx,"A  →  B  →  C  →  D  →  F",w*.5,h*.79,28,theme.cream)
  }else if(mode==="montage"){
   const arr=["AL","AK","AZ","CA","CO","FL","TX","MN","UT","MS","MD","SC"];
   const offset=Math.floor((beat.montageIndex||0)*3+p*3);
   for(let i=0;i<3;i++){const c=arr[(offset+i)%arr.length];flagCard(ctx,c,w*(.035+i*.323),h*(.28+Math.sin(i+p*5)*.025),w*.30,h*.34,ease,{title:true})}
   text(ctx,ep?"NEXT THREE FLAGS":"50 STATES · 17 ROUNDS",w*.5,h*.75,34,theme.gold)
  }else if(mode==="timeline"||mode==="compare"){
   const history=(state?.history||[]).filter(item=>item.status==="source-verified");
   if(history.length){
    flagCard(ctx,code,w*.06,h*.26,w*.42,h*.33,ease,{variant:"history"});
    flagCard(ctx,code,w*.52,h*.26,w*.42,h*.33,ease,{variant:"current"});
    text(ctx,history.at(-1).from+"–"+String(history.at(-1).to).slice(0,4),w*.27,h*.63,22,theme.cream);
    text(ctx,"CURRENT",w*.74,h*.63,23,theme.gold);
    text(ctx,beat.heading||"HISTORIC → CURRENT",w*.5,h*.73,30,theme.gold)
   }else{
    flagCard(ctx,code,w*.17,h*.23,w*.66,h*.41,ease);
    text(ctx,"CURRENT OFFICIAL FLAG",w*.5,h*.72,30,theme.gold)
   }
  }else if(mode==="comparisons"){
   flagCard(ctx,code,w*.08,h*.28,w*.48,h*.34,ease);
   tierBoard(ctx,w*.59,h*.29,w*.37,h*.34,{highlight:code});
   text(ctx,"COMPARE THE RANKINGS",w*.5,h*.75,31,theme.gold)
  }else{
   const zoom=mode==="zoom"||mode==="detail"||mode==="closeup";
   const shift=mode==="entrance"?90*(1-ease):0;
   flagCard(ctx,code,w*(zoom?.1:.14)+shift,h*(zoom?.225:.26),w*(zoom?.8:.72),h*(zoom?.45:.39),ease);
   if(mode==="contrast"){
     flagCard(ctx,code,w*.58,h*.57,w*.25,h*.12,ease,{title:false});
     text(ctx,beat.heading||"STILL RECOGNIZABLE SMALL?",w*.5,h*.76,28,theme.gold)
   }
   else if(mode==="focus")text(ctx,beat.heading||"SHAPE · COLOR · SYMBOLISM",w*.5,h*.73,29,theme.gold);
   else if(mode==="detail"&&state)text(ctx,beat.heading||state.visualNotes.toUpperCase(),w*.5,h*.73,26,theme.gold);
   else text(ctx,beat.heading||(mode==="entrance"?"THE NEXT STATE":"THE OFFICIAL DESIGN"),w*.5,h*.73,28,theme.gold)
  }
  const reviewed=codes.filter(c=>ratings[c]?.done).length;
  text(ctx,"RANKED "+reviewed+" / 50",w*.18,h*.93,20,theme.cream,{align:"center"});
  text(ctx,score.done?"✓ REVIEWED":"A–F TIER SERIES",w*.78,h*.93,20,theme.gold);
  ctx.restore();return true
 }
 loadLocal();
 return{SERIES_ID,codes,load,warm,draw,getRatings,setRatings,updateRating,flagInfo,episodeOf,gradeColor};
})();
