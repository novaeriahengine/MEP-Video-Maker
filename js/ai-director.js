window.MEPAIDirector=(()=>{
const VERSION="mep-director-v1";
const CAPABILITIES={
 schema:VERSION,
 canvas:{width:1280,height:720,origin:"top-left",groundY:570},
 eras:MEPModel.HISTORY_ERAS,
 backgrounds:Object.keys(MEPModel.BACKGROUNDS),
 poses:Object.keys(MEPModel.POSES),
 characterRig:{type:"mep-humanoid-v1",fields:["name","tags","x","y","scale","facing","rig.skin","rig.hair","rig.shirt"]},
 animation:{keyframeFields:["time","x","y","scale","facing","pose"],interpolation:"linear",poseJoints:Object.keys(MEPModel.DEFAULT_POSE)},
 limits:{recommendedSceneSeconds:[4,15],recommendedVideoSeconds:[15,180]}
};
function systemContext(){
 return `You are the MEP Video Maker AI Director. Return ONLY valid JSON matching mep-director-v1.
MEP is a 1280x720 2D history animation engine. Ground is y=570. Characters are articulated mep-humanoid-v1 rigs. Available backgrounds: ${CAPABILITIES.backgrounds.join(", ")}. Available poses: ${CAPABILITIES.poses.join(", ")}. Available eras: ${CAPABILITIES.eras.join(", ")}.
Create factual, concise educational history videos. Never invent dates, quotations, casualty numbers, motives, or identities when uncertain. Put uncertainty in researchNotes. Separate narration/factual claims from visual animation commands.
Output: {"schema":"mep-director-v1","title":"...","era":"...","tags":[],"researchNotes":[],"scenes":[{"name":"...","duration":8,"background":"parchment","tags":[],"narration":"...","caption":"...","characters":[{"name":"...","template":"civilian","tags":[],"x":400,"y":405,"scale":1,"facing":1,"appearance":{"skin":"#f2c7a5","hair":"#34261e","shirt":"#58667a"},"actions":[{"time":0,"pose":"idle","x":400,"y":405},{"time":2,"pose":"point","x":500,"y":405}]}]}]}.
Keep all times within each scene duration. Use only supported background and pose names. Prefer multiple short scenes over one huge scene.`;
}
function promptPackage(userPrompt,currentProject=null){return{protocol:VERSION,systemContext:systemContext(),capabilities:CAPABILITIES,userPrompt,currentProjectSummary:currentProject?{name:currentProject.name,category:currentProject.category,era:currentProject.era,tags:currentProject.tags,sceneCount:currentProject.scenes.length}:null}}
function validate(plan){
 const errors=[];if(plan?.schema!==VERSION)errors.push("schema must be "+VERSION);if(!Array.isArray(plan?.scenes)||!plan.scenes.length)errors.push("scenes must be a non-empty array");
 (plan?.scenes||[]).forEach((s,i)=>{if(!(s.duration>0&&s.duration<=300))errors.push("scene "+(i+1)+" has invalid duration");if(!MEPModel.BACKGROUNDS[s.background])errors.push("scene "+(i+1)+" has unsupported background");(s.characters||[]).forEach((c,j)=>(c.actions||[]).forEach((a,k)=>{if(a.time<0||a.time>s.duration)errors.push("scene "+(i+1)+" character "+(j+1)+" action "+(k+1)+" time is outside scene");if(a.pose&&!MEPModel.POSES[a.pose])errors.push("unsupported pose: "+a.pose)}))});return{ok:errors.length===0,errors};
}
function apply(plan){
 const check=validate(plan);if(!check.ok)throw new Error(check.errors.join("\n"));
 const p=MEPModel.project();p.name=plan.title||"AI History Video";p.era=plan.era||"Custom";p.tags=plan.tags||["history"];p.scenes=[];
 plan.scenes.forEach((src,si)=>{const s=MEPModel.scene(src.name||("Scene "+(si+1)));s.duration=src.duration;s.background.preset=src.background;s.tags=src.tags||[];s.narration=src.narration||"";s.caption=src.caption||"";s.characters=[];
 (src.characters||[]).forEach((spec,ci)=>{const c=MEPModel.character(spec.name||("Character "+(ci+1)),Number(spec.x??400),Number(spec.y??405),spec.template||"civilian");c.tags=spec.tags||[];c.scale=Number(spec.scale??1);c.facing=Number(spec.facing??1)>=0?1:-1;if(spec.appearance)c.rig={...c.rig,...spec.appearance};c.keyframes=[];
 (spec.actions||[]).forEach(a=>{if(a.pose)MEPModel.applyPose(c,a.pose);if(Number.isFinite(a.x))c.x=a.x;if(Number.isFinite(a.y))c.y=a.y;if(Number.isFinite(a.scale))c.scale=a.scale;if(Number.isFinite(a.facing))c.facing=a.facing>=0?1:-1;c.keyframes.push({id:MEPModel.id(),time:a.time,state:MEPModel.capture(c)})});s.characters.push(c)});p.scenes.push(s)});
 p.activeSceneId=p.scenes[0].id;p.updatedAt=new Date().toISOString();return p;
}
async function generate(userPrompt,currentProject){
 const endpoint=window.MEP_AI_ENDPOINT;if(!endpoint)throw new Error("AI backend is not configured. Set window.MEP_AI_ENDPOINT in js/ai-config.js.");
 const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(promptPackage(userPrompt,currentProject))});if(!res.ok)throw new Error("AI backend returned "+res.status);return await res.json();
}
return{VERSION,CAPABILITIES,systemContext,promptPackage,validate,apply,generate};
})();