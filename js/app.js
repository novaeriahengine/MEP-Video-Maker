(()=>{
const $=s=>document.querySelector(s),canvas=$("#stage"),ctx=canvas.getContext("2d");
const imageCache=new Map();\nlet project=MEPModel.migrate(MEPStorage.load()||MEPModel.project()),scene=MEPModel.activeScene(project),selectedId=scene.characters[0]?.id||null,selectedBubbleId=null,time=0,playing=false,last=0,drag=null;
const jointNames={head:"Head",torso:"Torso",leftUpperArm:"L Upper Arm",leftLowerArm:"L Forearm",rightUpperArm:"R Upper Arm",rightLowerArm:"R Forearm",leftUpperLeg:"L Thigh",leftLowerLeg:"L Shin",rightUpperLeg:"R Thigh",rightLowerLeg:"R Shin"};
const selected=()=>scene.characters.find(c=>c.id===selectedId);
const stateFor=c=>(playing||time>0)?MEPModel.poseAt(c,time):{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:c.pose};
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function render(){
 const bg=MEPModel.BACKGROUNDS[scene.background.preset]||MEPModel.BACKGROUNDS.parchment;
 MEPRenderer.drawBackground(ctx,scene.background.preset,canvas.width,canvas.height);if(scene.background.imageData){let im=imageCache.get(scene.background.imageData);if(!im){im=new Image();im.src=scene.background.imageData;imageCache.set(scene.background.imageData,im);im.onload=render}if(im.complete)ctx.drawImage(im,0,0,canvas.width,canvas.height)}
 scene.characters.forEach(c=>MEPRenderer.draw(ctx,stateFor(c),c.id===selectedId,c.rig));(scene.bubbles||[]).forEach(b=>MEPRenderer.drawBubble(ctx,b));
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
 $("#sceneTags").value=(scene.tags||[]).join(", ");\n const eraKeys=MEPModel.ERA_CHARACTER_PRESETS[project.era]||Object.keys(MEPModel.CHARACTER_PRESETS);$("#characterPreset").innerHTML=eraKeys.filter(k=>MEPModel.CHARACTER_PRESETS[k]).map(k=>"<option value=\""+k+"\">"+MEPModel.CHARACTER_PRESETS[k].name+"</option>").join("");\n $("#bodyStyle").innerHTML=Object.entries(MEPModel.BODY_STYLES).map(([k,v])=>"<option value=\""+k+"\">"+v.name+"</option>").join("");\n $("#characterState").innerHTML=Object.keys(MEPModel.STATES).map(k=>"<option value=\""+k+"\">"+k+"</option>").join("");$("#characterProp").innerHTML=Object.entries(MEPModel.PROPS).map(([k,v])=>"<option value=\""+k+"\">"+v.name+"</option>").join("");
 $("#bubbleStyle").innerHTML=Object.entries(MEPModel.BUBBLE_STYLES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join("");
 $("#bubbleList").innerHTML=(scene.bubbles||[]).map(b=>`<button class="bubbleItem ${b.id===selectedBubbleId?"active":""}" data-bubble="${b.id}">${esc(b.text||"Bubble")}</button>`).join("");document.querySelectorAll("[data-bubble]").forEach(el=>el.onclick=()=>{selectedBubbleId=el.dataset.bubble;const b=scene.bubbles.find(x=>x.id===selectedBubbleId);if(b){$("#bubbleText").value=b.text;$("#bubbleStyle").value=b.style;$("#bubbleFontSize").value=b.fontSize;$("#bubbleWidth").value=b.width;$("#bubbleFill").value=b.fill||MEPModel.BUBBLE_STYLES[b.style].fill;$("#bubbleTextColor").value=b.textColor||MEPModel.BUBBLE_STYLES[b.style].text}syncUI()});
 $("#posePreset").innerHTML=Object.keys(MEPModel.POSES).map(x=>'<option value="'+x+'">'+x.replace(/([A-Z])/g," $1")+'</option>').join("");
 $("#characterList").innerHTML=scene.characters.map(x=>'<div class="characterItem '+(x.id===selectedId?'active':'')+'" data-id="'+x.id+'">'+esc(x.name)+'<small>'+esc((x.tags||[]).join(" · "))+'</small></div>').join("");
 document.querySelectorAll(".characterItem").forEach(el=>el.onclick=()=>{selectedId=el.dataset.id;time=0;syncUI()});
 ["charName","charX","charY","charScale","charFacing","skinColor","hairColor","shirtColor","charTags"].forEach(id=>$("#"+id).disabled=!c);$("#deleteCharacter").disabled=!c;
 if(c){c.rig=c.rig||MEPModel.character().rig;$("#charName").value=c.name;$("#charX").value=Math.round(c.x);$("#charY").value=Math.round(c.y);$("#charScale").value=c.scale;$("#charFacing").value=c.facing;$("#skinColor").value=c.rig.skin;$("#hairColor").value=c.rig.hair;$("#shirtColor").value=c.rig.shirt;$("#charTags").value=(c.tags||[]).join(", ");$("#characterState").value=c.rig.state||"standing";$("#characterProp").value=c.rig.prop||"none";$("#expression").value=c.rig.expression||"neutral";$("#bodyStyle").value=c.rig.bodyStyle||"historyCutout"}
 $("#jointControls").innerHTML=c?Object.keys(MEPModel.DEFAULT_POSE).map(k=>'<label class="jointRow">'+jointNames[k]+'<input type="range" min="-180" max="180" value="'+c.pose[k]+'" data-joint="'+k+'"><output>'+Math.round(c.pose[k])+'°</output></label>').join(""):"<p>No character selected.</p>";
 document.querySelectorAll("[data-joint]").forEach(el=>el.oninput=()=>{c.pose[el.dataset.joint]=+el.value;el.nextElementSibling.value=Math.round(+el.value)+"°";time=0;changed()});
 $("#charCount").textContent=scene.characters.length;$("#keyCount").textContent=scene.characters.reduce((n,x)=>n+x.keyframes.length,0);drawTimeline();render();
}
function drawTimeline(){$("#timeline").innerHTML=scene.characters.map(c=>'<div class="track"><div class="trackName">'+esc(c.name)+'</div><div class="trackLane">'+c.keyframes.map(k=>'<span class="key" data-char="'+c.id+'" data-time="'+k.time+'" style="left:'+(k.time/scene.duration*100)+'%" title="'+k.time.toFixed(2)+'s"></span>').join("")+'</div></div>').join("");document.querySelectorAll(".key").forEach(k=>k.onclick=()=>{selectedId=k.dataset.char;time=+k.dataset.time;syncUI()})}
function addKey(at=time,pose=null){const c=selected();if(!c)return;if(pose)c.pose={...pose};const q=Math.max(0,Math.min(scene.duration,Math.round(at*100)/100)),state=MEPModel.capture(c),old=c.keyframes.find(k=>Math.abs(k.time-q)<.011);old?old.state=state:c.keyframes.push({id:MEPModel.id(),time:q,state});c.keyframes.sort((a,b)=>a.time-b.time);changed()}
function cycleSelect(id,dir,fire=true){const el=$(id);if(!el||!el.options.length)return;el.selectedIndex=(el.selectedIndex+dir+el.options.length)%el.options.length;if(fire)el.dispatchEvent(new Event("change"))}
$("#prevBody").onclick=()=>cycleSelect("#bodyStyle",-1);$("#nextBody").onclick=()=>cycleSelect("#bodyStyle",1);$("#bodyStyle").onchange=e=>{const ch=selected();if(ch){ch.rig.bodyStyle=e.target.value;changed();render()}};\n$("#prevBackground").onclick=()=>cycleSelect("#backgroundPreset",-1);$("#nextBackground").onclick=()=>cycleSelect("#backgroundPreset",1);
$("#prevCharacterPreset").onclick=()=>cycleSelect("#characterPreset",-1,false);$("#nextCharacterPreset").onclick=()=>cycleSelect("#characterPreset",1,false);
$("#prevState").onclick=()=>cycleSelect("#characterState",-1,false);$("#nextState").onclick=()=>cycleSelect("#characterState",1,false);
$("#prevProp").onclick=()=>cycleSelect("#characterProp",-1,false);$("#nextProp").onclick=()=>cycleSelect("#characterProp",1,false);
$("#applyState").onclick=()=>{const ch=selected();if(!ch)return;const state=$("#characterState").value;ch.rig.state=state;ch.rig.prop=$("#characterProp").value;ch.rig.expression=$("#expression").value;MEPModel.applyPose(ch,MEPModel.STATES[state]||"idle");changed();syncUI()};
$("#expression").onchange=e=>{const ch=selected();if(ch){ch.rig.expression=e.target.value;changed()}};
$("#characterProp").onchange=e=>{const ch=selected();if(ch){ch.rig.prop=e.target.value;changed()}};
$("#backgroundUpload").onchange=async e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{scene.background.imageData=reader.result;changed();render()};reader.readAsDataURL(file);e.target.value=""};
$("#clearBackgroundImage").onclick=()=>{delete scene.background.imageData;changed()};

$("#sceneSelect").onchange=e=>{project.activeSceneId=e.target.value;scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI()};
$("#addScene").onclick=()=>{const s=MEPModel.scene("Scene "+(project.scenes.length+1));project.scenes.push(s);project.activeSceneId=s.id;scene=s;selectedId=s.characters[0].id;time=0;changed();syncUI()};
$("#era").onchange=e=>{project.era=e.target.value;changed()};$("#backgroundPreset").onchange=e=>{scene.background.preset=e.target.value;scene.background.tags=[...MEPModel.BACKGROUNDS[e.target.value].tags];changed()};$("#sceneTags").onchange=e=>{scene.tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed()};
$("#addCharacter").onclick=()=>{const c=MEPModel.character("Character "+(scene.characters.length+1),520+scene.characters.length*80,405);scene.characters.push(c);selectedId=c.id;time=0;changed();syncUI()};
$("#addPresetCharacter").onclick=()=>{const type=$("#characterPreset").value,c=MEPModel.character(MEPModel.CHARACTER_PRESETS[type].name,520+scene.characters.length*70,405,type);scene.characters.push(c);selectedId=c.id;time=0;changed();syncUI()};\n$("#deleteCharacter").onclick=()=>{scene.characters=scene.characters.filter(c=>c.id!==selectedId);selectedId=scene.characters[0]?.id||null;changed();syncUI()};
$("#charName").oninput=e=>{selected().name=e.target.value;changed()};$("#charX").oninput=e=>{selected().x=+e.target.value;changed()};$("#charY").oninput=e=>{selected().y=+e.target.value;changed()};$("#charScale").oninput=e=>{selected().scale=Math.max(.2,+e.target.value||1);changed()};$("#charFacing").onchange=e=>{selected().facing=+e.target.value;changed()};
$("#skinColor").oninput=e=>{selected().rig.skin=e.target.value;changed()};$("#hairColor").oninput=e=>{selected().rig.hair=e.target.value;changed()};$("#shirtColor").oninput=e=>{selected().rig.shirt=e.target.value;changed()};$("#charTags").onchange=e=>{selected().tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean);changed();syncUI()};

$("#addBubble").onclick=()=>{scene.bubbles=scene.bubbles||[];const style=$("#bubbleStyle").value||"speech",st=MEPModel.BUBBLE_STYLES[style],b={id:MEPModel.id(),type:"bubble",text:$("#bubbleText").value||"Dialogue",style,x:360,y:90,width:+$("#bubbleWidth").value||300,height:105,fontSize:+$("#bubbleFontSize").value||28,fill:$("#bubbleFill").value||st.fill,textColor:$("#bubbleTextColor").value||st.text,tailX:500,tailY:235};scene.bubbles.push(b);selectedBubbleId=b.id;changed();syncUI()};
$("#deleteBubble").onclick=()=>{if(!selectedBubbleId)return;scene.bubbles=(scene.bubbles||[]).filter(b=>b.id!==selectedBubbleId);selectedBubbleId=null;changed();syncUI()};
function editBubble(fn){const b=(scene.bubbles||[]).find(x=>x.id===selectedBubbleId);if(!b)return;fn(b);changed();render()}
$("#bubbleText").oninput=e=>editBubble(b=>b.text=e.target.value);$("#bubbleStyle").onchange=e=>editBubble(b=>b.style=e.target.value);$("#bubbleFontSize").oninput=e=>editBubble(b=>b.fontSize=+e.target.value);$("#bubbleWidth").oninput=e=>editBubble(b=>b.width=+e.target.value);$("#bubbleFill").oninput=e=>editBubble(b=>b.fill=e.target.value);$("#bubbleTextColor").oninput=e=>editBubble(b=>b.textColor=e.target.value);

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
$("#aiGenerate").onclick=async()=>{const q=$("#aiPrompt").value.trim();if(!q)return $("#aiStatus").textContent="Enter a video request first.";try{$("#aiStatus").textContent="Generating structured production plan…";const plan=await MEPAIDirector.generate(q,project);$("#aiJson").value=JSON.stringify(plan,null,2);const v=MEPAIDirector.validate(plan);$("#aiStatus").textContent=v.ok?"Plan valid — ready to apply.":"Plan needs fixes:\n"+v.errors.join("\n")}catch(e){$("#aiStatus").textContent=e.message}};
$("#aiApply").onclick=()=>{try{const plan=JSON.parse($("#aiJson").value);const v=MEPAIDirector.validate(plan);if(!v.ok)throw new Error(v.errors.join("\n"));project=MEPAIDirector.apply(plan);scene=MEPModel.activeScene(project);selectedId=scene.characters[0]?.id||null;time=0;changed();syncUI();$("#aiStatus").textContent="Applied "+project.scenes.length+" AI-directed scenes to MEP.";$("#aiDialog").close()}catch(e){$("#aiStatus").textContent="Cannot apply plan:\n"+e.message}};


const videoCanvas=$("#videoStage"),videoCtx=videoCanvas.getContext("2d");let videoPlaying=false,videoGlobalTime=0,videoLast=0,recorder=null,recordChunks=[];
const totalDuration=()=>project.scenes.reduce((n,s)=>n+s.duration,0);
function sceneAtGlobal(t){let offset=0;for(let i=0;i<project.scenes.length;i++){const s=project.scenes[i];if(t<=offset+s.duration||i===project.scenes.length-1)return{scene:s,index:i,local:Math.max(0,t-offset),offset};offset+=s.duration}return{scene:project.scenes[0],index:0,local:0,offset:0}}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60);return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}
function renderVideo(){const at=sceneAtGlobal(videoGlobalTime),s=at.scene;MEPRenderer.drawBackground(videoCtx,s.background.preset,videoCanvas.width,videoCanvas.height);if(s.background.imageData){let im=imageCache.get(s.background.imageData);if(!im){im=new Image();im.src=s.background.imageData;imageCache.set(s.background.imageData,im);im.onload=renderVideo}if(im.complete)videoCtx.drawImage(im,0,0,videoCanvas.width,videoCanvas.height)}s.characters.forEach(ch=>MEPRenderer.draw(videoCtx,MEPModel.poseAt(ch,at.local),false,ch.rig));(s.bubbles||[]).forEach(b=>MEPRenderer.drawBubble(videoCtx,b));$("#videoCaption").textContent=s.caption||"";$("#videoClock").textContent=fmt(videoGlobalTime)+" / "+fmt(totalDuration());$("#videoScrubber").max=totalDuration();$("#videoScrubber").value=videoGlobalTime;$("#sceneStrip").innerHTML=project.scenes.map((x,i)=>'<button class="'+(i===at.index?'active':'')+'" data-video-scene="'+i+'">'+(i+1)+". "+esc(x.name)+"</button>").join("");document.querySelectorAll("[data-video-scene]").forEach(b=>b.onclick=()=>{let t=0;for(let i=0;i<+b.dataset.videoScene;i++)t+=project.scenes[i].duration;videoGlobalTime=t;renderVideo()});$("#sceneNarration").value=s.narration||"";$("#sceneCaption").value=s.caption||""}
function videoTick(now){if(!videoPlaying)return;videoGlobalTime+=(now-videoLast)/1000;videoLast=now;if(videoGlobalTime>=totalDuration()){videoGlobalTime=totalDuration();videoPlaying=false}renderVideo();if(videoPlaying)requestAnimationFrame(videoTick)}
$("#editorMode").onclick=()=>{document.body.classList.remove("video-mode");$("#editorMode").classList.add("active");$("#videoMode").classList.remove("active")};
$("#videoMode").onclick=()=>{document.body.classList.add("video-mode");$("#videoMode").classList.add("active");$("#editorMode").classList.remove("active");renderVideo()};
$("#videoPlayPause").onclick=()=>{videoPlaying=!videoPlaying;if(videoPlaying){if(videoGlobalTime>=totalDuration())videoGlobalTime=0;videoLast=performance.now();requestAnimationFrame(videoTick)}};
$("#videoStop").onclick=()=>{videoPlaying=false;videoGlobalTime=0;renderVideo()};$("#videoScrubber").oninput=e=>{videoPlaying=false;videoGlobalTime=+e.target.value;renderVideo()};
$("#videoPrevScene").onclick=()=>{const a=sceneAtGlobal(videoGlobalTime);videoGlobalTime=Math.max(0,a.offset-.01);const b=sceneAtGlobal(videoGlobalTime);videoGlobalTime=b.offset;renderVideo()};$("#videoNextScene").onclick=()=>{const a=sceneAtGlobal(videoGlobalTime);videoGlobalTime=Math.min(totalDuration(),a.offset+a.scene.duration+.001);renderVideo()};
$("#sceneNarration").onchange=e=>{sceneAtGlobal(videoGlobalTime).scene.narration=e.target.value;changed()};$("#sceneCaption").onchange=e=>{sceneAtGlobal(videoGlobalTime).scene.caption=e.target.value;changed();renderVideo()};
$("#recordVideo").onclick=()=>{if(recorder&&recorder.state==="recording"){recorder.stop();return}if(!videoCanvas.captureStream||!window.MediaRecorder)return alert("This browser does not support canvas recording.");recordChunks=[];const stream=videoCanvas.captureStream(project.fps||30);recorder=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"});recorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(recordChunks,{type:"video/webm"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(project.name||"mep-video")+".webm";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$("#recordVideo").textContent="Record WebM"};recorder.start();$("#recordVideo").textContent="Stop Recording";videoGlobalTime=0;videoPlaying=true;videoLast=performance.now();requestAnimationFrame(videoTick)};



$("#quickStart").onclick=()=>{
 project=MEPModel.project();project.name="My First MEP Video";project.era="Prehistory";
 scene=MEPModel.activeScene(project);scene.name="Opening Scene";scene.duration=12;scene.background.preset="countryside";scene.characters=[];
 const hunter=MEPModel.character("Hunter",410,430,"hunter");hunter.rig.bodyStyle="historyCutout";hunter.rig.prop="spear";MEPModel.applyPose(hunter,"spearWalk");
 const gatherer=MEPModel.character("Gatherer",760,430,"gatherer");gatherer.rig.bodyStyle="humanCartoon";MEPModel.applyPose(gatherer,"carry");
 scene.characters.push(hunter,gatherer);selectedId=hunter.id;selectedBubbleId=null;time=0;changed();syncUI();document.querySelector(".stageArea")?.scrollIntoView({behavior:"smooth",block:"start"});
};
document.querySelectorAll("[data-mobile-target]").forEach(b=>b.onclick=()=>document.querySelector(b.dataset.mobileTarget)?.scrollIntoView({behavior:"smooth",block:"start"}));
$("#mobileVideo").onclick=()=>$("#videoMode").click();

MEPStorage.initCloud().then(r=>{if(!r.ok)$("#accountStatus").textContent="Firebase error";});
MEPStorage.onUser(u=>{$("#accountStatus").textContent=u?u.email:"Signed out";$("#signOutButton").disabled=!u;});
$("#accountButton").onclick=()=>$("#accountDialog").showModal();$("#closeAccount").onclick=()=>$("#accountDialog").close();
$("#signInButton").onclick=async()=>{try{await MEPStorage.signIn($("#authEmail").value.trim(),$("#authPassword").value);$("#authMessage").textContent="Signed in. Cloud sync is ready.";$("#accountDialog").close()}catch(e){$("#authMessage").textContent=e.message}};
$("#signUpButton").onclick=async()=>{try{await MEPStorage.signUp($("#authEmail").value.trim(),$("#authPassword").value);$("#authMessage").textContent="Account created. Cloud sync is ready.";$("#accountDialog").close()}catch(e){$("#authMessage").textContent=e.message}};
$("#signOutButton").onclick=async()=>{await MEPStorage.signOut();$("#authMessage").textContent="Signed out."};

syncUI();
})();