(()=>{"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function make(tag,cls,html){const n=document.createElement(tag);if(cls)n.className=cls;if(html)n.innerHTML=html;return n}
function heading(root,text){return [...root.querySelectorAll("h2,h3")].find(h=>h.textContent.trim()===text)||null}
function moveRange(start,end,target){if(!start)return;const nodes=[];for(let n=start;n&&n!==end;n=n.nextSibling)nodes.push(n);nodes.forEach(n=>target.appendChild(n))}
function moveChildren(root,target){if(root)[...root.childNodes].forEach(n=>target.appendChild(n))}
const shell=make("aside","toolAssistant",'<header class="toolAssistantHeader"><div><strong>MEP Tools</strong><small id="toolAssistantStatus">Canvas stays open while you work.</small></div><div class="toolWindowActions"><button id="toolFloatMode">Float</button><button id="toolFullMode">Full</button><button id="toolClose">×</button></div></header><div class="toolChatIntro"><span class="toolBotFace">✦</span><div><b>What do you want to edit?</b><small>Tap a tool or type its name below.</small></div></div><nav id="toolNav" class="toolNav"></nav><div id="toolPaneHost" class="toolPaneHost"></div><form id="toolChatForm" class="toolChatBar"><input id="toolChatInput" placeholder="voice, photos, background, script…"><button>Go</button></form>');
shell.id="toolAssistant";document.body.appendChild(shell);
const defs=[["backgrounds","Backgrounds","▧"],["photos","Historical Photos","◫"],["graphics","Map / Graphics","↗"],["characters","Characters","◉"],["scripts","Scripts","≡"],["voice","Voice","◖"],["project","Project","⌂"]],panes={},nav=$("#toolNav"),host=$("#toolPaneHost");
for(const [id,label,icon] of defs){const b=make("button","toolNavButton",'<span>'+icon+'</span><small>'+label+'</small>');b.dataset.tool=id;nav.appendChild(b);const p=make("section","toolPane",'<div class="toolPaneTitle"><h2>'+label+'</h2><small>MEP editor tool</small></div>');p.dataset.toolPane=id;host.appendChild(p);panes[id]=p}
const scenePanel=$("#scenePanel"),characterPanel=$("#characterPanel"),scriptPanel=$("#scriptPanel");
if(scenePanel){const bg=$("#backgroundSection"),graphics=heading(scenePanel,"Map / Explainer Tools");if(bg)moveRange(bg,graphics,panes.backgrounds);if(graphics)moveRange(graphics,null,panes.graphics)}
if(characterPanel){moveChildren(characterPanel,panes.characters);characterPanel.remove()}
if(scriptPanel){const first=heading(scriptPanel,"YouTube Upload Info"),voice=heading(scriptPanel,"Voice Studio"),dialogue=heading(scriptPanel,"Dialogue / Bubble");if(first)moveRange(first,voice,panes.scripts);if(voice)moveRange(voice,dialogue,panes.voice);if(dialogue)moveRange(dialogue,null,panes.scripts);scriptPanel.remove()}
const projectBox=make("div","toolProjectActions");for(const sel of [".projectNameLabel","#newProject","#openProjects","#loadShortPack","#saveProject","#saveCloud","#exportProject",".topbar .fileButton"]){const n=$(sel);if(n)projectBox.appendChild(n)}panes.project.appendChild(projectBox);
const photoBox=make("div","historyPhotoTool",'<div class="toolCard"><b>Historical Photo Search</b><small>Search license-safe historical images from the local server.</small><div class="photoSearchRow"><input id="historyPhotoQuery" placeholder="Current scene"><button id="historyPhotoSearch" class="primary" type="button">Find Photos</button></div><button id="historyPhotoAuto" type="button">Use Current Scene</button><div id="historyPhotoStatus" class="voiceStatus">Start desktop-server to use historical photos.</div></div><div id="historyPhotoResults" class="historyPhotoResults"></div>');panes.photos.appendChild(photoBox);
function localVoiceServer(){return window.MEPAppBridge?.getVoiceServerUrl?.()||window.MEPVoiceBackends?.defaultServerUrl?.()||""}
function currentSceneQuery(){const x=window.MEPAppBridge?.getContext?.();return x?[x.shortTitle,x.sceneName,x.year].filter(Boolean).join(" "):""}
function syncPhotoQuery(force=false){const q=$("#historyPhotoQuery");if(q&&(force||!q.value.trim()))q.value=currentSceneQuery()}
async function runPhotoSearch(){
 const server=localVoiceServer(),q=$("#historyPhotoQuery").value.trim()||currentSceneQuery(),status=$("#historyPhotoStatus"),out=$("#historyPhotoResults");
 if(!server){status.textContent="Start desktop-server and use the browser tab it opens. The local server then connects automatically.";return}
 if(!q){status.textContent="Enter a search.";return}
 status.textContent="Searching historical photos…";out.innerHTML="";
 try{
  const r=await fetch(server+"/api/history/photos/search?q="+encodeURIComponent(q)+"&limit=10"),j=await r.json();if(!r.ok)throw Error(j.error||"Search failed");
  status.textContent=j.items.length+" license-safe result"+(j.items.length===1?"":"s")+".";
  for(const item of j.items){
   const card=make("article","historyPhotoCard"),proxy=server+"/api/history/photos/proxy?url="+encodeURIComponent(item.thumbUrl);
   const img=make("img");img.loading="lazy";img.src=proxy;card.appendChild(img);
   const body=make("div");const title=make("b");title.textContent=item.title;const lic=make("small","photoLicense");lic.textContent=item.license+(item.artist?" · "+item.artist:"");const desc=make("p");desc.textContent=item.description||"Historical image from Wikimedia Commons";const use=make("button","primary");use.type="button";use.textContent="Use Photo";use.onclick=async()=>{try{status.textContent="Caching and applying photo…";const rr=await fetch(proxy);if(!rr.ok)throw Error("Image download failed");const blob=await rr.blob();await window.MEPAppBridge.setBackgroundBlob(blob,item.title,{sourceUrl:item.originalUrl,sourcePage:item.descriptionUrl,license:item.license,credit:item.artist||item.credit});status.textContent="Historical photo applied to the current scene."}catch(err){status.textContent="Could not use photo: "+err.message}};
   body.append(title,lic,desc,use);card.appendChild(body);out.appendChild(card);
  }
 }catch(err){status.textContent="Photo search failed: "+err.message}
}
$("#historyPhotoSearch").onclick=runPhotoSearch;$("#historyPhotoAuto").onclick=()=>{syncPhotoQuery(true);runPhotoSearch()};
const workspace=$(".workspace");if(workspace)workspace.classList.add("focus-layout");
const opener=make("button","primary toolOpenButton");opener.id="openTools";opener.textContent="Tools";const topbar=$(".topbar"),modeTabs=$(".modeTabs");if(topbar)topbar.insertBefore(opener,modeTabs?.nextSibling||topbar.firstChild);
let active="backgrounds",mode=localStorage.getItem("mep-tool-window-mode")||"float";
function applyMode(){document.body.classList.toggle("tool-full",mode==="full");shell.classList.toggle("full",mode==="full");$("#toolFloatMode").classList.toggle("active",mode==="float");$("#toolFullMode").classList.toggle("active",mode==="full")}
function openTool(id=active,nextMode=null){if(!panes[id])id="backgrounds";active=id;if(nextMode){mode=nextMode;localStorage.setItem("mep-tool-window-mode",mode)}shell.classList.add("open");applyMode();$$("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===id));$$("[data-tool-pane]").forEach(p=>p.classList.toggle("active",p.dataset.toolPane===id));$("#toolAssistantStatus").textContent=(mode==="full"?"Main tab · ":"Floating · ")+defs.find(x=>x[0]===id)[1];if(id==="photos")syncPhotoQuery(false)}
function closeTool(){shell.classList.remove("open");document.body.classList.remove("tool-full")}
opener.onclick=()=>openTool(active);$("#toolClose").onclick=closeTool;$("#toolFloatMode").onclick=()=>openTool(active,"float");$("#toolFullMode").onclick=()=>openTool(active,"full");$$("[data-tool]").forEach(b=>b.onclick=()=>openTool(b.dataset.tool));
const aliases={voice:"voice",audio:"voice",narration:"voice",photo:"photos",picture:"photos",background:"backgrounds",map:"graphics",graphic:"graphics",character:"characters",flag:"characters",script:"scripts",caption:"scripts",project:"project",save:"project",export:"project"};
$("#toolChatForm").onsubmit=e=>{e.preventDefault();const raw=$("#toolChatInput").value.toLowerCase();let found="";for(const k of Object.keys(aliases))if(raw.includes(k)){found=aliases[k];break}if(found){openTool(found);$("#toolChatInput").value=""}else $("#toolAssistantStatus").textContent="Try voice, photos, backgrounds, graphics, characters, scripts, or project."};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeTool()});applyMode();closeTool();window.MEPTools={open:openTool,close:closeTool,panes};
})();