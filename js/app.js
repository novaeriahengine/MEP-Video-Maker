(()=>{
const $=s=>document.querySelector(s),canvas=$("#stage"),ctx=canvas.getContext("2d");
let project=MEPModel.migrate(MEPStorage.load()||MEPModel.project()),scene=MEPModel.activeScene(project),selectedId=scene.characters[0]?.id||null,time=0,playing=false,last=0,drag=null;
const jointNames={head:"Head",torso:"Torso",leftUpperArm:"L Upper Arm",leftLowerArm:"L Forearm",rightUpperArm:"R Upper Arm",rightLowerArm:"R Forearm",leftUpperLeg:"L Thigh",leftLowerLeg:"L Shin",rightUpperLeg:"R Thigh",rightLowerLeg:"R Shin"};
const selected=()=>scene.characters.find(c=>c.id===selectedId);
const stateFor=c=>(playing||time>0)?MEPModel.poseAt(c,time):{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:c.pose};
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function render(){
 const bg=MEPModel.BACKGROUNDS[scene.background.preset]||MEPModel.BACKGROUNDS.parchment;
 ctx.fillStyle=scene.background.customFill||bg.fill;ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle=bg.ground;ctx.fillRect(0,570,canvas.width,150);
 ctx.strokeStyle="#6f685b55";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,570);ctx.lineTo(canvas.width,570);ctx.stroke();
 scene.characters.forEach(c=>MEPRenderer.draw(ctx,stateFor(c),c.id===selectedId,c.rig));
 $("#timeLabel").textContent=time.toFixed(2)+" / "+scene.duration.toFixed(2)+"s";$("#scrubber").value=time;
}
function changed(){project.updatedAt=new Date().toISOString();MEPStorage.save(project);$("#saveStatus").textContent="Local ✓";$("#keyCount").textContent=scene.characters.reduce((n,x)=>n+x.keyframes.length,0);drawTimeline();render()}
function syncUI(){
 scene=MEPModel.activeScene(project);if(!scene)return;
 if(!scene.characters.some(c=>c.id===selectedId))selectedId=scene.characters[0]?.id||null;
 const c=selected();
 $("#projectName").value=project.name;$("#category").value=project.category;$("#duration").value=scene.duration;$("#fps").value=project.fps;$("#scrubber").max=scene.duration;
 $("#sceneSelect").innerHTML=project.scenes.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join("");$("#sceneSelect").value=scene.id;
 $("#era").innerHTML=MEPModel.HISTORY_ERAS.map(x=>'<option>'+x+'</option>').join("");$("#era").value=project.era||"Custom";
 $("#backgroundPreset").innerHTML=Object.entries(MEPModel.BACKGROUNDS).map(([k,v])=>'<option value="'+k+'">'+v.name+'</option>').join("");$("#backgroundPreset").value=scene.background.preset;
 $("#sceneTags").value=(scene.tags||[]).join(", ");
 $("#posePreset").innerHTML=Object.keys(MEPModel.POSES).map(x=>'<option value="'+x+'">'+x.replace(/([A-Z])/g," $1")+'</option>').join("");
 $("#characterList").innerHTML=scene.characters.map(x=>'<div class="characterItem '+(x.id===selectedId?'active':'')+'" data-id="'+x.id+'">'+esc(x.name)+'<small>'+esc((x.tags||[]).join(" · "))+'</small></div>').join("");
 document.querySelectorAll(".characterItem").forEach(el=>el.onclick=()=>{selectedId=el.dataset.id;time=0;syncUI()});
 ["charName","charX","charY","charScale","charFacing","skinColor","hairColor","shirtColor","charTags"].forEach(id=>$("#"+id).disabled=!c);$("#deleteCharacter").disabled=!c;
 if(c){c.rig=c.rig||MEPModel.character().rig;$("#charName").value=c.name;$("#charX").value=Math.round(c.x);$("#charY").value=Math.round(c.y);$("#charScale").value=c.scale;$("#charFacing").value=c.facing;$("#skinColor").value=c.rig.skin;$("#hairColor").value=c.rig.hair;$("#shirtColor").value=c.rig.shirt;$("#charTags").value=(c.tags||[]).join(", ")}
 $("#jointControls").innerHTML=c?Object.keys(MEPModel.DEFAULT_POSE).map(k=>'<label class="jointRow">'+jointNames[k]+'<input type="range" min="-180" max="180" value="'+c.pose[k]+'" data-joint="'+k+'"><output>'+Math.round(c.pose[k])+'°</output></label>').join(""):"<p>No character selected.</p>";
 document.querySelectorAll("[data-joint]").forEach(el=>el.oninput=()=>{c.pose[el.dataset.joint]=+el.value;el.nextElementSibling.value=Math.round(+el.value)+"°";time=0;changed()});
 $("#charCount").textContent=scene.characters.length;$("#keyCount").textContent=scene.characters.reduce((n,x)=>n+x.keyframes.length,0);drawTimeline();render();
}
function drawTimeline(){$("#timeline").innerHTML=scene.characters.map(c=>'<div class="track"><div class="trackName">'+esc(c.name)+'</div><div class="trackLane">'+c.keyframes.map(k=>'<span class="key" data-char="'+c.id+'" data-time="'+k.time+'" style="left:'+(k.time/scene.duration*100)+'%" title="'+k.time.toFixed(2)+'s"></span>').join("")+'</div></div>').join("");document.querySelectorAll(".key").forEach(k=>k.onclick=()=>{selectedId=k.dataset.char;time=+k.dataset.time;syncUI()})}
function addKey(at=time,pose=null){const c=selected();if(!c)return;if(pose)c.pose={...pose};const q=Math.max(0,Math.min(scene.duration,Math.round(at*100)/100)),state=MEPModel.capture(c),old=c.keyframes.find(k=>Math.abs(k.time-q)<.011);old?old.state=state:c.keyframes.push({id:MEPModel.id(),time:q,state});c.keyframes.sort((a,b)=>a.time-b.time);changed()}
$("#sceneSelect").onchange=e=>{project.activeSceneId=e.target.value;scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI()};
$("#addScene").onclick=()=>{const s=MEPModel.scene("Scene "+(project.scenes.length+1));project.scenes.push(s);project.activeSceneId=s.id;scene=s;selectedId=s.characters[0].id;time=0;changed();syncUI()};
$("#era").onchange=e=>{project.era=e.target.value;changed()};$("#backgroundPreset").onchange=e=>{scene.background.preset=e.target.value;scene.background.tags=[...MEPModel.BACKGROUNDS[e.target.value].tags];changed()};$("#sceneTags").onchange=e=>{scene.tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed()};
$("#addCharacter").onclick=()=>{const c=MEPModel.character("Character "+(scene.characters.length+1),520+scene.characters.length*80,405);scene.characters.push(c);selectedId=c.id;time=0;changed();syncUI()};
$("#deleteCharacter").onclick=()=>{scene.characters=scene.characters.filter(c=>c.id!==selectedId);selectedId=scene.characters[0]?.id||null;changed();syncUI()};
$("#charName").oninput=e=>{selected().name=e.target.value;changed()};$("#charX").oninput=e=>{selected().x=+e.target.value;changed()};$("#charY").oninput=e=>{selected().y=+e.target.value;changed()};$("#charScale").oninput=e=>{selected().scale=Math.max(.2,+e.target.value||1);changed()};$("#charFacing").onchange=e=>{selected().facing=+e.target.value;changed()};
$("#skinColor").oninput=e=>{selected().rig.skin=e.target.value;changed()};$("#hairColor").oninput=e=>{selected().rig.hair=e.target.value;changed()};$("#shirtColor").oninput=e=>{selected().rig.shirt=e.target.value;changed()};$("#charTags").onchange=e=>{selected().tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed();syncUI()};
$("#applyPose").onclick=()=>{const c=selected();if(c){MEPModel.applyPose(c,$("#posePreset").value);time=0;changed();syncUI()}};
$("#makeMarch").onclick=()=>{const c=selected();if(!c)return;const start=time,end=Math.min(scene.duration,start+2),step=(end-start)/4,baseX=c.x;["marchA","marchB","marchA","marchB","marchA"].forEach((name,i)=>{c.x=baseX+i*35*c.facing;addKey(start+i*step,MEPModel.POSES[name])});time=start;c.x=baseX;c.pose={...MEPModel.POSES.marchA};changed();syncUI()};
$("#resetPose").onclick=()=>{const c=selected();if(c){c.pose={...MEPModel.DEFAULT_POSE};time=0;changed();syncUI()}};$("#addKeyframe").onclick=()=>addKey();$("#deleteKeyframe").onclick=()=>{const c=selected();if(c){c.keyframes=c.keyframes.filter(k=>Math.abs(k.time-time)>.011);changed();syncUI()}};
$("#scrubber").oninput=e=>{playing=false;time=+e.target.value;render()};$("#duration").onchange=e=>{scene.duration=Math.max(1,Math.min(300,+e.target.value||8));time=Math.min(time,scene.duration);changed();syncUI()};$("#fps").onchange=e=>{project.fps=+e.target.value;changed()};
$("#projectName").oninput=e=>{project.name=e.target.value;changed()};$("#category").onchange=e=>{project.category=e.target.value;changed()};
$("#play").onclick=()=>{if(time>=scene.duration)time=0;playing=true;last=performance.now();requestAnimationFrame(tick)};$("#stop").onclick=()=>{playing=false;time=0;render()};function tick(now){if(!playing)return;time+=(now-last)/1000;last=now;if(time>=scene.duration){time=scene.duration;playing=false}render();if(playing)requestAnimationFrame(tick)}
$("#newProject").onclick=()=>{if(confirm("Start a new project?")){project=MEPModel.project();scene=MEPModel.activeScene(project);selectedId=scene.characters[0].id;time=0;changed();syncUI()}};
$("#saveProject").onclick=()=>{MEPStorage.save(project);$("#saveStatus").textContent="Local ✓"};$("#saveCloud").onclick=async()=>{try{$("#saveStatus").textContent="Cloud…";await MEPStorage.saveCloud(project);$("#saveStatus").textContent="Cloud ✓"}catch(e){alert(e.message);$("#saveStatus").textContent="Local only"}};
$("#loadCloud").onclick=async()=>{try{const items=await MEPStorage.listCloud();if(!items.length)return alert("No cloud projects yet.");const menu=items.map((x,i)=>(i+1)+". "+x.name+" — "+x.id).join("\n"),pick=prompt("Cloud projects:\n"+menu+"\n\nEnter project number:");const item=items[(+pick)-1];if(item){project=await MEPStorage.loadCloud(item.id);scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;syncUI()}}catch(e){alert(e.message)}};
$("#exportProject").onclick=()=>MEPStorage.download(project);$("#importProject").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{project=MEPModel.migrate(JSON.parse(await f.text()));scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI()}catch{alert("Invalid MEP project.")}e.target.value=""};
function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener("pointerdown",e=>{const p=pos(e);let best=null,dist=1e9;scene.characters.forEach(c=>{const s=stateFor(c),d=Math.hypot(p.x-s.x,p.y-s.y);if(d<dist&&d<110*s.scale){best=c;dist=d}});if(best){selectedId=best.id;const s=stateFor(best);if(time>0){best.x=s.x;best.y=s.y;best.scale=s.scale;best.facing=s.facing;best.pose={...s.pose};time=0}drag={dx:p.x-best.x,dy:p.y-best.y};canvas.setPointerCapture(e.pointerId);syncUI()}});
canvas.addEventListener("pointermove",e=>{if(!drag)return;const c=selected(),p=pos(e);c.x=p.x-drag.dx;c.y=p.y-drag.dy;$("#charX").value=Math.round(c.x);$("#charY").value=Math.round(c.y);render()});canvas.addEventListener("pointerup",()=>{if(drag){drag=null;changed()}});
syncUI();
})();