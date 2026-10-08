window.MEPStorage=(()=>{
const KEY="mep-video-maker-project-v3";
let cloud=null;

function save(p){
  p.updatedAt=new Date().toISOString();
  p.sync=p.sync||{provider:"firebase",status:"local",revision:0,lastSyncedAt:null};
  p.sync.revision=(p.sync.revision||0)+1;
  localStorage.setItem(KEY,JSON.stringify(p));
  return p;
}
function hasLocal(){return !!(localStorage.getItem(KEY)||localStorage.getItem("mep-video-maker-project-v2"))}
function load(){
  try{
    const raw=localStorage.getItem(KEY)||localStorage.getItem("mep-video-maker-project-v2");
    return raw?MEPModel.migrate(JSON.parse(raw)):null;
  }catch{return null}
}
async function initCloud(){
  if(cloud)return{ok:true};
  const cfg=window.MEP_FIREBASE_CONFIG;
  if(!cfg?.projectId)return{ok:false,reason:"Firebase config missing."};
  try{
    const [appMod,fs]=await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js")
    ]);
    const app=appMod.initializeApp(cfg);
    cloud={app,fs,db:fs.getFirestore(app)};
    return{ok:true};
  }catch(e){return{ok:false,reason:e.message}}
}
async function ensureCloud(){
  if(!cloud){const r=await initCloud();if(!r.ok)throw new Error(r.reason)}
}
function cloudCopy(p){
  const out=structuredClone(p);
  for(const s of out.scenes||[]){
    if(s.background){
      delete s.background.imageData;
      if(!s.background.imageUrl)delete s.background.assetId;
    }
    for(const ch of s.characters||[]){
      if(ch.customSprites)ch.customSprites={note:"Sprite image data stays local until Cloud Storage is enabled."};
    }
  }
  out.sync=out.sync||{};
  out.sync.provider="firestore";
  out.sync.status="synced";
  out.sync.lastSyncedAt=new Date().toISOString();
  return out;
}
async function saveCloud(p){
  await ensureCloud();
  save(p);
  const payload=cloudCopy(p);
  await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepProjects",p.id),payload,{merge:true});
  p.sync.status="synced";
  p.sync.lastSyncedAt=payload.sync.lastSyncedAt;
  localStorage.setItem(KEY,JSON.stringify(p));
  return p.id;
}
async function loadCloud(id){
  await ensureCloud();
  const snap=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepProjects",id));
  if(!snap.exists())throw new Error("Project not found.");
  const p=MEPModel.migrate(snap.data());
  localStorage.setItem(KEY,JSON.stringify(p));
  return p;
}
async function loadLatestCloud(){
  await ensureCloud();
  const snap=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepProjects"));
  const docs=snap.docs.map(d=>d.data()).filter(Boolean).sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
  if(!docs.length)return null;
  const p=MEPModel.migrate(docs[0]);localStorage.setItem(KEY,JSON.stringify(p));return p;
}
async function seedLibrary(snapshot){
  await ensureCloud();
  const doc={...structuredClone(snapshot),updatedAt:new Date().toISOString()};
  await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepLibrary","default"),doc,{merge:true});
  return true;
}
async function listCloud(){
  await ensureCloud();
  const snap=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepProjects"));
  return snap.docs.map(d=>({id:d.id,name:d.data().name||"Untitled",updatedAt:d.data().updatedAt||"",era:d.data().era||""}))
    .sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
async function saveCharacter(character){
  await ensureCloud();
  const doc={schema:"mep-character-v1",id:character.id,name:character.name,tags:character.tags||[],rig:character.rig,pose:character.pose,updatedAt:new Date().toISOString()};
  await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepCharacters",character.id),doc,{merge:true});
  return character.id;
}
async function saveAnimation(character,name="Animation"){
  await ensureCloud();
  const id=(character.id+"-"+name).replace(/[^a-z0-9_-]/gi,"-");
  const doc={schema:"mep-animation-v1",id,name,characterName:character.name,keyframes:structuredClone(character.keyframes||[]),updatedAt:new Date().toISOString()};
  await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepAnimations",id),doc,{merge:true});
  return id;
}
function download(p){
  const b=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(b);
  a.download=(p.name||"mep-project").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".mep.json";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function desktopEnvelope(p){return{protocol:"mep-sync-v1",projectId:p.id,revision:p.sync?.revision||0,updatedAt:p.updatedAt,project:p}}
return{save,load,hasLocal,download,initCloud,saveCloud,loadCloud,loadLatestCloud,listCloud,seedLibrary,saveCharacter,saveAnimation,desktopEnvelope};
})();