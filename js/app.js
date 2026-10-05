(()=>{
const $=s=>document.querySelector(s),canvas=$("#stage"),ctx=canvas.getContext("2d");
const imageCache=new Map();
let project=MEPModel.migrate(MEPStorage.load()||MEPModel.project()),scene=MEPModel.activeScene(project),selectedId=scene.characters[0]?.id||null,selectedBubbleId=null,time=0,playing=false,last=0,drag=null,editPreview=null;
const jointNames={head:"Head",torso:"Torso",leftUpperArm:"L Upper Arm",leftLowerArm:"L Forearm",rightUpperArm:"R Upper Arm",rightLowerArm:"R Forearm",leftUpperLeg:"L Thigh",leftLowerLeg:"L Shin",rightUpperLeg:"R Thigh",rightLowerLeg:"R Shin"};
const selected=()=>scene.characters.find(c=>c.id===selectedId);
const stateFor=c=>(!playing&&editPreview&&editPreview.id===c.id&&Math.abs(editPreview.time-time)<.001)?{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:c.pose}:(playing||time>0)?MEPModel.poseAt(c,time):{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:c.pose};
function materializeSelected(){const ch=selected();if(!ch)return null;if(time>0){const s=MEPModel.poseAt(ch,time);ch.x=s.x;ch.y=s.y;ch.scale=s.scale;ch.facing=s.facing;ch.pose={...s.pose};editPreview={id:ch.id,time}}return ch}
function visibleBubbles(sc,t){return(sc.bubbles||[]).filter(b=>t>=(b.startTime??0)&&t<=(b.endTime??sc.duration))}
function cameraOf(sc){return sc.camera||{x:640,y:360,zoom:1,keyframes:[]}}
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function render(){
 const cam=cameraOf(scene);ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2,canvas.height/2);ctx.scale(cam.zoom||1,cam.zoom||1);ctx.translate(-(cam.x??640),-(cam.y??360));
 MEPRenderer.drawBackground(ctx,scene.background.preset,canvas.width,canvas.height);
 const bgSrc=scene.background.imageUrl||scene.background.imageData;if(bgSrc){let im=imageCache.get(bgSrc);if(!im){im=new Image();im.crossOrigin="anonymous";im.src=bgSrc;imageCache.set(bgSrc,im);im.onload=render}if(im.complete)ctx.drawImage(im,0,0,canvas.width,canvas.height)}
 scene.characters.forEach(ch=>MEPRenderer.draw(ctx,stateFor(ch),ch.id===selectedId,ch.rig));ctx.restore();
 visibleBubbles(scene,time).forEach(b=>MEPRenderer.drawBubble(ctx,b));
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
 $("#sceneTransition").value=scene.transition?.type||"cut";$("#sceneNotes").value=scene.notes||"";const cam=cameraOf(scene);$("#cameraX").value=cam.x??640;$("#cameraY").value=cam.y??360;$("#cameraZoom").value=cam.zoom??1;
 $("#animationClip").innerHTML=Object.entries(MEPModel.ANIMATION_CLIPS).map(([k,v])=>'<option value="'+k+'">'+v.name+'</option>').join("");$("#keyframeEasing").innerHTML=Object.entries(MEPModel.EASINGS).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join("");
 $("#sceneBoard").innerHTML=project.scenes.map((s,i)=>'<button class="sceneCard '+(s.id===scene.id?'active':'')+'" data-scene-card="'+s.id+'"><strong>'+(i+1)+'. '+esc(s.name)+'</strong><small>'+s.duration.toFixed(1)+'s · '+s.characters.length+' chars · '+(s.transition?.type||'cut')+'</small></button>').join("");document.querySelectorAll("[data-scene-card]").forEach(el=>el.onclick=()=>{project.activeSceneId=el.dataset.sceneCard;scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;selectedBubbleId=null;time=0;editPreview=null;syncUI()});
 const eraKeys=MEPModel.ERA_CHARACTER_PRESETS[project.era]||Object.keys(MEPModel.CHARACTER_PRESETS);$("#characterPreset").innerHTML=eraKeys.filter(k=>MEPModel.CHARACTER_PRESETS[k]).map(k=>"<option value=\""+k+"\">"+MEPModel.CHARACTER_PRESETS[k].name+"</option>").join("");
 $("#bodyStyle").innerHTML=Object.entries(MEPModel.BODY_STYLES).map(([k,v])=>"<option value=\""+k+"\">"+v.name+"</option>").join("");
 $("#characterState").innerHTML=Object.keys(MEPModel.STATES).map(k=>"<option value=\""+k+"\">"+k+"</option>").join("");$("#characterProp").innerHTML=Object.entries(MEPModel.PROPS).map(([k,v])=>"<option value=\""+k+"\">"+v.name+"</option>").join("");
 $("#bubbleStyle").innerHTML=Object.entries(MEPModel.BUBBLE_STYLES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join("");
 $("#bubbleList").innerHTML=(scene.bubbles||[]).map(b=>`<button class="bubbleItem ${b.id===selectedBubbleId?"active":""}" data-bubble="${b.id}">${esc(b.text||"Bubble")}</button>`).join("");document.querySelectorAll("[data-bubble]").forEach(el=>el.onclick=()=>{selectedBubbleId=el.dataset.bubble;const b=scene.bubbles.find(x=>x.id===selectedBubbleId);if(b){$("#bubbleText").value=b.text;$("#bubbleStyle").value=b.style;$("#bubbleFontSize").value=b.fontSize;$("#bubbleWidth").value=b.width;$("#bubbleFill").value=b.fill||MEPModel.BUBBLE_STYLES[b.style].fill;$("#bubbleTextColor").value=b.textColor||MEPModel.BUBBLE_STYLES[b.style].text;$("#bubbleStart").value=b.startTime??0;$("#bubbleEnd").value=b.endTime??scene.duration}syncUI()});
 $("#posePreset").innerHTML=Object.keys(MEPModel.POSES).map(x=>'<option value="'+x+'">'+x.replace(/([A-Z])/g," $1")+'</option>').join("");
 $("#characterList").innerHTML=scene.characters.map(x=>'<div class="characterItem '+(x.id===selectedId?'active':'')+'" data-id="'+x.id+'">'+esc(x.name)+'<small>'+esc((x.tags||[]).join(" · "))+'</small></div>').join("");
 document.querySelectorAll(".characterItem").forEach(el=>el.onclick=()=>{selectedId=el.dataset.id;time=0;syncUI()});
 ["charName","charX","charY","charScale","charFacing","skinColor","hairColor","shirtColor","charTags"].forEach(id=>$("#"+id).disabled=!c);$("#deleteCharacter").disabled=!c;
 if(c){c.rig=c.rig||MEPModel.character().rig;$("#charName").value=c.name;$("#charX").value=Math.round(c.x);$("#charY").value=Math.round(c.y);$("#charScale").value=c.scale;$("#charFacing").value=c.facing;$("#skinColor").value=c.rig.skin;$("#hairColor").value=c.rig.hair;$("#shirtColor").value=c.rig.shirt;$("#charTags").value=(c.tags||[]).join(", ");$("#characterState").value=c.rig.state||"standing";$("#characterProp").value=c.rig.prop||"none";$("#expression").value=c.rig.expression||"neutral";$("#bodyStyle").value=c.rig.bodyStyle||"historyCutout"}
 $("#jointControls").innerHTML=c?Object.keys(MEPModel.DEFAULT_POSE).map(k=>'<label class="jointRow">'+jointNames[k]+'<input type="range" min="-180" max="180" value="'+c.pose[k]+'" data-joint="'+k+'"><output>'+Math.round(c.pose[k])+'°</output></label>').join(""):"<p>No character selected.</p>";
 document.querySelectorAll("[data-joint]").forEach(el=>el.oninput=()=>{const ch=materializeSelected();if(!ch)return;ch.pose[el.dataset.joint]=+el.value;el.nextElementSibling.value=Math.round(+el.value)+"°";changed()});
 $("#charCount").textContent=scene.characters.length;$("#keyCount").textContent=scene.characters.reduce((n,x)=>n+x.keyframes.length,0);drawTimeline();render();
}
function drawTimeline(){$("#timeline").innerHTML=scene.characters.map(c=>'<div class="track"><div class="trackName">'+esc(c.name)+'</div><div class="trackLane">'+c.keyframes.map(k=>'<span class="key" data-char="'+c.id+'" data-time="'+k.time+'" style="left:'+(k.time/scene.duration*100)+'%" title="'+k.time.toFixed(2)+'s"></span>').join("")+'</div></div>').join("");document.querySelectorAll(".key").forEach(k=>k.onclick=()=>{selectedId=k.dataset.char;time=+k.dataset.time;syncUI()})}
function addKey(at=time,pose=null,easing=null){const ch=materializeSelected()||selected();if(!ch)return;if(pose)ch.pose={...pose};const q=Math.max(0,Math.min(scene.duration,Math.round(at*100)/100)),state=MEPModel.capture(ch),ease=easing||$("#keyframeEasing")?.value||"linear",old=ch.keyframes.find(k=>Math.abs(k.time-q)<.011);if(old){old.state=state;old.easing=ease}else ch.keyframes.push({id:MEPModel.id(),time:q,easing:ease,state});ch.keyframes.sort((a,b)=>a.time-b.time);editPreview=null;changed();render()}
function cycleSelect(id,dir,fire=true){const el=$(id);if(!el||!el.options.length)return;el.selectedIndex=(el.selectedIndex+dir+el.options.length)%el.options.length;if(fire)el.dispatchEvent(new Event("change"))}
$("#prevBody").onclick=()=>cycleSelect("#bodyStyle",-1);$("#nextBody").onclick=()=>cycleSelect("#bodyStyle",1);$("#bodyStyle").onchange=e=>{const ch=selected();if(ch){ch.rig.bodyStyle=e.target.value;changed();render()}};
$("#prevBackground").onclick=()=>cycleSelect("#backgroundPreset",-1);$("#nextBackground").onclick=()=>cycleSelect("#backgroundPreset",1);
$("#prevCharacterPreset").onclick=()=>cycleSelect("#characterPreset",-1,false);$("#nextCharacterPreset").onclick=()=>cycleSelect("#characterPreset",1,false);
$("#prevState").onclick=()=>cycleSelect("#characterState",-1,false);$("#nextState").onclick=()=>cycleSelect("#characterState",1,false);
$("#prevProp").onclick=()=>cycleSelect("#characterProp",-1,false);$("#nextProp").onclick=()=>cycleSelect("#characterProp",1,false);
$("#applyState").onclick=()=>{const ch=materializeSelected()||selected();if(!ch)return;const state=$("#characterState").value;ch.rig.state=state;ch.rig.prop=$("#characterProp").value;ch.rig.expression=$("#expression").value;MEPModel.applyPose(ch,MEPModel.STATES[state]||"idle");editPreview={id:ch.id,time};changed();syncUI()};
$("#expression").onchange=e=>{const ch=selected();if(ch){ch.rig.expression=e.target.value;changed()}};
$("#characterProp").onchange=e=>{const ch=selected();if(ch){ch.rig.prop=e.target.value;changed()}};
$("#backgroundUpload").onchange=async e=>{const file=e.target.files[0];if(!file)return;const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});scene.background.imageData=data;delete scene.background.imageUrl;delete scene.background.assetId;$("#saveStatus").textContent="Local image";changed();render();e.target.value=""};
$("#clearBackgroundImage").onclick=()=>{delete scene.background.imageData;delete scene.background.imageUrl;delete scene.background.assetId;changed()};


