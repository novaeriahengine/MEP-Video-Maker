window.MEPVoiceBackends=(()=>{
const URL_KEY="mep-voice-server-url-v1",DB_NAME="mep-voice-audio-v1",STORE="audio";
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function putAudio(key,blob){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(blob,key);tx.oncomplete=()=>{db.close();resolve(key)};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function getAudio(key){if(!key)return null;const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).get(key);req.onsuccess=()=>{db.close();resolve(req.result||null)};req.onerror=()=>{db.close();reject(req.error)}})}
async function deleteAudio(key){if(!key)return;const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function assetArrayBuffer(asset){if(asset?.voiceDbKey){const blob=await getAudio(asset.voiceDbKey);if(blob)return blob.arrayBuffer()}if(asset?.dataUrl)return fetch(asset.dataUrl).then(r=>r.arrayBuffer());throw new Error("Voice audio is missing from this browser.")}
function normalizeUrl(url=""){return String(url||"").trim().replace(/\/+$/,"")}
function isPrivateHost(host=""){return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(host)}
function defaultServerUrl(){
 // In the desktop editor always use its own same-origin Flask service.
 // A previously saved public/tunnel URL must not silently override it.
 if(location.protocol==="http:"&&isPrivateHost(location.hostname))return location.origin;
 return normalizeUrl(localStorage.getItem(URL_KEY)||"");
}
function setServerUrl(url){url=normalizeUrl(url);if(url)localStorage.setItem(URL_KEY,url);else localStorage.removeItem(URL_KEY);return url}
function mixedContentRisk(url){try{const u=new URL(url,location.href);return location.protocol==="https:"&&u.protocol==="http:"}catch{return false}}
async function apiFetch(base,path,options={}){
 const root=normalizeUrl(base||defaultServerUrl());if(!root)throw new Error("Voice server URL is empty.");
 if(mixedContentRisk(root))throw new Error("This HTTPS page cannot call an HTTP laptop server. Open the editor from the laptop server QR code instead.");
 const r=await fetch(root+path,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});
 if(!r.ok){let msg="Voice server error "+r.status;try{const j=await r.json();msg=j.error||j.message||msg}catch{}throw new Error(msg)}return r
}
async function health(base){return(await apiFetch(base,"/api/health")).json()}
async function voices(base){return(await apiFetch(base,"/api/voices")).json()}
async function synthesize(base,{text,voice="bm_george",speed=.95,pauseMs=70,tailTrimMs=100,title="",shortId=""}={}){
 const r=await apiFetch(base,"/api/tts",{method:"POST",body:JSON.stringify({text,voice,speed,pauseMs,tailTrimMs,title,shortId})});return r.blob()
}
function narrationForShort(sh){return(sh?.scenes||[]).map(s=>s.script||"").filter(Boolean).join(" ")}
function createColabBatch(project){
 return{schema:"mep-colab-narration-batch-v1",createdAt:new Date().toISOString(),projectId:project.id,projectName:project.name,shorts:(project.shorts||[]).map(sh=>({id:sh.id,title:sh.title,year:sh.year,duration:(sh.scenes||[]).reduce((n,s)=>n+(Number(s.duration)||0),0),voice:sh.voice?.kokoroVoice||"bm_george",speed:Number(sh.voice?.kokoroSpeed||.95),pauseMs:Number(sh.voice?.sentencePauseMs??70),tailTrimMs:Number(sh.voice?.tailTrimMs??100),narration:narrationForShort(sh),scenes:(sh.scenes||[]).map(s=>({id:s.id,name:s.name,duration:s.duration,script:s.script||"",caption:s.caption||""}))}))}
}
function downloadJson(name,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
return{normalizeUrl,defaultServerUrl,setServerUrl,mixedContentRisk,health,voices,synthesize,createColabBatch,downloadJson,blobToDataUrl,narrationForShort,putAudio,getAudio,deleteAudio,assetArrayBuffer};
})();