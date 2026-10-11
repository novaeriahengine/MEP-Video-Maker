window.MEPStorage=(()=>{
const INDEX_KEY="mep-video-maker-project-index-v7",RECENT_KEY="mep-video-maker-recent-v7",PREFIX="mep-video-maker-project-v7:",RESET_KEY="mep-youtube-short-maker-reset-v5";let cloud=null;
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
function needsShortMakerReset(){return false} // Never automatically clear saved work
function resetLocalToProject(p){
 save(p);localStorage.setItem(RESET_KEY,"done");return p // Non-destructive
}
async function initCloud(){
 if(cloud)return{ok:true};const cfg=window.MEP_FIREBASE_CONFIG;if(!cfg?.projectId)return{ok:false,reason:"Firebase config missing"};
 try{const [appMod,fs,authMod]=await Promise.all([import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"),import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js")]);const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(cfg);cloud={app,fs,db:fs.getFirestore(app),auth:authMod.getAuth(app),authMod};return{ok:true}}catch(e){return{ok:false,reason:e.message}}
}
async function ensure(){if(!cloud){const r=await initCloud();if(!r.ok)throw new Error(r.reason)}}

const OWNER_EMAIL="movaeriahhistory@gmail.com";
function signedInAccount(){const u=cloud?.auth?.currentUser;return u?{email:u.email,verified:!!u.emailVerified,uid:u.uid}:null}
function currentEditor(){const u=cloud?.auth?.currentUser;return u?.email?.toLowerCase()===OWNER_EMAIL&&u.emailVerified?u.email:null}
function requireEditor(){if(!currentEditor())throw Error("Sign in and verify the engine owner's email before writing to shared Firestore.")}
async function signInEditor(email,password){
 await ensure();if(String(email||"").trim().toLowerCase()!==OWNER_EMAIL)throw Error("Only the engine owner's email can edit projects.");
 if(!password)throw Error("Enter your password.");
 const r=await cloud.authMod.signInWithEmailAndPassword(cloud.auth,OWNER_EMAIL,password);
 return {email:r.user.email,verified:r.user.emailVerified,uid:r.user.uid}
}
async function signOutEditor(){if(cloud?.auth)await cloud.authMod.signOut(cloud.auth)}
async function sendEditorReset(email=OWNER_EMAIL){await ensure();if(String(email).trim().toLowerCase()!==OWNER_EMAIL)throw Error("Wrong owner email");await cloud.authMod.sendPasswordResetEmail(cloud.auth,OWNER_EMAIL);return true}
async function sendEditorVerification(){await ensure();const u=cloud.auth.currentUser;if(u?.email?.toLowerCase()!==OWNER_EMAIL)throw Error("Sign in to the owner email first.");if(!u.emailVerified)await cloud.authMod.sendEmailVerification(u);return true}
async function refreshEditor(){await ensure();const u=cloud.auth.currentUser;if(!u)return null;await cloud.authMod.reload(u);await u.getIdToken(true);return signedInAccount()}
async function changeEditorPassword(oldPassword,newPassword){
 await ensure();const u=cloud.auth.currentUser;if(u?.email?.toLowerCase()!==OWNER_EMAIL)throw Error("Sign in as the owner first.");
 if(String(newPassword).length<12)throw Error("New password must have at least 12 characters.");
 if(newPassword===oldPassword)throw Error("Choose a different new password.");
 const cred=cloud.authMod.EmailAuthProvider.credential(u.email,oldPassword);
 await cloud.authMod.reauthenticateWithCredential(u,cred);await cloud.authMod.updatePassword(u,newPassword);return true
}
function watchEditor(callback){if(!cloud)return()=>{};return cloud.authMod.onAuthStateChanged(cloud.auth,u=>callback(u?{email:u.email,verified:!!u.emailVerified}:null))}
async function saveFlagRating(code,item){
 await ensure();requireEditor();
 const doc={schema:"mep-flag-rating-v1",code:String(code).toUpperCase(),grade:item.grade||"",done:!!item.done,episode:Number(item.episode)||1,notes:String(item.notes||"").slice(0,2000),updatedAt:new Date().toISOString()};
 await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepFlagRatings",doc.code),doc,{merge:true});return doc;
}
async function subscribeFlagRatings(callback){
 await ensure();
 return cloud.fs.onSnapshot(cloud.fs.collection(cloud.db,"mepFlagRatings"),snapshot=>{
   const result={};snapshot.docs.forEach(d=>{result[d.id]=d.data()});callback(result);
 },error=>console.warn("Flag ranking sync:",error.message));
}
function stripProject(p){
 const out=structuredClone(MEPModel.syncAlias(p)),manifest=[];out.assets=(out.assets||[]).map(a=>{const meta={id:a.id,name:a.name||"asset",type:a.type||"image/jpeg",size:a.size||0,kind:a.kind||"",shortId:a.shortId||"",durationSeconds:a.durationSeconds||0,voiceDbKey:a.voiceDbKey||null};manifest.push(meta);return meta});
 out.assetManifest=manifest;out.sync={...(out.sync||{}),provider:"firestore",status:"synced",lastSyncedAt:new Date().toISOString()};return out
}
async function saveAssetDoc(projectId,a){
 if(!a?.id||!a?.dataUrl)return;const bytes=a.dataUrl.length;if(bytes>850000)throw new Error("Background image "+(a.name||a.id)+" is too large for Firestore. Re-upload it so MEP can compress it more.");
 const doc={schema:"mep-asset-v1",projectId,assetId:a.id,name:a.name||"asset",type:a.type||"image/jpeg",size:a.size||0,dataUrl:a.dataUrl,updatedAt:new Date().toISOString()};
 await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepAssets",projectId+"__"+a.id),doc,{merge:true})
}

function byteSize(x){return new TextEncoder().encode(JSON.stringify(x)).length}
function videoId(pid,sid){return pid+"__"+sid}
async function saveCloud(p){
 await ensure();requireEditor();
 const payload=stripProject(p);
 const summaries=(p.shorts||[]).map(sh=>({id:sh.id,title:sh.title||"Untitled",year:sh.year||2026,sceneCount:sh.scenes?.length||0,updatedAt:sh.updatedAt||""}));
 const metadata={...payload,shorts:summaries,scripts:{project:p.scripts?.project||"",sceneById:{}},storageFormat:"mep-project-sharded-v1",shortCount:summaries.length,videoDocumentIds:summaries.map(sh=>videoId(p.id,sh.id)),historyPreservedIn:"mepVideos"};
 const batch=cloud.fs.writeBatch(cloud.db);
 for(const sh of p.shorts||[]){
  const doc={schema:"mep-video-short-v1",projectId:p.id,shortId:sh.id,title:sh.title||"Untitled",payload:structuredClone(sh),updatedAt:new Date().toISOString()};
  if(byteSize(doc)>900000)throw Error("Video is too large for one Firestore document: "+sh.title);
  batch.set(cloud.fs.doc(cloud.db,"mepVideos",videoId(p.id,sh.id)),doc);
 }
 if(byteSize(metadata)>900000)throw Error("Project metadata is too large to store.");
 batch.set(cloud.fs.doc(cloud.db,"mepProjects",p.id),metadata);
 await batch.commit();
 for(const a of p.assets||[])if(a.dataUrl)await saveAssetDoc(p.id,a);
 p.sync=p.sync||{};p.sync.status="synced";p.sync.lastSyncedAt=metadata.updatedAt;save(p);
 return {id:p.id,videos:summaries.length}
}
async function saveAllLocalProjects(onProgress=()=>{}){
 await ensure();requireEditor();const items=listLocal(),result={saved:[],failed:[]};
 for(let i=0;i<items.length;i++){
  const item=items[i],p=load(item.id);if(!p)continue;
  try{const r=await saveCloud(p);result.saved.push({name:item.name,videos:r.videos})}
  catch(e){result.failed.push({name:item.name,error:e.message})}
  onProgress(i+1,items.length,item.name);
 }
 return result
}
async function seedBundledProjects(onProgress=()=>{}){
 await ensure();requireEditor();
 const bundles=[["presets/american-history-stories.mep.json","American History Stories"],["presets/youtube-short-maker.mep.json","Ready Shorts"],["flags/flags-series.mep.json","50 State Flags"]],result={saved:[],skipped:[],failed:[]};
 for(let i=0;i<bundles.length;i++){
  const [path,name]=bundles[i];
  try{
   const response=await fetch(path,{cache:"no-store"});if(!response.ok)throw Error("Fetch failed: "+response.status);
   const p=MEPModel.migrate(await response.json());
   const ref=cloud.fs.doc(cloud.db,"mepProjects",p.id);
   if((await cloud.fs.getDoc(ref)).exists())result.skipped.push(name);
   else{await saveCloud(p);result.saved.push(name)}
  }catch(e){result.failed.push({name,error:e.message})}
  onProgress(i+1,bundles.length,name);
 }
 return result
}
async function hydrateAssets(p){const assets=[];for(const meta of p.assetManifest||p.assets||[]){try{const snap=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepAssets",p.id+"__"+meta.id));if(snap.exists())assets.push({...meta,dataUrl:snap.data().dataUrl});else if(meta.voiceDbKey)assets.push({...meta})}catch(e){console.warn("Asset load failed",meta.id,e);if(meta.voiceDbKey)assets.push({...meta})}}p.assets=assets;return p}

async function loadCloud(id){
 await ensure();const snap=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepProjects",id));
 if(!snap.exists())throw Error("Project not found");
 const meta=snap.data();let data=meta;
 if(meta.storageFormat==="mep-project-sharded-v1"){
  const ids=meta.videoDocumentIds||[];
  const docs=await Promise.all(ids.map(key=>cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepVideos",key))));
  if(docs.some(d=>!d.exists()))throw Error("Missing cloud video(s). Existing local projects were left intact.");
  const videos=docs.map(d=>d.data().payload),scripts={};
  for(const sh of videos)for(const sc of sh.scenes||[])scripts[sc.id]=sc.script||"";
  data={...meta,shorts:videos,scripts:{project:meta.scripts?.project||"",sceneById:scripts}}
 }
 const p=MEPModel.migrate(await hydrateAssets(data));save(p);return p
}
async function listCloud(){await ensure();const snap=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepProjects"));return snap.docs.map(d=>({id:d.id,name:d.data().name||"Untitled Project",updatedAt:d.data().updatedAt||"",shortCount:d.data().shorts?.length||1})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
async function loadLatestCloud(){const list=await listCloud();return list.length?loadCloud(list[0].id):null}
async function seedLibrary(snapshot){await ensure();requireEditor();await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepLibrary","default"),structuredClone(snapshot),{merge:false});return true}
function isHaitiLegacy(data,id=""){const raw=(id+" "+JSON.stringify(data||{})).toLowerCase();return raw.includes("haiti")||raw.includes("vertiè")||raw.includes("vertie")||raw.includes("capois")||raw.includes("dessalines")}
async function deleteLegacyHaitiCloud(){return{deletedProjects:[],disabled:true,reason:"Automatic cloud deletion removed for project preservation"}}
async function saveCharacter(c){await ensure();requireEditor();const doc={schema:"mep-character-v3",id:c.id,name:c.name,tags:c.tags||[],visual:c.visual,prop:c.prop||"none",updatedAt:new Date().toISOString()};await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepCharacters",c.id),doc,{merge:true});return c.id}
function download(p){const blob=new Blob([JSON.stringify(MEPModel.syncAlias(p),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(p.name||"mep-project").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".mep.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
return{save,load,hasLocal,listLocal,removeLocal,needsShortMakerReset,resetLocalToProject,deleteLegacyHaitiCloud,download,initCloud,saveCloud,saveAllLocalProjects,seedBundledProjects,loadCloud,listCloud,loadLatestCloud,seedLibrary,saveCharacter,currentEditor,signInEditor,signOutEditor,saveFlagRating,subscribeFlagRatings,signedInAccount,sendEditorReset,sendEditorVerification,refreshEditor,changeEditorPassword,watchEditor};
})();