function selectSceneByIndex(i){i=Math.max(0,Math.min(project.scenes.length-1,i));project.activeSceneId=project.scenes[i].id;scene=project.scenes[i];selectedId=scene.characters[0]?.id||null;selectedBubbleId=null;time=0;editPreview=null;changed();syncUI()}
function currentSceneIndex(){return Math.max(0,project.scenes.findIndex(s=>s.id===scene.id))}
function cloneScene(src){const s=structuredClone(src);s.id=MEPModel.id();s.name=src.name+" Copy";s.characters=(s.characters||[]).map(ch=>{ch.id=MEPModel.id();ch.keyframes=(ch.keyframes||[]).map(k=>({...k,id:MEPModel.id()}));return ch});s.bubbles=(s.bubbles||[]).map(b=>({...b,id:MEPModel.id()}));return s}
$("#prevScene").onclick=()=>selectSceneByIndex(currentSceneIndex()-1);
$("#nextScene").onclick=()=>selectSceneByIndex(currentSceneIndex()+1);
$("#duplicateScene").onclick=()=>{const i=currentSceneIndex(),copy=cloneScene(scene);project.scenes.splice(i+1,0,copy);selectSceneByIndex(i+1)};
$("#deleteScene").onclick=()=>{if(project.scenes.length<=1)return alert("A project needs at least one scene.");const i=currentSceneIndex();if(!confirm("Delete this scene?"))return;project.scenes.splice(i,1);selectSceneByIndex(Math.min(i,project.scenes.length-1))};
$("#sceneTransition").onchange=e=>{scene.transition=scene.transition||{};scene.transition.type=e.target.value;changed()};
$("#sceneNotes").onchange=e=>{scene.notes=e.target.value;changed()};
function updateCamera(){scene.camera=scene.camera||{x:640,y:360,zoom:1,keyframes:[]};scene.camera.x=+$("#cameraX").value||640;scene.camera.y=+$("#cameraY").value||360;scene.camera.zoom=Math.max(.5,Math.min(3,+$("#cameraZoom").value||1));changed()}
$("#cameraX").onchange=updateCamera;$("#cameraY").onchange=updateCamera;$("#cameraZoom").onchange=updateCamera;

