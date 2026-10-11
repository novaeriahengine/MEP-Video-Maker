window.MEPHistoricalMaps=(()=>{
const LOCAL_MAP_SOURCE=(location.protocol==="http:"&&/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(location.hostname))?location.origin+"/api/maps/":null;
const SOURCES=[...(LOCAL_MAP_SOURCE?[LOCAL_MAP_SOURCE]:[]),"https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/","https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/"];
const SNAPSHOTS=[
 {year:1000,file:"world_1000.geojson"},{year:1100,file:"world_1100.geojson"},{year:1200,file:"world_1200.geojson"},{year:1279,file:"world_1279.geojson"},
 {year:1300,file:"world_1300.geojson"},{year:1400,file:"world_1400.geojson"},{year:1492,file:"world_1492.geojson"},{year:1500,file:"world_1500.geojson"},
 {year:1530,file:"world_1530.geojson"},{year:1600,file:"world_1600.geojson"},{year:1650,file:"world_1650.geojson"},{year:1700,file:"world_1700.geojson"},
 {year:1715,file:"world_1715.geojson"},{year:1783,file:"world_1783.geojson"},{year:1800,file:"world_1800.geojson"},{year:1815,file:"world_1815.geojson"},
 {year:1878,file:"world_1878.geojson"},{year:1880,file:"world_1880.geojson"},{year:1900,file:"world_1900.geojson"},{year:1914,file:"world_1914.geojson"},
 {year:1920,file:"world_1920.geojson"},{year:1930,file:"world_1930.geojson"},{year:1938,file:"world_1938.geojson"},{year:1945,file:"world_1945.geojson"},
 {year:1960,file:"world_1960.geojson"},{year:1994,file:"world_1994.geojson"},{year:2000,file:"world_2000.geojson"},{year:2010,file:"world_2010.geojson"}
];
const FOCUS={
 world:{minLon:-180,maxLon:180,minLat:-62,maxLat:82,fit:"contain"},
 europe:{minLon:-13,maxLon:45,minLat:34,maxLat:72},
 westernFront:{minLon:-7,maxLon:15,minLat:43,maxLat:54},
 easternFront:{minLon:8,maxLon:48,minLat:40,maxLat:62},
 normandy:{minLon:-7,maxLon:4,minLat:47,maxLat:52.8},
 americas:{minLon:-135,maxLon:-28,minLat:-58,maxLat:72},
 northAmerica:{minLon:-130,maxLon:-52,minLat:22,maxLat:60},
 africa:{minLon:-20,maxLon:55,minLat:-38,maxLat:38},
 asia:{minLon:25,maxLon:155,minLat:-12,maxLat:78},
 pacific:{minLon:100,maxLon:255,minLat:-15,maxLat:72,wrap:true}
};
const cache=new Map(),loading=new Map(),failures=new Map(),paintCache=new Map();const PAINT_CACHE_LIMIT=5;
function paintCachePut(key,canvas){paintCache.delete(key);paintCache.set(key,canvas);while(paintCache.size>PAINT_CACHE_LIMIT)paintCache.delete(paintCache.keys().next().value)}

const palette=["#b7aa8a","#9eae91","#ac9da0","#9fb3b7","#b8a48d","#a7a1b7","#a6b497","#c0b493","#9fa9bd","#b29f8c","#a8aa8e","#9fb0a0"];
const SIDE_COLORS={allied:"#6f91b5",axis:"#a6534f",central:"#a55e4f",entente:"#6f93b8",west:"#5e87b6",east:"#a94a50",neutral:"#aaa891"};
const COUNTRY_COLORS=[
 [/soviet|ussr|russian empire|russia/i,"#b53a3f"],[/german|germany|prussia/i,"#4e555d"],[/france/i,"#4d79bd"],[/britain|united kingdom|england/i,"#315a8c"],[/united states|america/i,"#6c8ebf"],[/japan/i,"#a94a4d"],[/italy/i,"#5d8a61"],[/china/i,"#c7a44d"],[/poland/i,"#b46d86"],[/austria|habsburg/i,"#b99a62"],[/ottoman|turkey/i,"#8d6c55"],[/canada/i,"#a96666"],[/belgium/i,"#806c9d"],[/cuba/i,"#c47b4c"],[/spain/i,"#b98a4d"],[/netherlands/i,"#a97755"],[/serbia/i,"#6f79a6"]
];
const HIGHLIGHT_ALIASES={US:/united states|america/i,GB:/britain|united kingdom|england/i,FR:/france/i,DE:/german|germany|prussia/i,RU:/soviet|ussr|russian empire|russia/i,JP:/japan/i,IT:/italy/i,CN:/china/i,PL:/poland/i,AT:/austria|habsburg/i,CU:/cuba/i,CA:/canada/i,BE:/belgium/i,PRU:/prussia/i};
function conflictSide(name,text=""){
 const n=name.toLowerCase(),t=text.toLowerCase();
 if(/world war i|world war 1|wwi|western front|eastern front|trench|tannenberg|brusilov/.test(t)){
  if(/german|austria.?hungary|ottoman|bulgaria/.test(n))return"central";
  if(/france|britain|united kingdom|russia|serbia|belgium|united states|italy/.test(n))return"entente";
 }
 if(/world war ii|world war 2|wwii|pearl harbor|midway|normandy|d-day|pacific war/.test(t)){
  if(/german|italy|japan|manchukuo/.test(n))return"axis";
  if(/united states|britain|united kingdom|france|soviet|ussr|canada|australia|china/.test(n))return"allied";
 }
 if(/cold war|berlin wall|cuban missile/.test(t)){
  if(/soviet|ussr|east germany|poland|czechoslov|hungary|romania|bulgaria/.test(n))return"east";
  if(/united states|west germany|britain|united kingdom|france|canada/.test(n))return"west";
 }
 return"neutral"
}
function baseCountryColor(name,text=""){for(const [rx,color] of COUNTRY_COLORS)if(rx.test(name))return color;const side=conflictSide(name,text);if(side!=="neutral")return SIDE_COLORS[side];return palette[hash(name)%palette.length]}
function highlighted(name,text="",highlights=[]){const clean=String(name||"").toLowerCase();for(const h of highlights||[]){const rx=HIGHLIGHT_ALIASES[String(h).toUpperCase()];if(rx?.test(name))return true;if(clean.includes(String(h).toLowerCase()))return true}if(name&&name.length>4&&text.toLowerCase().includes(name.toLowerCase()))return true;return false}
function fillFor(f,text="",highlights=[]){const name=nameOf(f),base=baseCountryColor(name,text);return base}

function hash(s=""){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h)}
function nameOf(f){return String(f?.properties?.NAME||f?.properties?.name||f?.properties?.SUBJECTO||"Unknown").trim()||"Unknown"}
function subjectOf(f){return String(f?.properties?.SUBJECTO||f?.properties?.NAME||"Unknown").trim()||"Unknown"}
function nearest(year){let best=SNAPSHOTS[0];for(const s of SNAPSHOTS)if(Math.abs(s.year-year)<Math.abs(best.year-year))best=s;return best}
function phase(text=""){const t=text.toLowerCase();if(/before|pre[- ]?war|eve of|on the eve/.test(t))return"before";if(/after|post[- ]?war|armistice|peace treaty|treaty of|reunif|war ends|how it ended|falls silent|independence recognized/.test(t))return"after";return"during"}
function resolveSnapshot(year=2026,text=""){
 const t=text.toLowerCase(),p=phase(t);
 if(/western front|eastern front|world war i|world war 1|wwi|trench|somme|verdun|tannenberg|brusilov/.test(t)){
  if(p==="after"||year>=1919)return SNAPSHOTS.find(x=>x.year===1920);
  return SNAPSHOTS.find(x=>x.year===1914);
 }
 if(/pearl harbor|midway|d-day|d day|normandy|world war ii|world war 2|wwii|pacific war/.test(t)){
  if(p==="after"||year>=1945)return SNAPSHOTS.find(x=>x.year===1945);
  return SNAPSHOTS.find(x=>x.year===1938);
 }
 if(/berlin wall|cold war|cuban missile/.test(t)){
  if(p==="after"||/wall falls|gates open|reunif|november 9/.test(t)||year>=1990)return SNAPSHOTS.find(x=>x.year===1994);
  return SNAPSHOTS.find(x=>x.year===1960);
 }
 if(/american revolution|lexington|concord|yorktown|13 colonies|thirteen colonies/.test(t))return SNAPSHOTS.find(x=>x.year===1783);
 if(/napoleon|waterloo|hundred days/.test(t))return SNAPSHOTS.find(x=>x.year===1815);
 if(/french revolution|bastille|third estate|national assembly/.test(t)){if(/napoleon|1799|directory/.test(t))return SNAPSHOTS.find(x=>x.year===1800);return SNAPSHOTS.find(x=>x.year===1783)}
 return nearest(Number(year)||2026)
}
function focusFor(key="",text=""){
 const t=(key+" "+text).toLowerCase();
 if(t.includes("westernfront"))return"westernFront";
 if(t.includes("easternfront"))return"easternFront";
 if(t.includes("normandy"))return"normandy";
 if(t.includes("pearlharbor")||t.includes("midway")||t.includes("pacific"))return"pacific";
 if(t.includes("americasmap")||t.includes("revolutionmap")||/american revolution|cuban missile/.test(t))return"americas";
 if(t.includes("africamap"))return"africa";
 if(t.includes("asiamap"))return"asia";
 if(t.includes("europe")||t.includes("coldwar")||t.includes("napoleonic")||/berlin|waterloo|world war|western front|eastern front/.test(t))return"europe";
 return"world"
}
async function load(snapshot){
 if(cache.has(snapshot.year))return cache.get(snapshot.year);if(loading.has(snapshot.year))return loading.get(snapshot.year);
 const p=(async()=>{let last=null;for(const base of SOURCES){try{const r=await fetch(base+snapshot.file,{cache:"force-cache",mode:"cors"});if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();cache.set(snapshot.year,j);paintCache.clear();failures.delete(snapshot.year);window.dispatchEvent(new CustomEvent("mep-historical-map-ready",{detail:{year:snapshot.year}}));return j}catch(e){last=e}}failures.set(snapshot.year,last);console.warn("Historical map load failed",snapshot.file,last);return null})().finally(()=>loading.delete(snapshot.year));loading.set(snapshot.year,p);return p
}
function normalizeLon(lon,focus){if(focus.wrap&&lon<0)return lon+360;return lon}
function projector(focus,w,h){
 const minLon=focus.minLon,maxLon=focus.maxLon,minLat=focus.minLat,maxLat=focus.maxLat,dLon=maxLon-minLon,dLat=maxLat-minLat,pad=Math.max(10,Math.min(w,h)*.035);
 const sx=(w-pad*2)/dLon,sy=(h-pad*2)/dLat,baseScale=focus.fit==="cover"?Math.max(sx,sy):Math.min(sx,sy),scale=baseScale*(focus.zoom||1),drawW=dLon*scale,drawH=dLat*scale,ox=(w-drawW)/2,oy=(h-drawH)/2;
 return ([lon,lat])=>({x:ox+(normalizeLon(lon,focus)-minLon)*scale,y:oy+(maxLat-lat)*scale,inside:normalizeLon(lon,focus)>=minLon-3&&normalizeLon(lon,focus)<=maxLon+3&&lat>=minLat-3&&lat<=maxLat+3})
}
function ringsOf(geometry){if(!geometry)return[];if(geometry.type==="Polygon")return geometry.coordinates;if(geometry.type==="MultiPolygon")return geometry.coordinates.flat();return[]}
function featureBounds(f,focus){
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,count=0;
 for(const ring of ringsOf(f.geometry))for(const coord of ring){
  const lon=normalizeLon(coord[0],focus),lat=coord[1];
  if(!Number.isFinite(lon)||!Number.isFinite(lat))continue;
  minX=Math.min(minX,lon);maxX=Math.max(maxX,lon);minY=Math.min(minY,lat);maxY=Math.max(maxY,lat);count++
 }
 if(!count||maxX<focus.minLon||minX>focus.maxLon||maxY<focus.minLat||minY>focus.maxLat)return null;
 const clippedMinX=Math.max(minX,focus.minLon),clippedMaxX=Math.min(maxX,focus.maxLon),clippedMinY=Math.max(minY,focus.minLat),clippedMaxY=Math.min(maxY,focus.maxLat);
 return{minX:clippedMinX,minY:clippedMinY,maxX:clippedMaxX,maxY:clippedMaxY,area:Math.max(0,(clippedMaxX-clippedMinX)*(clippedMaxY-clippedMinY))}
}
function pathFeature(ctx,f,project){
 const geometry=f.geometry;if(!geometry)return false;
 const polygons=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
 let drawn=false;
 for(const polygon of polygons){
  ctx.beginPath();let hasRing=false;
  for(const ring of polygon){
   if(!ring?.length)continue;
   let started=false;
   for(const coord of ring){
    const p=project(coord);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
    if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)
   }
   if(started){ctx.closePath();hasRing=true}
  }
  if(hasRing){ctx.fill("evenodd");ctx.stroke();drawn=true}
 }
 return drawn
}
function drawLabels(ctx,features,focus,project,w,h,text="",highlights=[]){
 const candidates=[],seen=new Set();for(const f of features){const b=featureBounds(f,focus);if(!b||b.area<.32)continue;const name=nameOf(f),key=name.toLowerCase();if(seen.has(key))continue;const lon=(b.minX+b.maxX)/2,lat=(b.minY+b.maxY)/2,p=project([focus.wrap&&lon>180?lon-360:lon,lat]);if(!p.inside||name.length>28)continue;seen.add(key);candidates.push({name,p,area:b.area,hi:highlighted(name,text,highlights)})}
 candidates.sort((a,b)=>(Number(b.hi)-Number(a.hi))||(b.area-a.area));const max=focus===FOCUS.world?12:18,placed=[];ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
 for(const c of candidates){if(placed.length>=max)break;const size=Math.max(10,Math.min(c.hi?21:17,w*.023,8+Math.sqrt(c.area)*1.2));ctx.font=(c.hi?"800 ":"650 ")+size+"px system-ui";const tw=ctx.measureText(c.name).width,box={x:c.p.x-tw/2-6,y:c.p.y-size*.75,w:tw+12,h:size*1.5};if(placed.some(b=>!(box.x+box.w<b.x||b.x+b.w<box.x||box.y+box.h<b.y||b.y+b.h<box.y)))continue;placed.push(box);ctx.lineWidth=c.hi?4:3;ctx.strokeStyle=c.hi?"rgba(40,32,18,.92)":"rgba(248,246,236,.88)";ctx.fillStyle=c.hi?"#ffd45d":"#20292f";ctx.strokeText(c.name,c.p.x,c.p.y);ctx.fillText(c.name,c.p.x,c.p.y)}
 ctx.restore()
}
function drawGraticule(ctx,focus,project,w,h){
 ctx.save();ctx.strokeStyle="rgba(41,72,88,.12)";ctx.lineWidth=1;
 const lonStep=(focus.maxLon-focus.minLon)>150?30:(focus.maxLon-focus.minLon)>70?15:5,latStep=(focus.maxLat-focus.minLat)>80?20:10;
 for(let lon=Math.ceil(focus.minLon/lonStep)*lonStep;lon<=focus.maxLon;lon+=lonStep){const a=project([focus.wrap&&lon>180?lon-360:lon,focus.minLat]),b=project([focus.wrap&&lon>180?lon-360:lon,focus.maxLat]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 for(let lat=Math.ceil(focus.minLat/latStep)*latStep;lat<=focus.maxLat;lat+=latStep){const a=project([focus.wrap&&focus.minLon>180?focus.minLon-360:focus.minLon,lat]),b=project([focus.wrap&&focus.maxLon>180?focus.maxLon-360:focus.maxLon,lat]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 ctx.restore()
}
function drawLegend(ctx,text,w,h){
 const t=text.toLowerCase();let items=[];if(/world war i|world war 1|wwi|western front|eastern front|trench|tannenberg|brusilov/.test(t))items=[["Entente / Allies",SIDE_COLORS.entente],["Central Powers",SIDE_COLORS.central]];
 else if(/world war ii|world war 2|wwii|pearl harbor|midway|normandy|d-day|pacific war/.test(t))items=[["Allies",SIDE_COLORS.allied],["Axis",SIDE_COLORS.axis]];
 else if(/cold war|berlin wall|cuban missile/.test(t))items=[["West",SIDE_COLORS.west],["Soviet bloc",SIDE_COLORS.east]];
 if(!items.length)return;ctx.save();ctx.font="700 "+Math.max(10,w*.017)+"px system-ui";let x=14,y=h-52;for(const [label,color] of items){ctx.fillStyle=color;ctx.fillRect(x,y,14,14);ctx.strokeStyle="#28333a";ctx.strokeRect(x,y,14,14);ctx.fillStyle="#1d2830";ctx.fillText(label,x+20,y+12);x+=ctx.measureText(label).width+58}ctx.restore()
}
function draw(ctx,{year=2026,text="",key="worldMap",width=ctx.canvas.width,height=ctx.canvas.height,time=0,showLabels=true,highlights=[]}={}){
 const snap=resolveSnapshot(year,text),focusName=focusFor(key,text),focus=FOCUS[focusName]||FOCUS.world,data=cache.get(snap.year);
 if(!data){load(snap);return{drawn:false,snapshotYear:snap.year,focus:focusName,loading:true}}
 const highlightedCountries=(highlights||[]).join("|");
 const identity=[snap.year,focusName,width,height,showLabels?1:0,highlightedCountries,text].join("::");
 let layer=paintCache.get(identity);
 if(!layer){
  layer=document.createElement("canvas");layer.width=width;layer.height=height;
  const out=layer.getContext("2d");if(!out)return{drawn:false,snapshotYear:snap.year,focus:focusName};
  const ocean=out.createLinearGradient(0,0,0,height);ocean.addColorStop(0,"#b5d7e6");ocean.addColorStop(.5,"#94bfd2");ocean.addColorStop(1,"#6f9eb6");out.fillStyle=ocean;out.fillRect(0,0,width,height);
  const project=projector(focus,width,height),features=data.features||[];
  // Keep the geographical paths complete. The canvas clip, not point skipping,
  // determines which coastline/border segments are visible.
  out.save();out.beginPath();out.rect(0,0,width,height);out.clip();
  drawGraticule(out,focus,project,width,height);
  out.lineJoin="round";out.lineCap="round";
  for(const f of features){if(!featureBounds(f,focus))continue;out.fillStyle=fillFor(f,text,highlights);out.strokeStyle="rgba(246,242,229,.72)";out.lineWidth=Math.max(1,width*.0016);pathFeature(out,f,project)}
  for(const f of features){if(!featureBounds(f,focus))continue;const hi=highlighted(nameOf(f),text,highlights);out.fillStyle="rgba(0,0,0,0)";out.strokeStyle=hi?"#ffd45d":"rgba(35,43,48,.82)";out.lineWidth=hi?Math.max(3,width*.0045):Math.max(.9,width*.00135);pathFeature(out,f,project)}
  out.restore();
  if(showLabels)drawLabels(out,features,focus,project,width,height,text,highlights);
  drawLegend(out,text,width,height);
  const ph=phase(text),badge=(ph==="before"?"BEFORE":ph==="after"?"AFTER":"HISTORICAL")+" · "+snap.year;
  out.font="800 "+Math.max(12,width*.021)+"px system-ui";const tw=out.measureText(badge).width;
  out.fillStyle="rgba(18,26,32,.78)";out.fillRect(width-tw-34,14,tw+22,30);out.fillStyle="#f5d77f";out.textAlign="left";out.textBaseline="middle";out.fillText(badge,width-tw-23,29);
  out.fillStyle="rgba(17,27,33,.74)";out.font="600 "+Math.max(10,width*.015)+"px system-ui";out.textBaseline="bottom";out.fillText("Historical borders · "+snap.year+" · vector map",12,height-10);
  paintCachePut(identity,layer);
 }else{paintCache.delete(identity);paintCache.set(identity,layer)}
 ctx.drawImage(layer,0,0,width,height);
 return{drawn:true,snapshotYear:snap.year,focus:focusName,loading:false,cached:true}
}
function prefetch(year,text,key){const s=resolveSnapshot(year,text);load(s);return{snapshotYear:s.year,focus:focusFor(key,text)}}
return{version:"history-map-system-v2",SNAPSHOTS,FOCUS,resolveSnapshot,focusFor,load,prefetch,draw,source:{name:"Historical Basemaps",repository:"aourednik/historical-basemaps",license:"GPL-3.0"}};
})();