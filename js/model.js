window.MEPModel=(()=>{
const DEFAULT_POSE={head:0,torso:0,leftUpperArm:-25,leftLowerArm:-10,rightUpperArm:25,rightLowerArm:10,leftUpperLeg:-8,leftLowerLeg:5,rightUpperLeg:8,rightLowerLeg:5};
const STATES={standing:"idle",walking:"marchA",sitting:"sit",talking:"talk",pointing:"point",hunting:"hunt",fighting:"fight",kneeling:"kneel",celebrating:"victory"};
const PROPS={none:{name:"None"},spear:{name:"Spear",kind:"long"},bow:{name:"Bow",kind:"bow"},sword:{name:"Sword",kind:"blade"},rifle:{name:"Rifle",kind:"long"},musket:{name:"Musket",kind:"long"},axe:{name:"Axe",kind:"axe"},torch:{name:"Torch",kind:"torch"},staff:{name:"Staff",kind:"long"}};
const POSES={
 idle:{...DEFAULT_POSE},
 attention:{...DEFAULT_POSE,leftUpperArm:-8,rightUpperArm:8,leftUpperLeg:0,rightUpperLeg:0},
 point:{...DEFAULT_POSE,rightUpperArm:82,rightLowerArm:5,leftUpperArm:-18},
 talk:{...DEFAULT_POSE,leftUpperArm:-65,leftLowerArm:-35,rightUpperArm:55,rightLowerArm:35},
 victory:{...DEFAULT_POSE,leftUpperArm:-145,leftLowerArm:0,rightUpperArm:145,rightLowerArm:0},
 marchA:{...DEFAULT_POSE,leftUpperArm:-55,rightUpperArm:55,leftUpperLeg:24,rightUpperLeg:-24,leftLowerLeg:20,rightLowerLeg:-10},
 marchB:{...DEFAULT_POSE,leftUpperArm:55,rightUpperArm:-55,leftUpperLeg:-24,rightUpperLeg:24,leftLowerLeg:-10,rightLowerLeg:20},
 sit:{...DEFAULT_POSE,torso:-4,leftUpperLeg:78,rightUpperLeg:72,leftLowerLeg:-70,rightLowerLeg:-65,leftUpperArm:-8,rightUpperArm:8},
 kneel:{...DEFAULT_POSE,leftUpperLeg:12,leftLowerLeg:72,rightUpperLeg:55,rightLowerLeg:-75},
 hunt:{...DEFAULT_POSE,leftUpperArm:-82,leftLowerArm:8,rightUpperArm:78,rightLowerArm:-18,torso:-8},
 fight:{...DEFAULT_POSE,rightUpperArm:105,rightLowerArm:-40,leftUpperArm:-55,leftLowerArm:35,leftUpperLeg:-18,rightUpperLeg:18},
 armsWide:{...DEFAULT_POSE,leftUpperArm:-92,leftLowerArm:-5,rightUpperArm:92,rightLowerArm:5},
 explainLeft:{...DEFAULT_POSE,leftUpperArm:-72,leftLowerArm:-45,rightUpperArm:18,rightLowerArm:25},
 explainRight:{...DEFAULT_POSE,leftUpperArm:-18,leftLowerArm:-25,rightUpperArm:72,rightLowerArm:45},
 handsTogether:{...DEFAULT_POSE,leftUpperArm:-38,leftLowerArm:-62,rightUpperArm:38,rightLowerArm:62},
 crouch:{...DEFAULT_POSE,torso:-12,leftUpperLeg:62,leftLowerLeg:-70,rightUpperLeg:48,rightLowerLeg:-62,leftUpperArm:-18,rightUpperArm:18},
 carry:{...DEFAULT_POSE,torso:-8,leftUpperArm:-58,leftLowerArm:-62,rightUpperArm:58,rightLowerArm:62,leftUpperLeg:12,rightUpperLeg:-12},
 dig:{...DEFAULT_POSE,torso:-25,leftUpperArm:-72,leftLowerArm:35,rightUpperArm:48,rightLowerArm:-35,leftUpperLeg:18,rightUpperLeg:-10},
 spearWalk:{...DEFAULT_POSE,torso:-5,leftUpperArm:-48,leftLowerArm:-18,rightUpperArm:35,rightLowerArm:12,leftUpperLeg:28,leftLowerLeg:12,rightUpperLeg:-24,rightLowerLeg:20}
};
const EASINGS={linear:"Linear",easeIn:"Ease In",easeOut:"Ease Out",easeInOut:"Ease In/Out",hold:"Hold"};
const ANIMATION_CLIPS={
 walk:{name:"Walk",duration:2,poses:["marchA","marchB","marchA","marchB","marchA"],move:150},
 talkLoop:{name:"Talk / Explain",duration:2.4,poses:["idle","talk","explainLeft","talk","explainRight","idle"],move:0},
 attack:{name:"Attack",duration:1.6,poses:["attention","fight","fight","attention"],move:55},
 celebrate:{name:"Celebrate",duration:2,poses:["idle","armsWide","victory","armsWide"],move:0},
 crouchRise:{name:"Crouch → Stand",duration:1.8,poses:["idle","crouch","kneel","idle"],move:0},
 spearAdvance:{name:"Spear Advance",duration:2.4,poses:["spearWalk","marchB","spearWalk","fight"],move:180}
};
const BUBBLE_STYLES={
 speech:{name:"Speech Bubble",fill:"#ffffff",stroke:"#222222",text:"#171717",tail:"speech",radius:22},
 thought:{name:"Thought Bubble",fill:"#ffffff",stroke:"#222222",text:"#171717",tail:"thought",radius:28},
 caption:{name:"Caption Box",fill:"#111111dd",stroke:"#ffffff00",text:"#ffffff",tail:"none",radius:8},
 history:{name:"History Parchment",fill:"#f3e4bd",stroke:"#5b4630",text:"#302419",tail:"speech",radius:12},
 comic:{name:"Comic Burst",fill:"#fff8cf",stroke:"#222222",text:"#111111",tail:"burst",radius:4},
 subtitle:{name:"Subtitle",fill:"#000000aa",stroke:"#00000000",text:"#ffffff",tail:"none",radius:2}
};
const BODY_STYLES={historyCutout:{name:"History Cutout",torsoWidth:1,limbWidth:1,headScale:1},humanCartoon:{name:"Human Cartoon",torsoWidth:1.25,limbWidth:1.35,headScale:.82},broad:{name:"Broad / Heavy",torsoWidth:1.65,limbWidth:1.55,headScale:1.05},tall:{name:"Tall / Slim",torsoWidth:.82,limbWidth:.78,headScale:.82,length:1.18},child:{name:"Child",torsoWidth:.8,limbWidth:.75,headScale:1.22,length:.72},heroic:{name:"Heroic",torsoWidth:1.45,limbWidth:1.35,headScale:.78,length:1.08}};
const HISTORY_ERAS=["Prehistory","Ancient","Medieval","Early Modern","Industrial","World Wars","Cold War","Modern","Custom"];
const ERA_CHARACTER_PRESETS={
 Prehistory:["hunter","gatherer","prehistoricElder","prehistoricChild"],
 Ancient:["ancientSoldier","ancientCivilian","ancientRuler","ancientScholar"],
 Medieval:["knight","medievalArcher","medievalPeasant","medievalKing"],
 "Early Modern":["haitianRevolutionary","french1803","revolutionary","monarch","sailor"],
 Industrial:["industrialWorker","inventor","victorianCivilian","factoryOwner"],
 "World Wars":["wwSoldier","officer","wwNurse","wwCivilian"],
 "Cold War":["coldWarSoldier","diplomat","scientist","presenter"],
 Modern:["presenter","modernSoldier","reporter","civilian","child"],
 Custom:["civilian","child","presenter"]
};
const CHARACTER_PRESETS={
 hunter:{name:"Prehistoric Hunter",era:"Prehistory",shirt:"#8a5d36",pants:"#604128",hairStyle:"messy",hat:"none",accessory:"none",prop:"spear"},
 gatherer:{name:"Prehistoric Gatherer",era:"Prehistory",shirt:"#a87545",pants:"#6b4d32",hairStyle:"messy",hat:"none",accessory:"none",prop:"none"},
 prehistoricElder:{name:"Prehistoric Elder",era:"Prehistory",shirt:"#6d513d",pants:"#4d3a2d",hairStyle:"wave",hat:"none",accessory:"none",prop:"staff"},
 prehistoricChild:{name:"Prehistoric Child",era:"Prehistory",shirt:"#b98655",pants:"#70503b",hairStyle:"messy",hat:"none",accessory:"none",prop:"none",bodyStyle:"child"},
 ancientSoldier:{name:"Ancient Soldier",era:"Ancient",shirt:"#9a3f35",pants:"#6d5235",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"spear"},
 ancientCivilian:{name:"Ancient Civilian",era:"Ancient",shirt:"#c4a878",pants:"#8b7654",hairStyle:"wave",hat:"none",accessory:"none",prop:"staff"},
 ancientRuler:{name:"Ancient Ruler",era:"Ancient",shirt:"#713f65",pants:"#d1b17b",hairStyle:"wave",hat:"crown",accessory:"sash",prop:"staff"},
 ancientScholar:{name:"Ancient Scholar",era:"Ancient",shirt:"#d0c0a1",pants:"#7d6f58",hairStyle:"wave",hat:"none",accessory:"none",prop:"staff"},
 knight:{name:"Medieval Knight",era:"Medieval",shirt:"#7d8790",pants:"#444a50",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"sword"},
 medievalArcher:{name:"Medieval Archer",era:"Medieval",shirt:"#58704a",pants:"#403a32",hairStyle:"short",hat:"none",accessory:"belt",prop:"bow"},
 medievalPeasant:{name:"Medieval Peasant",era:"Medieval",shirt:"#7a6545",pants:"#514634",hairStyle:"messy",hat:"none",accessory:"belt",prop:"staff"},
 medievalKing:{name:"Medieval King",era:"Medieval",shirt:"#793a61",pants:"#382f48",hairStyle:"wave",hat:"crown",accessory:"sash",prop:"sword"},
 haitianRevolutionary:{name:"Haitian Revolutionary",era:"Early Modern",shirt:"#9b2f32",pants:"#ece8d9",hairStyle:"short",hat:"none",accessory:"sash",prop:"sword"},
 french1803:{name:"French Colonial Soldier 1803",era:"Early Modern",shirt:"#244d7a",pants:"#e7e5da",hairStyle:"short",hat:"none",accessory:"belt",prop:"musket"},
 revolutionary:{name:"Revolutionary",era:"Early Modern",shirt:"#79513d",pants:"#4b3b32",hairStyle:"messy",hat:"tricorn",accessory:"belt",prop:"musket"},
 monarch:{name:"Monarch",era:"Early Modern",shirt:"#7a315c",pants:"#392b48",hairStyle:"wave",hat:"crown",accessory:"sash",prop:"none"},
 sailor:{name:"Sailor",era:"Early Modern",shirt:"#dfddd1",pants:"#34485d",hairStyle:"short",hat:"none",accessory:"belt",prop:"none"},
 industrialWorker:{name:"Industrial Worker",era:"Industrial",shirt:"#6b655d",pants:"#3f4347",hairStyle:"short",hat:"none",accessory:"belt",prop:"none"},
 inventor:{name:"Inventor",era:"Industrial",shirt:"#5b4a3f",pants:"#33363b",hairStyle:"wave",hat:"none",accessory:"tie",prop:"none"},
 victorianCivilian:{name:"Victorian Civilian",era:"Industrial",shirt:"#455267",pants:"#292f38",hairStyle:"side",hat:"none",accessory:"tie",prop:"none"},
 factoryOwner:{name:"Factory Owner",era:"Industrial",shirt:"#353944",pants:"#24262c",hairStyle:"side",hat:"none",accessory:"tie",prop:"staff"},
 wwSoldier:{name:"World War Soldier",era:"World Wars",shirt:"#626a4e",pants:"#484c3d",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"rifle"},
 officer:{name:"Military Officer",era:"World Wars",shirt:"#35455a",pants:"#27313e",hairStyle:"short",hat:"officer",accessory:"sash",prop:"none"},
 wwNurse:{name:"World War Nurse",era:"World Wars",shirt:"#e6e1d7",pants:"#8e9398",hairStyle:"side",hat:"none",accessory:"none",prop:"none"},
 wwCivilian:{name:"World War Civilian",era:"World Wars",shirt:"#796b5d",pants:"#4d4b47",hairStyle:"side",hat:"none",accessory:"none",prop:"none"},
 coldWarSoldier:{name:"Cold War Soldier",era:"Cold War",shirt:"#56634b",pants:"#3e4938",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"rifle"},
 diplomat:{name:"Diplomat",era:"Cold War",shirt:"#334760",pants:"#242d38",hairStyle:"side",hat:"none",accessory:"tie",prop:"none"},
 scientist:{name:"Scientist",era:"Cold War",shirt:"#e5e5df",pants:"#4b5561",hairStyle:"side",hat:"none",accessory:"none",prop:"none"},
 presenter:{name:"Presenter",era:"Modern",shirt:"#315f86",pants:"#30343b",hairStyle:"side",hat:"none",accessory:"tie",prop:"none"},
 modernSoldier:{name:"Modern Soldier",era:"Modern",shirt:"#65705b",pants:"#4c5545",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"rifle"},
 reporter:{name:"Reporter",era:"Modern",shirt:"#744f6d",pants:"#34333b",hairStyle:"side",hat:"none",accessory:"none",prop:"none"},
 civilian:{name:"Civilian",era:"Custom",shirt:"#58667a",pants:"#343a46",hairStyle:"side",hat:"none",accessory:"none",prop:"none"},
 child:{name:"Child",era:"Custom",shirt:"#6e87a4",pants:"#46515f",hairStyle:"short",hat:"none",accessory:"none",prop:"none",bodyStyle:"child"}
}
const BACKGROUNDS={
 parchment:{name:"Parchment / Map",fill:"#eee2c5",ground:"#c7b58d",tags:["map","parchment","history"]},
 battlefield:{name:"Battlefield",fill:"#c9d1bd",ground:"#72755f",tags:["war","field","battle"]},
 palace:{name:"Palace Hall",fill:"#eadfcf",ground:"#9b795d",tags:["royal","palace","politics"]},
 city:{name:"City",fill:"#d9e0e5",ground:"#858b90",tags:["city","modern","street"]},
 countryside:{name:"Countryside",fill:"#d9e7d0",ground:"#769064",tags:["farm","country","village"]},
 archive:{name:"Archive / Document",fill:"#f0eadc",ground:"#b9ad96",tags:["document","archive","biography"]},
 worldMap:{name:"World Map",fill:"#a9c8dc",ground:"#d9d0ae",tags:["world","map","geography"],kind:"map"},
 europeMap:{name:"Europe Map",fill:"#b7cddd",ground:"#d9cfad",tags:["europe","map","war"],kind:"map"},
 americasMap:{name:"Americas Map",fill:"#a9c8dc",ground:"#c9c59d",tags:["americas","map","geography"],kind:"map"},
 asiaMap:{name:"Asia Map",fill:"#b7cddd",ground:"#d4c89e",tags:["asia","map","geography"],kind:"map"},
 africaMap:{name:"Africa Map",fill:"#b7cddd",ground:"#d7c79d",tags:["africa","map","geography"],kind:"map"},
 prehistoricCamp:{name:"Prehistoric Camp",fill:"#d8b17a",ground:"#7e6548",tags:["prehistory","camp","cave"]},
 forest:{name:"Forest",fill:"#a9c8a0",ground:"#566b45",tags:["forest","nature","travel"]},
 village:{name:"Village",fill:"#d9c7a2",ground:"#8b7558",tags:["village","medieval","town"]},
 castle:{name:"Castle Courtyard",fill:"#b9c1c8",ground:"#777e82",tags:["castle","medieval","war"]},
 throneRoom:{name:"Throne Room",fill:"#6a5364",ground:"#4b3844",tags:["royal","palace","court"]},
 trench:{name:"Trench",fill:"#a99c7d",ground:"#5e5140",tags:["world war","trench","battle"]},
 harbor:{name:"Harbor",fill:"#a8c8da",ground:"#8d765e",tags:["ships","harbor","trade"]},
 ocean:{name:"Ocean",fill:"#78aeca",ground:"#3f6f89",tags:["ocean","navy","travel"]},
 factory:{name:"Factory",fill:"#a9abb0",ground:"#62656a",tags:["industrial","factory","machines"]},
 classroom:{name:"Classroom",fill:"#d8c9ad",ground:"#8e7656",tags:["school","education","interior"]},
 desert:{name:"Desert",fill:"#e3c27b",ground:"#c59a52",tags:["desert","campaign","travel"]}
};
let uid=0;const id=()=>Date.now().toString(36)+(uid++).toString(36);
function character(name="Historian",x=640,y=405,template="civilian"){
 const preset=CHARACTER_PRESETS[template]||CHARACTER_PRESETS.civilian; return{id:id(),type:"character",name,tags:["character",template],x,y,scale:1,facing:1,rig:{type:"mep-humanoid-v3",body:"adult",bodyStyle:preset.bodyStyle||"historyCutout",skin:"#f2c7a5",line:"#242424",shirt:preset.shirt,hair:"#34261e",pants:preset.pants,hairStyle:preset.hairStyle,hat:preset.hat,accessory:preset.accessory,prop:preset.prop||"none",expression:"neutral",state:"standing",era:preset.era||"Custom",headScale:1,limbScale:1},pose:{...DEFAULT_POSE},keyframes:[]};
}
function scene(name="Scene 1"){
 return{id:id(),name,duration:8,background:{preset:"parchment",tags:["history","map"],customFill:null},transition:{type:"cut",duration:.35},camera:{x:640,y:360,zoom:1,keyframes:[]},markers:[],notes:"",tags:["history"],characters:[character()],bubbles:[]};
}
function project(){
 const s=scene();return{schema:"mep-video-project",version:4,id:id(),name:"Untitled History",category:"History",era:"Custom",tags:["history"],sync:{provider:"firebase",status:"unconfigured",revision:0,ownerUid:null,lastSyncedAt:null},assets:[],customPoses:{},width:1280,height:720,fps:30,activeSceneId:s.id,scenes:[s],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
function normalizePose(pose){const out={...DEFAULT_POSE};for(const k of Object.keys(DEFAULT_POSE))if(Number.isFinite(pose?.[k]))out[k]=pose[k];return out}
function normalizeCharacter(ch,index=0){
 const fallback=character(ch?.name||("Character "+(index+1)),Number.isFinite(ch?.x)?ch.x:420+index*160,Number.isFinite(ch?.y)?ch.y:430,ch?.tags?.[1]||"civilian");
 const out={...fallback,...(ch||{})};out.id=out.id||id();out.x=Number.isFinite(out.x)?out.x:fallback.x;out.y=Number.isFinite(out.y)?out.y:fallback.y;out.scale=Number.isFinite(out.scale)?out.scale:1;out.facing=out.facing===-1?-1:1;out.tags=Array.isArray(out.tags)?out.tags:["character"];out.rig={...fallback.rig,...(out.rig||{})};out.pose=normalizePose(out.pose);out.keyframes=Array.isArray(out.keyframes)?out.keyframes:[];out.keyframes=out.keyframes.filter(k=>Number.isFinite(k?.time)&&k?.state).map(k=>({...k,id:k.id||id(),easing:EASINGS[k.easing]?k.easing:"linear",state:{x:Number.isFinite(k.state.x)?k.state.x:out.x,y:Number.isFinite(k.state.y)?k.state.y:out.y,scale:Number.isFinite(k.state.scale)?k.state.scale:out.scale,facing:k.state.facing===-1?-1:1,pose:normalizePose(k.state.pose)}}));out.clips=Array.isArray(out.clips)?out.clips:[];return out
}
function normalizeScene(s,index=0){
 const fallback=scene("Scene "+(index+1)),out={...fallback,...(s||{})};out.id=out.id||id();out.name=out.name||("Scene "+(index+1));out.duration=Number.isFinite(out.duration)&&out.duration>0?Math.min(300,out.duration):8;out.background={...fallback.background,...(out.background||{})};if(!BACKGROUNDS[out.background.preset])out.background.preset="countryside";out.transition={...fallback.transition,...(out.transition||{})};out.camera={...fallback.camera,...(out.camera||{})};out.tags=Array.isArray(out.tags)?out.tags:[];out.markers=Array.isArray(out.markers)?out.markers:[];out.bubbles=Array.isArray(out.bubbles)?out.bubbles:[];out.characters=Array.isArray(out.characters)?out.characters.map(normalizeCharacter):[];if(!out.characters.length)out.characters=[character("Presenter",520,430,"presenter"),character("Soldier",760,430,"wwSoldier")];return out
}
function starterProject(){
 const p=project();p.name="MEP Starter Studio";p.era="Early Modern";p.tags=["starter","history","demo"];const s=normalizeScene({name:"Starter Scene",duration:10,background:{preset:"countryside",tags:["starter"]},transition:{type:"fade",duration:.45},camera:{x:640,y:360,zoom:1,keyframes:[]},characters:[character("Haitian Revolutionary",430,430,"haitianRevolutionary"),character("French Soldier",800,430,"french1803"),character("Presenter",1040,430,"presenter")],bubbles:[{id:id(),type:"bubble",text:"MEP is ready — select a character and animate.",style:"speech",x:350,y:70,width:570,height:100,fontSize:28,fill:"#ffffff",textColor:"#171717",startTime:0,endTime:4,tailX:520,tailY:230}],markers:[{id:id(),time:0,label:"Start"},{id:id(),time:5,label:"Action"},{id:id(),time:10,label:"End"}]});MEPModelSafeApply(s.characters[0],"armsWide");MEPModelSafeApply(s.characters[1],"attention");MEPModelSafeApply(s.characters[2],"talk");p.scenes=[s];p.activeSceneId=s.id;return p
}
function MEPModelSafeApply(ch,name){if(ch&&POSES[name])ch.pose={...POSES[name]}}
function migrate(p){
 if(p?.version>=2&&Array.isArray(p.scenes)){p.version=4;p.sync=p.sync||{provider:"firestore",status:"local",revision:0,lastSyncedAt:null};p.assets=Array.isArray(p.assets)?p.assets:[];p.customPoses=p.customPoses||{};p.scenes=p.scenes.map(normalizeScene);if(!p.scenes.length)return starterProject();if(!p.scenes.some(s=>s.id===p.activeSceneId))p.activeSceneId=p.scenes[0].id;return p;}
 if(p?.characters){const s=scene();s.duration=p.duration||8;s.characters=p.characters;s.background={preset:"parchment",tags:["history"],customFill:p.background||null};return{...project(),name:p.name||"Imported Project",category:p.category||"History",fps:p.fps||30,activeSceneId:s.id,scenes:[s]};}
 return starterProject();
}
const lerp=(a,b,t)=>a+(b-a)*t;
function ease(t,type="linear"){if(type==="hold")return 0;if(type==="easeIn")return t*t;if(type==="easeOut")return 1-(1-t)*(1-t);if(type==="easeInOut")return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return t}
function poseAt(c,time){const ks=(c.keyframes||[]).slice().sort((a,b)=>a.time-b.time);if(!ks.length)return{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}};if(time<=ks[0].time)return structuredClone(ks[0].state);if(time>=ks.at(-1).time)return structuredClone(ks.at(-1).state);let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++)if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}const raw=(time-a.time)/(b.time-a.time),q=ease(raw,b.easing||"linear"),o={x:lerp(a.state.x,b.state.x,q),y:lerp(a.state.y,b.state.y,q),scale:lerp(a.state.scale,b.state.scale,q),facing:q<.5?a.state.facing:b.state.facing,pose:{}};Object.keys(DEFAULT_POSE).forEach(k=>o.pose[k]=lerp(a.state.pose[k],b.state.pose[k],q));return o}
const capture=c=>({x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}});
function applyPose(c,name){if(POSES[name])c.pose={...POSES[name]}}
function validateProject(p){
 const errors=[],warnings=[];
 if(!p||p.schema!=="mep-video-project")errors.push("schema must be mep-video-project");
 if(!Array.isArray(p?.scenes)||!p.scenes.length)errors.push("project needs at least one scene");
 (p?.scenes||[]).forEach((s,si)=>{
  if(!(s.duration>0&&s.duration<=300))errors.push("scene "+(si+1)+" has invalid duration");
  if(!BACKGROUNDS[s.background?.preset])warnings.push("scene "+(si+1)+" uses unknown background "+(s.background?.preset||"(none)"));
  (s.characters||[]).forEach((ch,ci)=>{
   if(!ch.id)errors.push("scene "+(si+1)+" character "+(ci+1)+" has no id");
   Object.keys(DEFAULT_POSE).forEach(j=>{if(!Number.isFinite(ch.pose?.[j]))warnings.push("scene "+(si+1)+" "+(ch.name||"character")+" missing joint "+j)});
   (ch.keyframes||[]).forEach((kf,ki)=>{
    if(!Number.isFinite(kf.time)||kf.time<0||kf.time>s.duration)errors.push("scene "+(si+1)+" "+(ch.name||"character")+" keyframe "+(ki+1)+" is outside scene duration");
    if(kf.easing&&!EASINGS[kf.easing])warnings.push("unknown easing "+kf.easing);
   });
  });
  (s.bubbles||[]).forEach((b,bi)=>{if((b.startTime??0)>(b.endTime??s.duration))errors.push("scene "+(si+1)+" bubble "+(bi+1)+" has start after end")});
 });
 return{ok:errors.length===0,errors,warnings};
}
function librarySnapshot(){return{schema:"mep-library-v1",version:1,eras:HISTORY_ERAS,characterPresets:structuredClone(CHARACTER_PRESETS),eraCharacterPresets:structuredClone(ERA_CHARACTER_PRESETS),bodyStyles:structuredClone(BODY_STYLES),backgrounds:structuredClone(BACKGROUNDS),poses:structuredClone(POSES),states:structuredClone(STATES),props:structuredClone(PROPS),animationClips:structuredClone(ANIMATION_CLIPS),bubbleStyles:structuredClone(BUBBLE_STYLES),easings:structuredClone(EASINGS),updatedAt:new Date().toISOString()}}
function activeScene(p){return p.scenes.find(s=>s.id===p.activeSceneId)||p.scenes[0]}
return{DEFAULT_POSE,starterProject,normalizeScene,normalizeCharacter,BODY_STYLES,STATES,PROPS,POSES,EASINGS,ANIMATION_CLIPS,BUBBLE_STYLES,HISTORY_ERAS,ERA_CHARACTER_PRESETS,CHARACTER_PRESETS,BACKGROUNDS,id,character,scene,project,migrate,poseAt,capture,applyPose,validateProject,librarySnapshot,activeScene};
})();