$("#sceneSelect").onchange=e=>{project.activeSceneId=e.target.value;scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI()};
$("#addScene").onclick=()=>{const s=MEPModel.scene("Scene "+(project.scenes.length+1));project.scenes.push(s);project.activeSceneId=s.id;scene=s;selectedId=s.characters[0].id;time=0;changed();syncUI()};
$("#era").onchange=e=>{project.era=e.target.value;changed()};$("#backgroundPreset").onchange=e=>{scene.background.preset=e.target.value;scene.background.tags=[...MEPModel.BACKGROUNDS[e.target.value].tags];changed()};$("#sceneTags").onchange=e=>{scene.tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed()};

function renderCharacterGallery(){
 const entries=Object.entries(MEPModel.CHARACTER_PRESETS);
 $("#characterGalleryList").innerHTML=entries.map(([key,p])=>`<button class="characterCard" data-gallery-character="${key}"><strong>${esc(p.name)}</strong><span>${esc(p.era||"General")}</span><small>${esc((p.prop&&p.prop!=="none")?("Prop: "+p.prop):"No default prop")}</small></button>`).join("");
 document.querySelectorAll("[data-gallery-character]").forEach(btn=>btn.onclick=()=>{const type=btn.dataset.galleryCharacter,p=MEPModel.CHARACTER_PRESETS[type],ch=MEPModel.character(p.name,520+scene.characters.length*70,405,type);scene.characters.push(ch);selectedId=ch.id;time=0;changed();syncUI();$("#characterGalleryDialog").close()});
}
$("#openCharacterGallery").onclick=()=>{renderCharacterGallery();$("#characterGalleryDialog").showModal()};
$("#closeCharacterGallery").onclick=()=>$("#characterGalleryDialog").close();

