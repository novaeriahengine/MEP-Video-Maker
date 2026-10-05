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
const ERA_CHARACTER_PRESETS={Prehistory:["hunter","gatherer"],Ancient:["ancientSoldier","ancientCivilian"],Medieval:["knight","medievalPeasant"],"Early Modern":["haitianRevolutionary","french1803","revolutionary","monarch"],Industrial:["industrialWorker","officer"],"World Wars":["wwSoldier","officer"],"Cold War":["coldWarSoldier","presenter"],Modern:["presenter","modernSoldier"],Custom:["civilian"]};
const CHARACTER_PRESETS={hunter:{name:"Prehistoric Hunter",era:"Prehistory",shirt:"#8a5d36",pants:"#604128",hairStyle:"messy",hat:"none",accessory:"none",prop:"spear"},gatherer:{name:"Prehistoric Gatherer",era:"Prehistory",shirt:"#a87545",pants:"#6b4d32",hairStyle:"messy",hat:"none",accessory:"none",prop:"none"},ancientSoldier:{name:"Ancient Soldier",era:"Ancient",shirt:"#9a3f35",pants:"#6d5235",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"spear"},ancientCivilian:{name:"Ancient Civilian",era:"Ancient",shirt:"#c4a878",pants:"#8b7654",hairStyle:"wave",hat:"none",accessory:"none",prop:"staff"},knight:{name:"Medieval Knight",era:"Medieval",shirt:"#7d8790",pants:"#444a50",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"sword"},medievalPeasant:{name:"Medieval Peasant",era:"Medieval",shirt:"#7a6545",pants:"#514634",hairStyle:"messy",hat:"none",accessory:"belt",prop:"staff"},wwSoldier:{name:"World War Soldier",era:"World Wars",shirt:"#626a4e",pants:"#484c3d",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"rifle"},coldWarSoldier:{name:"Cold War Soldier",era:"Cold War",shirt:"#56634b",pants:"#3e4938",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"rifle"},modernSoldier:{name:"Modern Soldier",era:"Modern",shirt:"#65705b",pants:"#4c5545",hairStyle:"short",hat:"helmet",accessory:"belt",prop:"rifle"},civilian:{name:"Civilian",shirt:"#58667a",pants:"#343a46",hairStyle:"side",hat:"none",accessory:"none"},monarch:{name:"Monarch",shirt:"#7a315c",pants:"#392b48",hairStyle:"wave",hat:"crown",accessory:"sash"},soldier:{name:"Infantry Soldier",shirt:"#59654c",pants:"#41483b",hairStyle:"short",hat:"helmet",accessory:"belt"},officer:{name:"Military Officer",shirt:"#35455a",pants:"#27313e",hairStyle:"short",hat:"officer",accessory:"sash"},haitianRevolutionary:{name:"Haitian Revolutionary",era:"Early Modern",shirt:"#9b2f32",pants:"#ece8d9",hairStyle:"short",hat:"none",accessory:"sash",prop:"sword"},french1803:{name:"French Colonial Soldier 1803",era:"Early Modern",shirt:"#244d7a",pants:"#e7e5da",hairStyle:"short",hat:"none",accessory:"belt",prop:"musket"},revolutionary:{name:"Revolutionary",shirt:"#79513d",pants:"#4b3b32",hairStyle:"messy",hat:"tricorn",accessory:"belt"},presenter:{name:"Modern Presenter",shirt:"#315f86",pants:"#30343b",hairStyle:"side",hat:"none",accessory:"tie"}};
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
 africaMap:{name:"Africa Map",fill:"#b7cddd",ground:"#d7c79d",tags:["africa","map","geography"],kind:"map"}
};
let uid=0;const id=()=>Date.now().toString(36)+(uid++).toString(36);
function character(name="Historian",x=640,y=405,template="civilian"){
 const preset=CHARACTER_PRESETS[template]||CHARACTER_PRESETS.civilian; return{id:id(),type:"character",name,tags:["character",template],x,y,scale:1,facing:1,rig:{type:"mep-humanoid-v3",body:"adult",bodyStyle:"historyCutout",skin:"#f2c7a5",line:"#242424",shirt:preset.shirt,hair:"#34261e",pants:preset.pants,hairStyle:preset.hairStyle,hat:preset.hat,accessory:preset.accessory,prop:preset.prop||"none",expression:"neutral",state:"standing",era:preset.era||"Custom",headScale:1,limbScale:1},pose:{...DEFAULT_POSE},keyframes:[]};
}
function scene(name="Scene 1"){
 return{id:id(),name,duration:8,background:{preset:"parchment",tags:["history","map"],customFill:null},transition:{type:"cut",duration:.35},camera:{x:640,y:360,zoom:1,keyframes:[]},markers:[],notes:"",tags:["history"],characters:[character()],bubbles:[]};
}
function project(){
 const s=scene();return{schema:"mep-video-project",version:4,id:id(),name:"Untitled History",category:"History",era:"Custom",tags:["history"],sync:{provider:"firebase",status:"unconfigured",revision:0,ownerUid:null,lastSyncedAt:null},assets:[],width:1280,height:720,fps:30,activeSceneId:s.id,scenes:[s],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
function migrate(p){
 if(p?.version>=2&&Array.isArray(p.scenes)){p.version=4;p.sync=p.sync||{provider:"firebase",status:"unconfigured",revision:0,ownerUid:null,lastSyncedAt:null};p.assets=p.assets||[];p.scenes.forEach(s=>{s.bubbles=s.bubbles||[];s.transition=s.transition||{type:"cut",duration:.35};s.camera=s.camera||{x:640,y:360,zoom:1,keyframes:[]};s.markers=s.markers||[];s.notes=s.notes||"";(s.characters||[]).forEach(c=>{c.rig=c.rig||{};c.rig.bodyStyle=c.rig.bodyStyle||"historyCutout"})});return p;}
 if(p?.characters){const s=scene();s.duration=p.duration||8;s.characters=p.characters;s.background={preset:"parchment",tags:["history"],customFill:p.background||null};return{...project(),name:p.name||"Imported Project",category:p.category||"History",fps:p.fps||30,activeSceneId:s.id,scenes:[s]};}
 return project();
}
const lerp=(a,b,t)=>a+(b-a)*t;
function ease(t,type="linear"){if(type==="hold")return 0;if(type==="easeIn")return t*t;if(type==="easeOut")return 1-(1-t)*(1-t);if(type==="easeInOut")return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return t}
function poseAt(c,time){const ks=(c.keyframes||[]).slice().sort((a,b)=>a.time-b.time);if(!ks.length)return{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}};if(time<=ks[0].time)return structuredClone(ks[0].state);if(time>=ks.at(-1).time)return structuredClone(ks.at(-1).state);let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++)if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}const raw=(time-a.time)/(b.time-a.time),q=ease(raw,b.easing||"linear"),o={x:lerp(a.state.x,b.state.x,q),y:lerp(a.state.y,b.state.y,q),scale:lerp(a.state.scale,b.state.scale,q),facing:q<.5?a.state.facing:b.state.facing,pose:{}};Object.keys(DEFAULT_POSE).forEach(k=>o.pose[k]=lerp(a.state.pose[k],b.state.pose[k],q));return o}
const capture=c=>({x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}});
function applyPose(c,name){if(POSES[name])c.pose={...POSES[name]}}
function activeScene(p){return p.scenes.find(s=>s.id===p.activeSceneId)||p.scenes[0]}
return{DEFAULT_POSE,BODY_STYLES,STATES,PROPS,POSES,EASINGS,ANIMATION_CLIPS,BUBBLE_STYLES,HISTORY_ERAS,ERA_CHARACTER_PRESETS,CHARACTER_PRESETS,BACKGROUNDS,id,character,scene,project,migrate,poseAt,capture,applyPose,activeScene};
})();