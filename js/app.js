(()=>{
const $=s=>document.querySelector(s),canvas=$("#stage"),ctx=canvas.getContext("2d");
let project=MEPStorage.load()||MEPModel.project(),selectedId=project.characters[0]?.id||null,time=0,playing=false,last=0,drag=null;
const jointNames={head:"Head",torso:"Torso",leftUpperArm:"L Upper Arm",leftLowerArm:"L Forearm",rightUpperArm:"R Upper Arm",rightLowerArm:"R Forearm",leftUpperLeg:"L Thigh",leftLowerLeg:"L Shin",rightUpperLeg:"R Thigh",rightLowerLeg:"R Shin"};
const selected=()=>project.characters.find(c=>c.id===selectedId);
function stateFor(c){return playing||time>0?MEPModel.poseAt(c,time):{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:c.pose}}
function render(){
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=project.background;ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle="#d4cdbf";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,570);ctx.lineTo(canvas.width,570);ctx.stroke();
 project.characters.forEach(c=>MEPRenderer.draw(ctx,stateFor(c),c.id===selectedId));
 $("#timeLabel").textContent=time.toFixed(2)+" / "+project.duration.toFixed(2)+"s";$("#scrubber").value=time;
}
function syncUI(){
 $("#projectName").value=project.name;$("#category").value=project.category;$("#duration").value=project.duration;$("#fps").value=project.fps;$("#scrubber").max=project.duration;
 const c=selected();$("#characterList").innerHTML=project.characters.map(x=>'<div class="characterItem '+(x.id===selectedId?'active':'')+'" data-id="'+x.id+'">'+x.name+'</div>').join("");
 document.querySelectorAll(".characterItem").forEach(el=>el.onclick=()=>{selectedId=el.dataset.id;time=0;syncUI()});
 ["charName","charX","charY","charScale","charFacing"].forEach(id=>$("#"+id).disabled=!c);$("#deleteCharacter").disabled=!c;
 if(c){$("#charName").value=c.name;$("#charX").value=Math.round(c.x);$("#charY").value=Math.round(c.y);$("#charScale").value=c.scale;$("#charFacing").value=c.facing}
 $("#jointControls").innerHTML=c?Object.keys(MEPModel.DEFAULT_POSE).map(k=>'<label class="jointRow">'+jointNames[k]+'<input type="range" min="-180" max="180" value="'+c.pose[k]+'" data-joint="'+k+'"><output>'+Math.round(c.pose[k])+'°</output></label>').join(""):"<p>No character selected.</p>";
 document.querySelectorAll("[data-joint]").forEach(el=>el.oninput=()=>{c.pose[el.dataset.joint]=+el.value;el.nextElementSibling.value=Math.round(+el.value)+"°";time=0;changed()});
 $("#charCount").textContent=project.characters.length;$("#keyCount").textContent=project.characters.reduce((n,x)=>n+x.keyframes.length,0);
 drawTimeline();render();
}
function changed(){MEPStorage.save(project);$("#saveStatus").textContent="Saved";render();drawTimeline();$("#keyCount").textContent=project.characters.reduce((n,x)=>n+x.keyframes.length,0)}
function drawTimeline(){
 $("#timeline").innerHTML=project.characters.map(c=>'<div class="track"><div class="trackName">'+c.name+'</div><div class="trackLane">'+c.keyframes.map(k=>'<span class="key" data-char="'+c.id+'" data-time="'+k.time+'" style="left:'+(k.time/project.duration*100)+'%" title="'+k.time.toFixed(2)+'s"></span>').join("")+'</div></div>').join("");
 document.querySelectorAll(".key").forEach(k=>k.onclick=()=>{selectedId=k.dataset.char;time=+k.dataset.time;syncUI()});
}
function addKey(){
 const c=selected();if(!c)return;const t=Math.round(time*100)/100,state=MEPModel.capture(c),existing=c.keyframes.find(k=>Math.abs(k.time-t)<.011);
 if(existing)existing.state=state;else c.keyframes.push({id:MEPModel.id(),time:t,state});c.keyframes.sort((a,b)=>a.time-b.time);changed();
}
$("#addCharacter").onclick=()=>{const c=MEPModel.character("Character "+(project.characters.length+1),520+project.characters.length*80,405);project.characters.push(c);selectedId=c.id;time=0;changed();syncUI()};
$("#deleteCharacter").onclick=()=>{project.characters=project.characters.filter(c=>c.id!==selectedId);selectedId=project.characters[0]?.id||null;changed();syncUI()};
$("#charName").oninput=e=>{selected().name=e.target.value;changed();drawTimeline()};$("#charX").oninput=e=>{selected().x=+e.target.value;changed()};$("#charY").oninput=e=>{selected().y=+e.target.value;changed()};$("#charScale").oninput=e=>{selected().scale=Math.max(.2,+e.target.value||1);changed()};$("#charFacing").onchange=e=>{selected().facing=+e.target.value;changed()};
$("#resetPose").onclick=()=>{const c=selected();if(c){c.pose={...MEPModel.DEFAULT_POSE};time=0;changed();syncUI()}};
$("#addKeyframe").onclick=addKey;$("#deleteKeyframe").onclick=()=>{const c=selected();if(c){c.keyframes=c.keyframes.filter(k=>Math.abs(k.time-time)>.011);changed();syncUI()}};
$("#scrubber").oninput=e=>{playing=false;time=+e.target.value;render()};$("#duration").onchange=e=>{project.duration=Math.max(1,Math.min(300,+e.target.value||8));time=Math.min(time,project.duration);changed();syncUI()};$("#fps").onchange=e=>{project.fps=+e.target.value;changed()};
$("#projectName").oninput=e=>{project.name=e.target.value;changed()};$("#category").onchange=e=>{project.category=e.target.value;changed()};
$("#play").onclick=()=>{if(time>=project.duration)time=0;playing=true;last=performance.now();requestAnimationFrame(tick)};$("#stop").onclick=()=>{playing=false;time=0;render()};
function tick(now){if(!playing)return;time+=(now-last)/1000;last=now;if(time>=project.duration){time=project.duration;playing=false}render();if(playing)requestAnimationFrame(tick)}
$("#newProject").onclick=()=>{if(confirm("Start a new project? Your current project is already locally autosaved.")){project=MEPModel.project();selectedId=project.characters[0].id;time=0;changed();syncUI()}};
$("#saveProject").onclick=()=>{MEPStorage.save(project);$("#saveStatus").textContent="Saved now"};
$("#exportProject").onclick=()=>MEPStorage.download(project);
$("#importProject").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const p=JSON.parse(await f.text());if(!p.version||!Array.isArray(p.characters))throw Error();project=p;selectedId=p.characters[0]?.id||null;time=0;changed();syncUI()}catch{alert("That is not a valid MEP Video Maker project.")}e.target.value=""};
function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener("pointerdown",e=>{const p=pos(e);let best=null,dist=1e9;project.characters.forEach(c=>{const s=stateFor(c),d=Math.hypot(p.x-s.x,p.y-s.y);if(d<dist&&d<100*s.scale){best=c;dist=d}});if(best){selectedId=best.id;const s=stateFor(best);if(time>0){best.x=s.x;best.y=s.y;best.scale=s.scale;best.facing=s.facing;best.pose={...s.pose};time=0}drag={dx:p.x-best.x,dy:p.y-best.y};canvas.setPointerCapture(e.pointerId);syncUI()}});
canvas.addEventListener("pointermove",e=>{if(!drag)return;const c=selected(),p=pos(e);c.x=p.x-drag.dx;c.y=p.y-drag.dy;$("#charX").value=Math.round(c.x);$("#charY").value=Math.round(c.y);render()});
canvas.addEventListener("pointerup",()=>{if(drag){drag=null;changed()}});
syncUI();
})();