$("#addCharacter").onclick=()=>{const c=MEPModel.character("Character "+(scene.characters.length+1),520+scene.characters.length*80,405);scene.characters.push(c);selectedId=c.id;time=0;changed();syncUI()};
$("#addPresetCharacter").onclick=()=>{const type=$("#characterPreset").value,c=MEPModel.character(MEPModel.CHARACTER_PRESETS[type].name,520+scene.characters.length*70,405,type);scene.characters.push(c);selectedId=c.id;time=0;changed();syncUI()};
$("#saveCharacterCloud").onclick=async()=>{const ch=selected();if(!ch)return alert("Select a character first.");try{$("#saveStatus").textContent="Saving character…";await MEPStorage.saveCharacter(ch);$("#saveStatus").textContent="Character cloud ✓"}catch(e){alert(e.message);$("#saveStatus").textContent="Cloud error"}};
$("#deleteCharacter").onclick=()=>{scene.characters=scene.characters.filter(c=>c.id!==selectedId);selectedId=scene.characters[0]?.id||null;changed();syncUI()};
$("#charName").oninput=e=>{const ch=selected();if(ch){ch.name=e.target.value;changed()}};
$("#charX").oninput=e=>{const ch=materializeSelected()||selected();if(ch){ch.x=+e.target.value;editPreview={id:ch.id,time};changed()}};
$("#charY").oninput=e=>{const ch=materializeSelected()||selected();if(ch){ch.y=+e.target.value;editPreview={id:ch.id,time};changed()}};
$("#charScale").oninput=e=>{const ch=materializeSelected()||selected();if(ch){ch.scale=Math.max(.2,+e.target.value||1);editPreview={id:ch.id,time};changed()}};
$("#charFacing").onchange=e=>{const ch=materializeSelected()||selected();if(ch){ch.facing=+e.target.value;editPreview={id:ch.id,time};changed()}};
$("#skinColor").oninput=e=>{selected().rig.skin=e.target.value;changed()};$("#hairColor").oninput=e=>{selected().rig.hair=e.target.value;changed()};$("#shirtColor").oninput=e=>{selected().rig.shirt=e.target.value;changed()};$("#charTags").onchange=e=>{selected().tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed();syncUI()};

$("#addBubble").onclick=()=>{scene.bubbles=scene.bubbles||[];const style=$("#bubbleStyle").value||"speech",st=MEPModel.BUBBLE_STYLES[style],b={id:MEPModel.id(),type:"bubble",text:$("#bubbleText").value||"Dialogue",style,x:360,y:90,width:+$("#bubbleWidth").value||300,height:105,fontSize:+$("#bubbleFontSize").value||28,fill:$("#bubbleFill").value||st.fill,textColor:$("#bubbleTextColor").value||st.text,startTime:+$("#bubbleStart").value||0,endTime:+$("#bubbleEnd").value||scene.duration,tailX:500,tailY:235};scene.bubbles.push(b);selectedBubbleId=b.id;changed();syncUI()};
$("#deleteBubble").onclick=()=>{if(!selectedBubbleId)return;scene.bubbles=(scene.bubbles||[]).filter(b=>b.id!==selectedBubbleId);selectedBubbleId=null;changed();syncUI()};
function editBubble(fn){const b=(scene.bubbles||[]).find(x=>x.id===selectedBubbleId);if(!b)return;fn(b);changed();render()}
$("#bubbleText").oninput=e=>editBubble(b=>b.text=e.target.value);$("#bubbleStyle").onchange=e=>editBubble(b=>b.style=e.target.value);$("#bubbleFontSize").oninput=e=>editBubble(b=>b.fontSize=+e.target.value);$("#bubbleWidth").oninput=e=>editBubble(b=>b.width=+e.target.value);$("#bubbleFill").oninput=e=>editBubble(b=>b.fill=e.target.value);$("#bubbleTextColor").oninput=e=>editBubble(b=>b.textColor=e.target.value);$("#bubbleStart").onchange=e=>editBubble(b=>b.startTime=Math.max(0,+e.target.value||0));$("#bubbleEnd").onchange=e=>editBubble(b=>b.endTime=Math.min(scene.duration,+e.target.value||scene.duration));

$("#applyPose").onclick=()=>{const ch=materializeSelected()||selected();if(ch){MEPModel.applyPose(ch,$("#posePreset").value);editPreview={id:ch.id,time};changed();syncUI()}};

