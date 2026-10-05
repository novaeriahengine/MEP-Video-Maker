window.MEPStorage=(()=>{
const KEY="mep-video-maker-project-v3";let cloud=null,user=null,listeners=[];
function save(p){p.updatedAt=new Date().toISOString();p.sync=p.sync||{provider:"firebase",status:"local",revision:0,ownerUid:null,lastSyncedAt:null};p.sync.revision=(p.sync.revision||0)+1;localStorage.setItem(KEY,JSON.stringify(p));return p}
function load(){try{const p=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("mep-video-maker-project-v2"));return p?MEPModel.migrate(p):null}catch{return null}}
async function initCloud(){
 if(cloud)return{ok:true};
 const cfg=window.MEP_FIREBASE_CONFIG;if(!cfg?.projectId)return{ok:false,reason:"Firebase config missing."};
 try{
  const [appMod,fs,auth,st]=await Promise.all([
   import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),
   import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"),
   import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"),
   import("https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js")
  ]);
  const app=appMod.initializeApp(cfg),authClient=auth.getAuth(app);
  cloud={app,fs,auth,st,db:fs.getFirestore(app),authClient,storage:st.getStorage(app)};
  auth.onAuthStateChanged(authClient,u=>{user=u;listeners.forEach(fn=>fn(u))});
  return{ok:true};
 }catch(e){return{ok:false,reason:e.message}}
}
async function ensureCloud(){if(!cloud){const r=await initCloud();if(!r.ok)throw new Error(r.reason)}}
async function requireUser(){await ensureCloud();if(!user)throw new Error("Sign in first.");return user}
function onUser(fn){listeners.push(fn);if(user!==undefined)fn(user);return()=>listeners.splice(listeners.indexOf(fn),1)}
async function signUp(email,password){await ensureCloud();const r=await cloud.auth.createUserWithEmailAndPassword(cloud.authClient,email,password);user=r.user;return user}
async function signIn(email,password){await ensureCloud();const r=await cloud.auth.signInWithEmailAndPassword(cloud.authClient,email,password);user=r.user;return user}
async function signOut(){await ensureCloud();await cloud.auth.signOut(cloud.authClient);user=null}
function currentUser(){return user}
async function saveCloud(p){
 const u=await requireUser();save(p);p.sync.ownerUid=u.uid;p.sync.status="synced";p.sync.lastSyncedAt=new Date().toISOString();
 const payload=structuredClone(p);payload.ownerUid=u.uid;
 await cloud.fs.setDoc(cloud.fs.doc(cloud.db,"users",u.uid,"projects",p.id),payload,{merge:true});
 localStorage.setItem(KEY,JSON.stringify(p));return p.id
}
async function loadCloud(id){const u=await requireUser(),snap=await cloud.fs.getDoc(cloud.fs.doc(cloud.db,"users",u.uid,"projects",id));if(!snap.exists())throw new Error("Project not found.");const p=MEPModel.migrate(snap.data());save(p);return p}
async function listCloud(){const u=await requireUser(),snap=await cloud.fs.getDocs(cloud.fs.collection(cloud.db,"users",u.uid,"projects"));return snap.docs.map(d=>({id:d.id,name:d.data().name||"Untitled",updatedAt:d.data().updatedAt||""})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
async function uploadAsset(projectId,file,assetId=crypto.randomUUID()){const u=await requireUser();const safe=(file.name||"asset").replace(/[^a-z0-9._-]/gi,"_"),path="users/"+u.uid+"/projects/"+projectId+"/assets/"+assetId+"-"+safe,ref=cloud.st.ref(cloud.storage,path);await cloud.st.uploadBytes(ref,file,{contentType:file.type||"application/octet-stream"});return{id:assetId,name:file.name,type:file.type,size:file.size,path,url:await cloud.st.getDownloadURL(ref)}}
function download(p){const b=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(p.name||"mep-project").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".mep.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function desktopEnvelope(p){return{protocol:"mep-sync-v1",projectId:p.id,revision:p.sync?.revision||0,updatedAt:p.updatedAt,ownerUid:p.sync?.ownerUid||null,project:p}}
return{save,load,download,initCloud,onUser,signUp,signIn,signOut,currentUser,saveCloud,loadCloud,listCloud,uploadAsset,desktopEnvelope};
})();