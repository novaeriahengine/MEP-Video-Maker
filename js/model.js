window.MEPModel=(()=>{
const id=()=>crypto.randomUUID?crypto.randomUUID():"mep-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
const DEFAULT_POSE={head:0,torso:0,leftUpperArm:-25,leftLowerArm:-10,rightUpperArm:25,rightLowerArm:10,leftUpperLeg:-8,leftLowerLeg:5,rightUpperLeg:8,rightLowerLeg:5};
const POSES={
 idle:{...DEFAULT_POSE},attention:{...DEFAULT_POSE,leftUpperArm:-8,rightUpperArm:8,leftUpperLeg:0,rightUpperLeg:0},
 talk:{...DEFAULT_POSE,leftUpperArm:-48,leftLowerArm:-35,rightUpperArm:35,rightLowerArm:25},
 point:{...DEFAULT_POSE,leftUpperArm:-18,rightUpperArm:82,rightLowerArm:5},
 armsWide:{...DEFAULT_POSE,leftUpperArm:-92,leftLowerArm:-5,rightUpperArm:92,rightLowerArm:5},
 handsTogether:{...DEFAULT_POSE,leftUpperArm:-38,leftLowerArm:-62,rightUpperArm:38,rightLowerArm:62},
 crouch:{...DEFAULT_POSE,torso:-12,leftUpperLeg:62,leftLowerLeg:-70,rightUpperLeg:48,rightLowerLeg:-62,leftUpperArm:-18,rightUpperArm:18},
 kneel:{...DEFAULT_POSE,leftUpperLeg:12,leftLowerLeg:72,rightUpperLeg:55,rightLowerLeg:-75},
 fight:{...DEFAULT_POSE,rightUpperArm:105,rightLowerArm:-40,leftUpperArm:-55,leftLowerArm:35,leftUpperLeg:-18,rightUpperLeg:18},
 victory:{...DEFAULT_POSE,leftUpperArm:-145,leftLowerArm:0,rightUpperArm:145,rightLowerArm:0},
 marchA:{...DEFAULT_POSE,leftUpperArm:-55,rightUpperArm:55,leftUpperLeg:24,leftLowerLeg:20,rightUpperLeg:-24,rightLowerLeg:-10},
 marchB:{...DEFAULT_POSE,leftUpperArm:55,rightUpperArm:-55,leftUpperLeg:-24,leftLowerLeg:-10,rightUpperLeg:24,rightLowerLeg:20},
 spearWalk:{...DEFAULT_POSE,torso:-5,leftUpperArm:-48,leftLowerArm:-18,rightUpperArm:35,rightLowerArm:12,leftUpperLeg:28,leftLowerLeg:12,rightUpperLeg:-24,rightLowerLeg:20}
};
const STATES={standing:"idle",walking:"marchA",talking:"talk",pointing:"point",fighting:"fight",kneeling:"kneel",celebrating:"victory"};
const PROPS={none:{name:"None"},spear:{name:"Spear"},bow:{name:"Bow"},sword:{name:"Sword"},rifle:{name:"Rifle"},musket:{name:"Musket"},axe:{name:"Axe"},torch:{name:"Torch"},staff:{name:"Staff"}};
const EXPRESSIONS=["neutral","happy","angry","sad","surprised","determined","sleepy"];
const LOOK_TYPES={square:"Square",circle:"Circle",triangle:"Triangle",humanoid:"Humanoid",country:"Country Layout"};
const SHAPES={square:"Square",circle:"Circle",triangle:"Triangle"};
const BODY_STYLES={historyCutout:{name:"History Cutout",torsoWidth:1,limbWidth:1,headScale:1},humanCartoon:{name:"Human Cartoon",torsoWidth:1.25,limbWidth:1.35,headScale:.82},broad:{name:"Broad / Heavy",torsoWidth:1.65,limbWidth:1.55,headScale:1.05},tall:{name:"Tall / Slim",torsoWidth:.82,limbWidth:.78,headScale:.82,length:1.18},child:{name:"Child",torsoWidth:.8,limbWidth:.75,headScale:1.22,length:.72},heroic:{name:"Heroic",torsoWidth:1.45,limbWidth:1.35,headScale:.78,length:1.08}};
const EASINGS={linear:"Linear",easeIn:"Ease In",easeOut:"Ease Out",easeInOut:"Ease In/Out",hold:"Hold"};
const ANIMATION_CLIPS={
 slide:{name:"Slide",duration:2,poses:["idle","idle"],move:180},
 talkLoop:{name:"Talk / Explain",duration:2.4,poses:["idle","talk","point","talk","idle"],move:0,mouth:true},
 walk:{name:"Walk",duration:2,poses:["marchA","marchB","marchA","marchB","marchA"],move:150},
 attack:{name:"Attack",duration:1.6,poses:["attention","fight","fight","attention"],move:55},
 celebrate:{name:"Celebrate",duration:2,poses:["idle","armsWide","victory","armsWide"],move:0}
};
const HISTORY_ERAS=["Prehistory","Ancient","Medieval","Early Modern","Industrial","World Wars","Cold War","Modern","Custom"];
const yearToEra=year=>year<500?"Ancient":year<1450?"Medieval":year<1760?"Early Modern":year<1914?"Industrial":year<1946?"World Wars":year<1991?"Cold War":"Modern";
const BACKGROUNDS={
 parchment:{name:"Parchment",kind:"map",fill:"#e6d7a8",ground:"#c8b47e",tags:["history","map"]},
 worldMap:{name:"World Map",kind:"map",fill:"#a9c8dc",ground:"#d9d0ae",tags:["world","map"]},
 americasMap:{name:"Americas Map",kind:"map",fill:"#a9c8dc",ground:"#c9c59d",tags:["americas","map"]},
 europeMap:{name:"Europe Map",kind:"map",fill:"#b7cddd",ground:"#d9cfad",tags:["europe","map"]},
 africaMap:{name:"Africa Map",kind:"map",fill:"#b7cddd",ground:"#d7c79d",tags:["africa","map"]},
 asiaMap:{name:"Asia Map",kind:"map",fill:"#b7cddd",ground:"#d4c89e",tags:["asia","map"]},
 prehistoricCamp:{name:"Prehistoric Camp",kind:"scene",tags:["prehistory","camp"]},
 forest:{name:"Forest",kind:"scene",tags:["forest","nature"]},
 countryside:{name:"Countryside",kind:"scene",tags:["field","village"]},
 village:{name:"Village",kind:"scene",tags:["village","medieval"]},
 castle:{name:"Castle Courtyard",kind:"scene",tags:["castle","medieval"]},
 royalCourt:{name:"Royal Court",kind:"scene",tags:["royal","court"]},
 throneRoom:{name:"Throne Room",kind:"scene",tags:["royal","interior"]},
 shipDeck:{name:"Ship Deck",kind:"scene",tags:["ship","ocean","colonial"]},
 colonialPort:{name:"Colonial Port",kind:"scene",tags:["port","colonial","trade"]},
 harbor:{name:"Harbor",kind:"scene",tags:["harbor","trade"]},
 ocean:{name:"Ocean",kind:"scene",tags:["ocean","navy"]},
 city:{name:"City",kind:"scene",tags:["city"]},
 cityBattleStreet:{name:"Battle Street",kind:"scene",tags:["battle","city","street"]},
 battlefield:{name:"Battlefield",kind:"scene",tags:["war","battle"]},
 trench:{name:"Trench",kind:"scene",tags:["world war","trench"]},
 factory:{name:"Factory",kind:"scene",tags:["industrial","factory"]},
 classroom:{name:"Classroom",kind:"scene",tags:["school","lecture"]},
 library:{name:"Library",kind:"scene",tags:["library","education"]},
 mapRoom:{name:"Map Room",kind:"scene",tags:["map","war room"]},
 desert:{name:"Desert",kind:"scene",tags:["desert","campaign"]}
};
const PRESETS={
 unionSquare:{name:"Union Square",era:"Industrial",lookType:"country",shape:"square",countryCode:"US",year:1863,expression:"determined",hat:"none",hairStyle:"none",prop:"rifle"},
 narratorSquare:{name:"Narrator Square",era:"Custom",lookType:"square",shape:"square",fill:"#f0f1f3",expression:"neutral"},
 narratorCircle:{name:"Narrator Circle",era:"Custom",lookType:"circle",shape:"circle",fill:"#f0f1f3",expression:"neutral"},
 narratorTriangle:{name:"Narrator Triangle",era:"Custom",lookType:"triangle",shape:"triangle",fill:"#f0f1f3",expression:"neutral"},
 hunter:{name:"Prehistoric Hunter",era:"Prehistory",lookType:"humanoid",bodyStyle:"historyCutout",shirt:"#8a5d36",pants:"#604128",hairStyle:"messy",prop:"spear"},
 gatherer:{name:"Prehistoric Gatherer",era:"Prehistory",lookType:"humanoid",bodyStyle:"historyCutout",shirt:"#a87545",pants:"#6b4d32",hairStyle:"messy",prop:"none"},
 ancientSoldier:{name:"Ancient Soldier",era:"Ancient",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#9a3f35",pants:"#6d5235",hat:"helmet",prop:"spear"},
 ancientRuler:{name:"Ancient Ruler",era:"Ancient",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#713f65",pants:"#d1b17b",hat:"crown",accessory:"sash"},
 knight:{name:"Medieval Knight",era:"Medieval",lookType:"humanoid",bodyStyle:"heroic",shirt:"#7d8790",pants:"#444a50",hat:"helmet",prop:"sword"},
 medievalKing:{name:"Medieval King",era:"Medieval",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#793a61",pants:"#382f48",hat:"crown",accessory:"sash"},
 haitianRevolutionary:{name:"Haitian Revolutionary",era:"Early Modern",lookType:"country",shape:"square",countryCode:"HT",year:1803,expression:"determined",prop:"sword",accessory:"sash"},
 french1803:{name:"French Soldier 1803",era:"Early Modern",lookType:"country",shape:"square",countryCode:"FR",year:1803,expression:"angry",prop:"musket"},
 britishEmpire:{name:"British Empire",era:"Early Modern",lookType:"country",shape:"square",countryCode:"GB",year:1776,expression:"neutral",prop:"musket"},
 spanishEmpire:{name:"Spanish Empire",era:"Early Modern",lookType:"country",shape:"square",countryCode:"ES",year:1700,expression:"neutral",prop:"sword"},
 usaColonial:{name:"American Colonies",era:"Early Modern",lookType:"country",shape:"square",countryCode:"US",year:1776,expression:"determined"},
 confederateHistorical:{name:"Confederate States (historical)",era:"Industrial",lookType:"country",shape:"square",countryCode:"CSA",year:1863,expression:"angry",prop:"rifle"},
 empireBrazil:{name:"Empire of Brazil",era:"Industrial",lookType:"country",shape:"square",countryCode:"BR",year:1825,expression:"neutral"},
 industrialWorker:{name:"Industrial Worker",era:"Industrial",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#6b655d",pants:"#3f4347"},
 wwSoldier:{name:"World War Soldier",era:"World Wars",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#626a4e",pants:"#484c3d",hat:"helmet",prop:"rifle"},
 officer:{name:"Military Officer",era:"World Wars",lookType:"humanoid",bodyStyle:"heroic",shirt:"#35455a",pants:"#27313e",hat:"officer",accessory:"sash"},
 coldWarSoldier:{name:"Cold War Soldier",era:"Cold War",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#56634b",pants:"#3e4938",hat:"helmet",prop:"rifle"},
 presenter:{name:"Modern Presenter",era:"Modern",lookType:"humanoid",bodyStyle:"humanCartoon",shirt:"#315f86",pants:"#30343b",hairStyle:"side",accessory:"tie"},
 modernCountry:{name:"Modern Country",era:"Modern",lookType:"country",shape:"square",countryCode:"US",year:2026,expression:"neutral"}
};
const ERA_CHARACTER_PRESETS={
 Prehistory:["hunter","gatherer"],Ancient:["ancientSoldier","ancientRuler"],Medieval:["knight","medievalKing"],
 "Early Modern":["haitianRevolutionary","french1803","britishEmpire","spanishEmpire","usaColonial"],
 Industrial:["unionSquare","confederateHistorical","empireBrazil","industrialWorker"],"World Wars":["wwSoldier","officer"],
 "Cold War":["coldWarSoldier","presenter"],Modern:["modernCountry","presenter"],Custom:["unionSquare","narratorSquare","narratorCircle","narratorTriangle","presenter"]
};
const BUBBLE_STYLES={speech:{name:"Speech Bubble",fill:"#fff",stroke:"#222",text:"#171717",tail:"speech",radius:22},thought:{name:"Thought Bubble",fill:"#fff",stroke:"#222",text:"#171717",tail:"thought",radius:28},caption:{name:"Caption Box",fill:"#111d",stroke:"#0000",text:"#fff",tail:"none",radius:8},history:{name:"History Parchment",fill:"#f3e4bd",stroke:"#5b4630",text:"#302419",tail:"speech",radius:12},comic:{name:"Comic Burst",fill:"#fff8cf",stroke:"#222",text:"#111",tail:"burst",radius:4},subtitle:{name:"Subtitle",fill:"#000a",stroke:"#0000",text:"#fff",tail:"none",radius:2}};
function normalizePose(pose){const out={...DEFAULT_POSE};Object.keys(DEFAULT_POSE).forEach(k=>{if(Number.isFinite(pose?.[k]))out[k]=pose[k]});return out}
function character(name="Union Square",x=640,y=430,preset="unionSquare"){
 const p=PRESETS[preset]||PRESETS.unionSquare,look=p.lookType||"square",shape=p.shape||"square",year=p.year||1800,country=p.countryCode||"US";
 return{id:id(),type:"character",name:name||p.name,tags:["character",preset],x,y,scale:1,rotation:0,facing:1,layer:5,
  visual:{lookType:look,shape,countryCode:country,historicalYear:year,flagVariant:"auto",expression:p.expression||"neutral",fill:p.fill||"#eef0f2",stroke:"#17191d",eyeColor:"#111",mouthEnabled:true,mouthOpen:false,hairStyle:p.hairStyle||"none",hat:p.hat||"none",accessory:p.accessory||"none"},
  rig:{type:"mep-humanoid-v5",bodyStyle:p.bodyStyle||"historyCutout",skin:p.skin||"#d49b74",line:"#242424",shirt:p.shirt||"#58667a",hair:p.hair||"#34261e",pants:p.pants||"#343a46",hairStyle:p.hairStyle||"side",hat:p.hat||"none",accessory:p.accessory||"none",prop:p.prop||"none",expression:p.expression||"neutral",state:"standing",era:p.era||"Custom",headScale:1,limbScale:1},
  pose:{...DEFAULT_POSE},keyframes:[],clips:[]}
}
function scene(name="Scene 1"){
 return{id:id(),name,duration:8,background:{preset:"countryside",mode:"preset",assetId:null,fit:"cover",opacity:1,keyframes:[],tags:["history"]},transition:{type:"cut",duration:.35},camera:{x:640,y:360,zoom:1,keyframes:[]},markers:[],notes:"",script:"",caption:"",tags:["history"],characters:[character()],bubbles:[]}
}
function project(){
 const s=scene("Opening Scene");const p={schema:"mep-video-project",version:5,id:id(),name:"MEP History Video",category:"History",era:"Industrial",year:1863,tags:["history"],width:1280,height:720,fps:30,activeSceneId:s.id,scenes:[s],assets:[],customPoses:{},scripts:{project:"",sceneById:{}},sync:{provider:"firestore",status:"local",revision:0,lastSyncedAt:null},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return p
}
function capture(c){return{x:c.x,y:c.y,scale:c.scale,rotation:c.rotation||0,facing:c.facing,pose:{...c.pose},mouthOpen:!!c.visual?.mouthOpen}}
function ease(t,type="linear"){if(type==="hold")return 0;if(type==="easeIn")return t*t;if(type==="easeOut")return 1-(1-t)*(1-t);if(type==="easeInOut")return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return t}
const lerp=(a,b,t)=>a+(b-a)*t;
function poseAt(c,time){
 const ks=(c.keyframes||[]).slice().sort((a,b)=>a.time-b.time);if(!ks.length)return capture(c);if(time<=ks[0].time)return structuredClone(ks[0].state);if(time>=ks.at(-1).time)return structuredClone(ks.at(-1).state);
 let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++){if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}}
 const q=ease((time-a.time)/(b.time-a.time),b.easing||"linear"),out={x:lerp(a.state.x,b.state.x,q),y:lerp(a.state.y,b.state.y,q),scale:lerp(a.state.scale,b.state.scale,q),rotation:lerp(a.state.rotation||0,b.state.rotation||0,q),facing:q<.5?a.state.facing:b.state.facing,pose:{},mouthOpen:q<.5?!!a.state.mouthOpen:!!b.state.mouthOpen};
 Object.keys(DEFAULT_POSE).forEach(k=>out.pose[k]=lerp(a.state.pose?.[k]??DEFAULT_POSE[k],b.state.pose?.[k]??DEFAULT_POSE[k],q));return out
}
function applyPose(c,name){const p=POSES[name];if(p)c.pose={...p}}
function normalizeCharacter(raw,index=0){
 const base=character(raw?.name||("Character "+(index+1)),Number.isFinite(raw?.x)?raw.x:460+index*150,Number.isFinite(raw?.y)?raw.y:430,raw?.tags?.[1]||"unionSquare"),c={...base,...(raw||{})};c.visual={...base.visual,...(raw?.visual||{})};if(!raw?.visual&&raw?.rig)c.visual.lookType="humanoid";c.rig={...base.rig,...(raw?.rig||{})};c.pose=normalizePose(raw?.pose);c.tags=Array.isArray(raw?.tags)?raw.tags:base.tags;c.keyframes=Array.isArray(raw?.keyframes)?raw.keyframes.filter(k=>Number.isFinite(k?.time)&&k?.state).map(k=>({...k,id:k.id||id(),easing:EASINGS[k.easing]?k.easing:"linear",state:{x:Number.isFinite(k.state.x)?k.state.x:c.x,y:Number.isFinite(k.state.y)?k.state.y:c.y,scale:Number.isFinite(k.state.scale)?k.state.scale:c.scale,rotation:Number.isFinite(k.state.rotation)?k.state.rotation:0,facing:k.state.facing===-1?-1:1,pose:normalizePose(k.state.pose),mouthOpen:!!k.state.mouthOpen}})):[];c.clips=Array.isArray(raw?.clips)?raw.clips:[];return c
}
function normalizeScene(raw,index=0){
 const base=scene("Scene "+(index+1)),s={...base,...(raw||{})};s.id=s.id||id();s.duration=Number.isFinite(s.duration)&&s.duration>0?Math.min(300,s.duration):8;s.background={...base.background,...(raw?.background||{})};if(!BACKGROUNDS[s.background.preset])s.background.preset="countryside";s.background.keyframes=Array.isArray(s.background.keyframes)?s.background.keyframes:[];s.transition={...base.transition,...(raw?.transition||{})};s.camera={...base.camera,...(raw?.camera||{})};s.characters=Array.isArray(raw?.characters)?raw.characters.map(normalizeCharacter):base.characters;s.bubbles=Array.isArray(raw?.bubbles)?raw.bubbles:[];s.markers=Array.isArray(raw?.markers)?raw.markers:[];s.tags=Array.isArray(raw?.tags)?raw.tags:[];return s
}
function migrate(raw){
 if(!raw)return project();if(raw.schema!=="mep-video-project"&&!Array.isArray(raw.scenes))return project();const p={...project(),...raw};p.schema="mep-video-project";p.version=5;p.assets=Array.isArray(raw.assets)?raw.assets:[];p.customPoses=raw.customPoses||{};p.scripts={project:raw.scripts?.project||"",sceneById:raw.scripts?.sceneById||{}};p.sync={provider:"firestore",status:"local",revision:raw.sync?.revision||0,lastSyncedAt:raw.sync?.lastSyncedAt||null};p.scenes=(raw.scenes||[]).map(normalizeScene);if(!p.scenes.length)p.scenes=[scene()];if(!p.scenes.some(s=>s.id===p.activeSceneId))p.activeSceneId=p.scenes[0].id;p.year=Number.isFinite(raw.year)?raw.year:1863;p.era=raw.era||yearToEra(p.year);return p
}
function activeScene(p){return p.scenes.find(s=>s.id===p.activeSceneId)||p.scenes[0]}
function backgroundAt(s,time){
 const keys=(s.background?.keyframes||[]).slice().sort((a,b)=>a.time-b.time);let state={preset:s.background?.preset||"countryside",mode:s.background?.mode||"preset",assetId:s.background?.assetId||null,fit:s.background?.fit||"cover",opacity:Number.isFinite(s.background?.opacity)?s.background.opacity:1};
 keys.forEach(k=>{if(time>=k.time)state={...state,...k}});return state
}
function librarySnapshot(){return{schema:"mep-library-v2",version:2,eras:HISTORY_ERAS,lookTypes:LOOK_TYPES,shapes:SHAPES,expressions:EXPRESSIONS,characterPresets:structuredClone(PRESETS),eraCharacterPresets:structuredClone(ERA_CHARACTER_PRESETS),backgrounds:structuredClone(BACKGROUNDS),poses:structuredClone(POSES),states:structuredClone(STATES),props:structuredClone(PROPS),bodyStyles:structuredClone(BODY_STYLES),animationClips:structuredClone(ANIMATION_CLIPS),bubbleStyles:structuredClone(BUBBLE_STYLES),historicalFlags:window.MEPHistoryFlags?structuredClone(window.MEPHistoryFlags.HISTORICAL):{},updatedAt:new Date().toISOString()}}
function validateProject(p){const errors=[],warnings=[];if(p?.schema!=="mep-video-project")errors.push("Invalid project schema");if(!Array.isArray(p?.scenes)||!p.scenes.length)errors.push("Project needs at least one scene");(p?.scenes||[]).forEach((s,i)=>{if(!(s.duration>0))errors.push("Scene "+(i+1)+" has invalid duration");if(!BACKGROUNDS[s.background?.preset]&&s.background?.mode!=="image")warnings.push("Scene "+(i+1)+" has an unknown background preset");(s.characters||[]).forEach((c,j)=>{if(!c.id)errors.push("Scene "+(i+1)+" character "+(j+1)+" has no id");(c.keyframes||[]).forEach(k=>{if(k.time<0||k.time>s.duration)errors.push("Keyframe outside scene duration")})})});return{ok:!errors.length,errors,warnings}}
return{DEFAULT_POSE,POSES,STATES,PROPS,EXPRESSIONS,LOOK_TYPES,SHAPES,BODY_STYLES,EASINGS,ANIMATION_CLIPS,HISTORY_ERAS,BACKGROUNDS,CHARACTER_PRESETS:PRESETS,ERA_CHARACTER_PRESETS,BUBBLE_STYLES,id,character,scene,project,capture,poseAt,applyPose,migrate,activeScene,backgroundAt,librarySnapshot,validateProject,yearToEra};
})();