$("#animationClip").onchange=e=>{const clip=MEPModel.ANIMATION_CLIPS[e.target.value];if(clip)$("#clipDuration").value=clip.duration};
$("#generateClip").onclick=()=>{const ch=materializeSelected()||selected();if(!ch)return;const key=$("#animationClip").value,clip=MEPModel.ANIMATION_CLIPS[key];if(!clip)return;const duration=Math.max(.5,+$("#clipDuration").value||clip.duration),start=time,poses=clip.poses,step=duration/Math.max(1,poses.length-1),baseX=ch.x,baseY=ch.y,face=ch.facing;ch.clips=ch.clips||[];const clipId=MEPModel.id();ch.clips.push({id:clipId,type:key,start,duration});poses.forEach((poseName,i)=>{const t=Math.min(scene.duration,start+i*step);ch.x=baseX+(clip.move||0)*(i/(poses.length-1))*face;ch.y=baseY;ch.pose={...MEPModel.POSES[poseName]};const old=ch.keyframes.find(k=>Math.abs(k.time-t)<.011),kf={id:MEPModel.id(),time:Math.round(t*100)/100,easing:i===0?"linear":"easeInOut",clipId,state:MEPModel.capture(ch)};if(old)Object.assign(old,kf);else ch.keyframes.push(kf)});ch.keyframes.sort((a,b)=>a.time-b.time);ch.x=baseX;ch.y=baseY;editPreview=null;changed();syncUI()};

$("#saveAnimationCloud").onclick=async()=>{const ch=selected();if(!ch)return alert("Select a character first.");const name=prompt("Animation name:",(ch.name||"Character")+" Animation")||"Animation";try{$("#saveStatus").textContent="Saving animation…";await MEPStorage.saveAnimation(ch,name);$("#saveStatus").textContent="Animation cloud ✓"}catch(e){alert(e.message);$("#saveStatus").textContent="Cloud error"}};
$("#makeMarch").onclick=()=>{const c=selected();if(!c)return;const start=time,end=Math.min(scene.duration,start+2),step=(end-start)/4,baseX=c.x;["marchA","marchB","marchA","marchB","marchA"].forEach((name,i)=>{c.x=baseX+i*35*c.facing;addKey(start+i*step,MEPModel.POSES[name])});time=start;c.x=baseX;c.pose={...MEPModel.POSES.marchA};changed();syncUI()};
$("#resetPose").onclick=()=>{const c=selected();if(c){c.pose={...MEPModel.DEFAULT_POSE};time=0;changed();syncUI()}};$("#addKeyframe").onclick=()=>addKey();$("#deleteKeyframe").onclick=()=>{const c=selected();if(c){c.keyframes=c.keyframes.filter(k=>Math.abs(k.time-time)>.011);changed();syncUI()}};
$("#scrubber").oninput=e=>{playing=false;editPreview=null;time=+e.target.value;render()};$("#duration").onchange=e=>{scene.duration=Math.max(1,Math.min(300,+e.target.value||8));time=Math.min(time,scene.duration);changed();syncUI()};$("#fps").onchange=e=>{project.fps=+e.target.value;changed()};
$("#projectName").oninput=e=>{project.name=e.target.value;changed()};$("#category").onchange=e=>{project.category=e.target.value;changed()};
$("#play").onclick=()=>{editPreview=null;if(time>=scene.duration)time=0;playing=true;last=performance.now();requestAnimationFrame(tick)};$("#stop").onclick=()=>{playing=false;time=0;render()};function tick(now){if(!playing)return;time+=(now-last)/1000;last=now;if(time>=scene.duration){time=scene.duration;playing=false}render();if(playing)requestAnimationFrame(tick)}
$("#newProject").onclick=()=>{if(confirm("Start a new project?")){project=MEPModel.project();scene=MEPModel.activeScene(project);selectedId=scene.characters[0].id;time=0;changed();syncUI()}};
$("#saveProject").onclick=()=>{MEPStorage.save(project);$("#saveStatus").textContent="Local ✓"};$("#saveCloud").onclick=async()=>{try{$("#saveStatus").textContent="Cloud…";await MEPStorage.saveCloud(project);$("#saveStatus").textContent="Cloud ✓"}catch(e){alert(e.message);$("#saveStatus").textContent="Local only"}};
$("#loadCloud").onclick=async()=>{try{const items=await MEPStorage.listCloud();if(!items.length)return alert("No cloud projects yet.");const menu=items.map((x,i)=>(i+1)+". "+x.name+" — "+x.id).join(String.fromCharCode(10)),pick=prompt("Cloud projects:"+String.fromCharCode(10)+menu+String.fromCharCode(10)+String.fromCharCode(10)+"Enter project number:");const item=items[(+pick)-1];if(item){project=await MEPStorage.loadCloud(item.id);scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;syncUI()}}catch(e){alert(e.message)}};

