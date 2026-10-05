window.MEPStorage=(()=>{
const KEY="mep-video-maker-project-v2";let cloud=null;
function save(p){p.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(p));return p}
function load(){try{const p=JSON.parse(localStorage.getItem(KEY));return p?MEPModel.migrate(p):null}catch{return null}}
async function initCloud(){
 const cfg=window.MEP_FIREBASE_CONFIG;
 if(!cfg||!cfg.projectId)return{ok:false,reason:"Add Firebase config in js/firebase-config.js"};
 try{
  const appMod=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
  const fs=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
  const app=appMod.initializeApp(cfg);cloud={fs,db:fs.getFirestore(app)};return{ok:true};
 }catch(e){return{ok:false,reason:e.message}}
}
async function ensureCloud(){if(cloud)return;const r=await initCloud();if(!r.ok)throw new Error(r.reason)}
async function saveCloud(p){await ensureCloud();save(p);await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"mepProjects",p.id),structuredClone(p),{merge:true});return p.id}
async function loadCloud(id){await ensureCloud();const s=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"mepProjects",id));if(!s.exists())throw new Error("Project not found");const p=MEPModel.migrate(s.data());save(p);return p}
async function listCloud(){await ensureCloud();const s=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"mepProjects"));return s.docs.map(d=>({id:d.id,name:d.data().name||"Untitled",updatedAt:d.data().updatedAt||""})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
function download(p){const b=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(p.name||"mep-project").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".mep.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
return{save,load,download,initCloud,saveCloud,loadCloud,listCloud};
})();