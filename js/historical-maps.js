window.MEPHistoricalMaps=(()=>{
const SOURCES=["https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/","https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/"];
const SNAPSHOTS=[
 {year:1600,file:"world_1600.geojson"},{year:1650,file:"world_1650.geojson"},{year:1700,file:"world_1700.geojson"},{year:1715,file:"world_1715.geojson"},
 {year:1783,file:"world_1783.geojson"},{year:1800,file:"world_1800.geojson"},{year:1815,file:"world_1815.geojson"},{year:1878,file:"world_1878.geojson"},
 {year:1880,file:"world_1880.geojson"},{year:1900,file:"world_1900.geojson"},{year:1914,file:"world_1914.geojson"},{year:1920,file:"world_1920.geojson"},
 {year:1930,file:"world_1930.geojson"},{year:1938,file:"world_1938.geojson"},{year:1945,file:"world_1945.geojson"},{year:1960,file:"world_1960.geojson"},
 {year:1994,file:"world_1994.geojson"},{year:2000,file:"world_2000.geojson"},{year:2010,file:"world_2010.geojson"}
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
const cache=new Map(),loading=new Map(),failures=new Map();
const palette=["#9eac86","#c0aa83","#9cb1b5","#b49b9a","#9fa788","#b0a0b8","#a4b69f","#c0b095","#98a9bd","#b59d83","#a5a58d","#9cae9d"];
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
 const p=(async()=>{let last=null;for(const base of SOURCES){try{const r=await fetch(base+snapshot.file,{cache:"force-cache",mode:"cors"});if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();cache.set(snapshot.year,j);failures.delete(snapshot.year);window.dispatchEvent(new CustomEvent("mep-historical-map-ready",{detail:{year:snapshot.year}}));return j}catch(e){last=e}}failures.set(snapshot.year,last);console.warn("Historical map load failed",snapshot.file,last);return null})().finally(()=>loading.delete(snapshot.year));loading.set(snapshot.year,p);return p
}
function normalizeLon(lon,focus){if(focus.wrap&&lon<0)return lon+360;return lon}
function projector(focus,w,h){
 const minLon=focus.minLon,maxLon=focus.maxLon,minLat=focus.minLat,maxLat=focus.maxLat,dLon=maxLon-minLon,dLat=maxLat-minLat,pad=Math.max(10,Math.min(w,h)*.035);
 const sx=(w-pad*2)/dLon,sy=(h-pad*2)/dLat,scale=focus.fit==="contain"?Math.min(sx,sy):Math.max(sx,sy),drawW=dLon*scale,drawH=dLat*scale,ox=(w-drawW)/2,oy=(h-drawH)/2;
 return ([lon,lat])=>({x:ox+(normalizeLon(lon,focus)-minLon)*scale,y:oy+(maxLat-lat)*scale,inside:normalizeLon(lon,focus)>=minLon-3&&normalizeLon(lon,focus)<=maxLon+3&&lat>=minLat-3&&lat<=maxLat+3})
}
function ringsOf(geometry){if(!geometry)return[];if(geometry.type==="Polygon")return geometry.coordinates;if(geometry.type==="MultiPolygon")return geometry.coordinates.flat();return[]}
function featureBounds(f,focus){
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,count=0;for(const ring of ringsOf(f.geometry))for(const c of ring){let lon=normalizeLon(c[0],focus),lat=c[1];if(lon<focus.minLon-8||lon>focus.maxLon+8||lat<focus.minLat-8||lat>focus.maxLat+8)continue;minX=Math.min(minX,lon);maxX=Math.max(maxX,lon);minY=Math.min(minY,lat);maxY=Math.max(maxY,lat);count++}return count?{minX,minY,maxX,maxY,area:(maxX-minX)*(maxY-minY)}:null
}
function pathFeature(ctx,f,project,focus){
 let drawn=false;for(const ring of ringsOf(f.geometry)){let started=false,prev=null;ctx.beginPath();for(const coord of ring){const p=project(coord);if(!p.inside&&started&&prev){prev=p;continue}if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y);prev=p}if(started){ctx.closePath();ctx.fill();ctx.stroke();drawn=true}}return drawn
}
function drawLabels(ctx,features,focus,project,w,h){
 const candidates=[];for(const f of features){const b=featureBounds(f,focus);if(!b||b.area<.28)continue;const lon=(b.minX+b.maxX)/2,lat=(b.minY+b.maxY)/2,p=project([focus.wrap&&lon>180?lon-360:lon,lat]),name=nameOf(f);if(!p.inside||name.length>30)continue;candidates.push({name,p,area:b.area})}
 candidates.sort((a,b)=>b.area-a.area);const max=focus===FOCUS.world?18:28;ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";for(const c of candidates.slice(0,max)){const size=Math.max(10,Math.min(18,w*.023,8+Math.sqrt(c.area)*1.3));ctx.font="700 "+size+"px system-ui";ctx.lineWidth=3;ctx.strokeStyle="rgba(255,255,255,.82)";ctx.fillStyle="#263039";ctx.strokeText(c.name,c.p.x,c.p.y);ctx.fillText(c.name,c.p.x,c.p.y)}ctx.restore()
}
function draw(ctx,{year=2026,text="",key="worldMap",width=ctx.canvas.width,height=ctx.canvas.height,showLabels=true}={}){
 const snap=resolveSnapshot(year,text),focusName=focusFor(key,text),focus=FOCUS[focusName]||FOCUS.world,data=cache.get(snap.year);
 if(!data){load(snap);return{drawn:false,snapshotYear:snap.year,focus:focusName,loading:true}}
 ctx.save();ctx.fillStyle="#9fc4d7";ctx.fillRect(0,0,width,height);const project=projector(focus,width,height),features=data.features||[];
 ctx.lineJoin="round";ctx.lineCap="round";ctx.lineWidth=Math.max(.7,width*.0014);
 for(const f of features){const b=featureBounds(f,focus);if(!b)continue;ctx.fillStyle=palette[hash(subjectOf(f))%palette.length];ctx.strokeStyle="rgba(37,47,52,.72)";pathFeature(ctx,f,project,focus)}
 if(showLabels)drawLabels(ctx,features,focus,project,width,height);
 ctx.fillStyle="rgba(12,18,24,.76)";ctx.font="600 "+Math.max(10,width*.017)+"px system-ui";ctx.textAlign="left";ctx.textBaseline="bottom";ctx.fillText("Historical borders · "+snap.year+" snapshot",12,height-12);
 ctx.restore();return{drawn:true,snapshotYear:snap.year,focus:focusName,loading:false}
}
function prefetch(year,text,key){const s=resolveSnapshot(year,text);load(s);return{snapshotYear:s.year,focus:focusFor(key,text)}}
return{SNAPSHOTS,FOCUS,resolveSnapshot,focusFor,load,prefetch,draw};
})();