function projectSummary(p=project){const scenes=p.scenes||[],chars=scenes.reduce((n,s)=>n+(s.characters||[]).length,0),keys=scenes.reduce((n,s)=>n+(s.characters||[]).reduce((q,ch)=>q+(ch.keyframes||[]).length,0),0),seconds=scenes.reduce((n,s)=>n+(s.duration||0),0);return{scenes:scenes.length,characters:chars,keyframes:keys,duration:seconds}}
function refreshInspector(){const sum=projectSummary();$("#importSummary").innerHTML='<div class="summaryCards"><b>'+sum.scenes+' scenes</b><b>'+sum.characters+' characters</b><b>'+sum.keyframes+' keyframes</b><b>'+sum.duration.toFixed(1)+' sec</b></div>';$("#rawProjectJson").value=JSON.stringify(project,null,2)}
$("#importInspectorButton").onclick=()=>{refreshInspector();$("#importInspectorDialog").showModal()};
$("#closeImportInspector").onclick=()=>$("#importInspectorDialog").close();
$("#refreshProjectJson").onclick=refreshInspector;
$("#downloadProjectJson").onclick=()=>MEPStorage.download(project);
$("#applyRawProjectJson").onclick=()=>{try{const parsed=JSON.parse($("#rawProjectJson").value);project=MEPModel.migrate(parsed);scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;selectedBubbleId=null;time=0;editPreview=null;changed();syncUI();refreshInspector();$("#importInspectorDialog").close()}catch(e){alert("Invalid project JSON: "+e.message)}};

$("#exportProject").onclick=()=>MEPStorage.download(project);$("#importProject").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{project=MEPModel.migrate(JSON.parse(await f.text()));scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI()}catch{alert("Invalid MEP project.")}e.target.value=""};
function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
function worldPos(p){const cam=cameraOf(scene),z=cam.zoom||1;return{x:(p.x-canvas.width/2)/z+(cam.x??640),y:(p.y-canvas.height/2)/z+(cam.y??360)}}
canvas.addEventListener("pointerdown",e=>{const p=pos(e),bubble=[...visibleBubbles(scene,time)].reverse().find(b=>p.x>=b.x&&p.x<=b.x+b.width&&p.y>=b.y&&p.y<=b.y+b.height);if(bubble){selectedBubbleId=bubble.id;drag={type:"bubble",dx:p.x-bubble.x,dy:p.y-bubble.y};canvas.setPointerCapture(e.pointerId);syncUI();return}const wp=worldPos(p);let best=null,bestArea=Infinity;scene.characters.forEach(ch=>{const s=stateFor(ch),g=MEPRenderer.geometry({...s,bodyStyle:ch.rig?.bodyStyle}),pts=Object.values(g),minX=Math.min(...pts.map(q=>q.x))-35*s.scale,maxX=Math.max(...pts.map(q=>q.x))+35*s.scale,minY=Math.min(...pts.map(q=>q.y))-45*s.scale,maxY=Math.max(...pts.map(q=>q.y))+35*s.scale;if(wp.x>=minX&&wp.x<=maxX&&wp.y>=minY&&wp.y<=maxY){const area=(maxX-minX)*(maxY-minY);if(area<bestArea){best=ch;bestArea=area}}});if(best){selectedId=best.id;const ch=materializeSelected()||best;drag={type:"character",dx:wp.x-ch.x,dy:wp.y-ch.y};canvas.setPointerCapture(e.pointerId);syncUI()}});
canvas.addEventListener("pointermove",e=>{if(!drag)return;const p=pos(e);if(drag.type==="bubble"){const b=(scene.bubbles||[]).find(x=>x.id===selectedBubbleId);if(b){b.x=Math.max(0,Math.min(canvas.width-b.width,p.x-drag.dx));b.y=Math.max(0,Math.min(canvas.height-b.height,p.y-drag.dy));render()}return}const ch=selected(),wp=worldPos(p);if(ch){ch.x=wp.x-drag.dx;ch.y=wp.y-drag.dy;editPreview={id:ch.id,time};$("#charX").value=Math.round(ch.x);$("#charY").value=Math.round(ch.y);render()}});
canvas.addEventListener("pointerup",()=>{if(drag){drag=null;changed()}});

let studioReady=false;
$("#openStudio").onclick=()=>{if(!studioReady){MEPCharacterStudio.init($("#characterStudioCanvas"));studioReady=true}$("#characterStudioDialog").showModal()};
$("#closeStudio").onclick=()=>$("#characterStudioDialog").close();
document.querySelectorAll("[data-studio-tool]").forEach(b=>b.onclick=()=>MEPCharacterStudio.setTool(b.dataset.studioTool));
$("#studioImport").onchange=async e=>{if(e.target.files[0])await MEPCharacterStudio.loadFile(e.target.files[0]);e.target.value=""};
$("#studioClear").onclick=()=>MEPCharacterStudio.clear();
$("#studioExport").onclick=()=>MEPCharacterStudio.exportPNG();
document.querySelectorAll("[data-rig-slot]").forEach(b=>b.onclick=()=>{const sticker=MEPCharacterStudio.getSticker(),ch=selected();if(!sticker)return $("#studioStatus").textContent="Create a lasso sticker first.";if(!ch)return $("#studioStatus").textContent="Select a character in the main editor first.";ch.customSprites=ch.customSprites||{};ch.customSprites[b.dataset.rigSlot]=sticker;changed();$("#studioStatus").textContent="Sticker assigned to "+b.dataset.rigSlot+". Saved with this character/project."});

