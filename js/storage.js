window.MEPStorage=(()=>{
const INDEX_KEY="mep-video-maker-project-index-v7",RECENT_KEY="mep-video-maker-recent-v7",PREFIX="mep-video-maker-project-v7:",RESET_KEY="mep-youtube-short-maker-reset-v1";let cloud=null;
function readIndex(){try{return JSON.parse(localStorage.getItem(INDEX_KEY)||"[]")}catch{return[]}}
function writeIndex(items){localStorage.setItem(INDEX_KEY,JSON.stringify(items.slice(0,50)))}
function save(p){
 p=MEPModel.syncAlias(p);p.updatedAt=new Date().toISOString();p.sync=p.sync||{provider:"firestore",status:"local",revision:0,lastSyncedAt:null};p.sync.revision=(p.sync.revision||0)+1;
 localStorage.setItem(PREFIX+p.id,JSON.stringify(p));localStorage.setItem(RECENT_KEY,p.id);
 const list=readIndex().filter(x=>x.id!==p.id);list.unshift({id:p.id,name:p.name||"Untitled Project",updatedAt:p.updatedAt,shortCount:p.shorts?.length||0});writeIndex(list);return p
}
function hasLocal(){return !!localStorage.getItem(RECENT_KEY)}
function load(id=null){try{
 if(!id&&needsShortMakerReset()){const xhr=new XMLHttpRequest();xhr.open("GET","presets/youtube-short-maker.mep.json",false);xhr.send(null);if(xhr.status>=200&&xhr.status<300){const p=MEPModel.migrate(JSON.parse(xhr.responseText));resetLocalToProject(p);return p}}
 let pid=id||localStorage.getItem(RECENT_KEY);if(pid){const raw=localStorage.getItem(PREFIX+pid);if(raw)return MEPModel.migrate(JSON.parse(raw))}
 return null}catch(e){console.warn("Local project ignored",e);return null}}
function listLocal(){return readIndex().filter(x=>localStorage.getItem(PREFIX+x.id))}
function removeLocal(id){localStorage.removeItem(PREFIX+id);writeIndex(readIndex().filter(x=>x.id!==id));if(localStorage.getItem(RECENT_KEY)===id){const next=listLocal()[0];if(next)localStorage.setItem(RECENT_KEY,next.id);else localStorage.removeItem(RECENT_KEY)}}
function needsShortMakerReset(){return localStorage.getItem(RESET_KEY)!=="done"}
function resetLocalToProject(p){
 const remove=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith(PREFIX)||/^mep-video-maker-project-v\d+$/.test(k)))remove.push(k)}
 remove.forEach(k=>localStorage.removeItem(k));localStorage.removeItem(INDEX_KEY);localStorage.removeItem(RECENT_KEY);save(p);localStorage.setItem(RESET_KEY,"done");return p
}
async function initCloud(){
 if(cloud)return{ok:true};const cfg=window.MEP_FIREBASE_CONFIG;if(!cfg?.projectId)return{ok:false,reason:"Firebase config missing"};
 try{const [appMod,fs]=await Promise.all([import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js")]);const app=appMod.initializeApp(cfg);cloud={app,fs,db:fs.getFirestore(app)};return{ok:true}}catch(e){return{ok:false,reason:e.message}}
}
async function ensure(){if(!cloud){const r=await initCloud();if(!r.ok)throw new Error(r.reason)}}
function stripProject(p){
 const out=structuredClone(MEPModel.syncAlias(p)),manifest=[];out.assets=(out.assets||[]).map(a=>{manifest.push({id:a.id,name:a.name||"asset",type:a.type||"image/jpeg",size:a.size||0});return{id:a.id,name:a.name||"asset",type:a.type||"image/jpeg",size:a.size||0}});
 out.assetManifest=manifest;out.sync={...(out.sync||{}),provider:"firestore",status:"synced",lastSyncedAt:new Date().toISOString()};return out
}
async function saveAssetDoc(projectId,a){
 if(!a?.id||!a?.dataUrl)return;const bytes=a.dataUrl.length;if(bytes>850000)throw new Error("Background image "+(a.name||a.id)+" is too large for Firestore. Re-upload it so MEP can compress it more.");
 const doc={schema:"mep-asset-v1",projectId,assetId:a.id,name:a.name||"asset",type:a.type||"image/jpeg",size:a.size||0,dataUrl:a.dataUrl,updatedAt:new Date().toISOString()};
 await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepAssets",projectId+"__"+a.id),doc,{merge:true})
}
async function saveCloud(p){
 await ensure();save(p);const payload=stripProject(p);await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepProjects",p.id),payload,{merge:false});
 for(const a of p.assets||[])if(a.dataUrl)await saveAssetDoc(p.id,a);p.sync.status="synced";p.sync.lastSyncedAt=payload.sync.lastSyncedAt;save(p);return p.id
}
async function hydrateAssets(p){const assets=[];for(const meta of p.assetManifest||p.assets||[]){try{const snap=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepAssets",p.id+"__"+meta.id));if(snap.exists())assets.push({...meta,dataUrl:snap.data().dataUrl})}catch(e){console.warn("Asset load failed",meta.id,e)}}p.assets=assets;return p}
async function loadCloud(id){await ensure();const snap=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepProjects",id));if(!snap.exists())throw new Error("Project not found");const p=MEPModel.migrate(await hydrateAssets(snap.data()));save(p);return p}
async function listCloud(){await ensure();const snap=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepProjects"));return snap.docs.map(d=>({id:d.id,name:d.data().name||"Untitled Project",updatedAt:d.data().updatedAt||"",shortCount:d.data().shorts?.length||1})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
async function loadLatestCloud(){const list=await listCloud();return list.length?loadCloud(list[0].id):null}
async function seedLibrary(snapshot){await ensure();await deleteLegacyHaitiCloud();await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepLibrary","default"),structuredClone(snapshot),{merge:false});return true}
function isHaitiLegacy(data,id=""){const raw=(id+" "+JSON.stringify(data||{})).toLowerCase();return raw.includes("haiti")||raw.includes("vertiè")||raw.includes("vertie")||raw.includes("capois")||raw.includes("dessalines")}
async function deleteLegacyHaitiCloud(){
 await ensure();const deletedProjects=[];
 const ps=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepProjects"));
 for(const d of ps.docs){const data=d.data();const legacy=!Array.isArray(data?.shorts)||Number(data?.version||0)<7;if(d.id!=="youtube-short-maker"&&(legacy||isHaitiLegacy(data,d.id))){deletedProjects.push(d.id);await cloud.fs.deleteDoc(d.ref)}}
 const chars=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepCharacters"));for(const d of chars.docs)if(isHaitiLegacy(d.data(),d.id))await cloud.fs.deleteDoc(d.ref);
 const anim=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepAnimations"));for(const d of anim.docs)if(isHaitiLegacy(d.data(),d.id))await cloud.fs.deleteDoc(d.ref);
 if(deletedProjects.length){const assets=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepAssets"));for(const d of assets.docs)if(deletedProjects.includes(d.data()?.projectId))await cloud.fs.deleteDoc(d.ref)}
 return{deletedProjects}
}
async function saveCharacter(c){await ensure();const doc={schema:"mep-character-v3",id:c.id,name:c.name,tags:c.tags||[],visual:c.visual,prop:c.prop||"none",updatedAt:new Date().toISOString()};await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepCharacters",c.id),doc,{merge:true});return c.id}
function download(p){const blob=new Blob([JSON.stringify(MEPModel.syncAlias(p),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(p.name||"mep-project").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".mep.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
return{save,load,hasLocal,listLocal,removeLocal,needsShortMakerReset,resetLocalToProject,deleteLegacyHaitiCloud,download,initCloud,saveCloud,loadCloud,listCloud,loadLatestCloud,seedLibrary,saveCharacter};
})();