$("#aiDirector").onclick=()=>$("#aiDialog").showModal();
$("#aiShowContext").onclick=()=>{$("#aiJson").value=JSON.stringify(MEPAIDirector.promptPackage($("#aiPrompt").value||"Describe a history video",project),null,2);$("#aiStatus").textContent="Engine context package shown below. Send this contract to your backend/model."};
$("#aiGenerate").onclick=async()=>{const q=$("#aiPrompt").value.trim();if(!q)return $("#aiStatus").textContent="Enter a video request first.";try{$("#aiStatus").textContent="Generating structured production plan…";const plan=await MEPAIDirector.generate(q,project);$("#aiJson").value=JSON.stringify(plan,null,2);const v=MEPAIDirector.validate(plan);$("#aiStatus").textContent=v.ok?"Plan valid — ready to apply.":"Plan needs fixes:"+String.fromCharCode(10)+v.errors.join(String.fromCharCode(10))}catch(e){$("#aiStatus").textContent=e.message}};
$("#aiApply").onclick=()=>{try{const plan=JSON.parse($("#aiJson").value);const v=MEPAIDirector.validate(plan);if(!v.ok)throw new Error(v.errors.join(String.fromCharCode(10)));project=MEPAIDirector.apply(plan);scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI();$("#aiStatus").textContent="Applied "+project.scenes.length+" AI-directed scenes to MEP.";$("#aiDialog").close()}catch(e){$("#aiStatus").textContent="Cannot apply plan:"+String.fromCharCode(10)+e.message}};


const videoCanvas=$("#videoStage"),videoCtx=videoCanvas.getContext("2d");let videoPlaying=false,videoGlobalTime=0,videoLast=0,recorder=null,recordChunks=[];
const totalDuration=()=>project.scenes.reduce((n,s)=>n+s.duration,0);
function sceneAtGlobal(t){let offset=0;for(let i=0;i<project.scenes.length;i++){const s=project.scenes[i];if(t<=offset+s.duration||i===project.scenes.length-1)return{scene:s,index:i,local:Math.max(0,t-offset),offset};offset+=s.duration}return{scene:project.scenes[0],index:0,local:0,offset:0}}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60);return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
function drawVideoScene(sc,local,alpha=1,clear=true){
 if(clear)videoCtx.clearRect(0,0,videoCanvas.width,videoCanvas.height);videoCtx.save();videoCtx.globalAlpha=alpha;const cam=cameraOf(sc);videoCtx.translate(videoCanvas.width/2,videoCanvas.height/2);videoCtx.scale(cam.zoom||1,cam.zoom||1);videoCtx.translate(-(cam.x??640),-(cam.y??360));MEPRenderer.drawBackground(videoCtx,sc.background.preset,videoCanvas.width,videoCanvas.height);const bgSrc=sc.background.imageUrl||sc.background.imageData;if(bgSrc){let im=imageCache.get(bgSrc);if(!im){im=new Image();im.crossOrigin="anonymous";im.src=bgSrc;imageCache.set(bgSrc,im);im.onload=renderVideo}if(im.complete)videoCtx.drawImage(im,0,0,videoCanvas.width,videoCanvas.height)}sc.characters.forEach(ch=>MEPRenderer.draw(videoCtx,MEPModel.poseAt(ch,local),false,ch.rig));videoCtx.restore();videoCtx.save();videoCtx.globalAlpha=alpha;visibleBubbles(sc,local).forEach(b=>MEPRenderer.drawBubble(videoCtx,b));videoCtx.restore()
}
function renderVideo(){const at=sceneAtGlobal(videoGlobalTime),s=at.scene,transition=s.transition||{type:"cut",duration:.35},td=Math.max(.05,transition.duration||.35);videoCtx.clearRect(0,0,videoCanvas.width,videoCanvas.height);
 if(transition.type==="crossfade"&&at.index>0&&at.local<td){const prev=project.scenes[at.index-1],q=Math.min(1,at.local/td);drawVideoScene(prev,prev.duration,1,true);drawVideoScene(s,at.local,q,false)}else drawVideoScene(s,at.local,1);
 if(transition.type==="fade"){let a=0;if(at.local<td)a=1-at.local/td;else if(s.duration-at.local<td)a=1-(s.duration-at.local)/td;if(a>0){videoCtx.fillStyle="rgba(0,0,0,"+Math.max(0,Math.min(1,a))+")";videoCtx.fillRect(0,0,videoCanvas.width,videoCanvas.height)}}
 $("#videoCaption").textContent=s.caption||"";$("#videoClock").textContent=fmt(videoGlobalTime)+" / "+fmt(totalDuration());$("#videoScrubber").max=totalDuration();$("#videoScrubber").value=videoGlobalTime;$("#sceneStrip").innerHTML=project.scenes.map((x,i)=>'<button class="'+(i===at.index?'active':'')+'" data-video-scene="'+i+'">'+(i+1)+". "+esc(x.name)+"</button>").join("");document.querySelectorAll("[data-video-scene]").forEach(b=>b.onclick=()=>{let t=0;for(let i=0;i<+b.dataset.videoScene;i++)t+=project.scenes[i].duration;videoGlobalTime=t;renderVideo()});$("#sceneNarration").value=s.narration||"";$("#sceneCaption").value=s.caption||""}
function videoTick(now){if(!videoPlaying)return;videoGlobalTime+=(now-videoLast)/1000;videoLast=now;if(videoGlobalTime>=totalDuration()){videoGlobalTime=totalDuration();videoPlaying=false}renderVideo();if(videoPlaying)requestAnimationFrame(videoTick)}
$("#editorMode").onclick=()=>{document.body.classList.remove("video-mode");$("#editorMode").classList.add("active");$("#videoMode").classList.remove("active")};
$("#videoMode").onclick=()=>{document.body.classList.add("video-mode");$("#videoMode").classList.add("active");$("#editorMode").classList.remove("active");renderVideo()};
$("#videoPlayPause").onclick=()=>{videoPlaying=!videoPlaying;if(videoPlaying){if(videoGlobalTime>=totalDuration())videoGlobalTime=0;videoLast=performance.now();requestAnimationFrame(videoTick)}};
$("#videoStop").onclick=()=>{videoPlaying=false;videoGlobalTime=0;renderVideo()};$("#videoScrubber").oninput=e=>{videoPlaying=false;videoGlobalTime=+e.target.value;renderVideo()};
$("#videoPrevScene").onclick=()=>{const a=sceneAtGlobal(videoGlobalTime);videoGlobalTime=Math.max(0,a.offset-.01);const b=sceneAtGlobal(videoGlobalTime);videoGlobalTime=b.offset;renderVideo()};$("#videoNextScene").onclick=()=>{const a=sceneAtGlobal(videoGlobalTime);videoGlobalTime=Math.min(totalDuration(),a.offset+a.scene.duration+.001);renderVideo()};
$("#sceneNarration").onchange=e=>{sceneAtGlobal(videoGlobalTime).scene.narration=e.target.value;changed()};$("#sceneCaption").onchange=e=>{sceneAtGlobal(videoGlobalTime).scene.caption=e.target.value;changed();renderVideo()};
$("#recordVideo").onclick=()=>{if(recorder&&recorder.state==="recording"){recorder.stop();return}if(!videoCanvas.captureStream||!window.MediaRecorder)return alert("This browser does not support canvas recording.");recordChunks=[];const stream=videoCanvas.captureStream(project.fps||30);recorder=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"});recorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(recordChunks,{type:"video/webm"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.name||"mep-video")+".webm";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$("#recordVideo").textContent="Record WebM"};recorder.start();$("#recordVideo").textContent="Stop Recording";videoGlobalTime=0;videoPlaying=true;videoLast=performance.now();requestAnimationFrame(videoTick)};



$("#loadHaitiDemo").onclick=async()=>{try{const res=await fetch("presets/haiti-vertieres-30s.mep.json",{cache:"no-store"});if(!res.ok)throw new Error("Demo file not found.");project=MEPModel.migrate(await res.json());scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;selectedBubbleId=null;time=0;MEPStorage.save(project);syncUI();document.querySelector(".stageArea")?.scrollIntoView({behavior:"smooth",block:"start"})}catch(e){alert("Could not load Haiti demo: "+e.message)}};
$("#quickStart").onclick=()=>{
 project=MEPModel.project();project.name="My First MEP Video";project.era="Prehistory";
 scene=MEPModel.activeScene(project);scene.name="Opening Scene";scene.duration=12;scene.background.preset="countryside";scene.characters=[];
 const hunter=MEPModel.character("Hunter",410,430,"hunter");hunter.rig.bodyStyle="historyCutout";hunter.rig.prop="spear";MEPModel.applyPose(hunter,"spearWalk");
 const gatherer=MEPModel.character("Gatherer",760,430,"gatherer");gatherer.rig.bodyStyle="humanCartoon";MEPModel.applyPose(gatherer,"carry");
 scene.characters.push(hunter,gatherer);selectedId=hunter.id;selectedBubbleId=null;time=0;changed();syncUI();document.querySelector(".stageArea")?.scrollIntoView({behavior:"smooth",block:"start"});
};
document.querySelectorAll("[data-mobile-target]").forEach(b=>b.onclick=()=>document.querySelector(b.dataset.mobileTarget)?.scrollIntoView({behavior:"smooth",block:"start"}));
$("#mobileVideo").onclick=()=>$("#videoMode").click();

MEPStorage.initCloud().then(r=>{$("#saveStatus").textContent=r.ok?"Firestore ready":"Local only";if(!r.ok)console.warn(r.reason)});

syncUI();
})();