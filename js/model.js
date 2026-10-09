window.MEPModel=(()=>{
const id=()=>crypto.randomUUID?crypto.randomUUID():"mep-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
const SHAPES={square:"Square",circle:"Circle",triangle:"Triangle"};
const EXPRESSIONS=["neutral","happy","angry","sad","surprised","determined","sleepy"];
const PROPS={none:{name:"None"},spear:{name:"Spear"},bow:{name:"Bow"},sword:{name:"Sword"},rifle:{name:"Rifle"},musket:{name:"Musket"},axe:{name:"Axe"},torch:{name:"Torch"},staff:{name:"Staff"},pointer:{name:"Pointer"}};
const EASINGS={linear:"Linear",easeIn:"Ease In",easeOut:"Ease Out",easeInOut:"Ease In / Out",hold:"Hold"};
const ANIMATION_CLIPS={
 slide:{name:"Slide Across",duration:2,move:190,scale:[1,1],rotation:[0,0]},
 talk:{name:"Narrate / Talk",duration:2.4,move:0,scale:[1,1.04,1,1.04,1],rotation:[0,-2,2,-2,0],mouth:[false,true,false,true,false]},
 bounce:{name:"Bounce",duration:1.8,move:0,y:[0,-34,0,-24,0],scale:[1,1.04,.97,1.03,1]},
 emphasize:{name:"Emphasize",duration:1.4,move:0,scale:[1,1.18,1],rotation:[0,-6,0]},
 charge:{name:"Charge",duration:2,move:220,scale:[1,1.05,1],rotation:[0,-8,0]},
 retreat:{name:"Retreat",duration:2,move:-180,scale:[1,1],rotation:[0,5,0]},
 celebrate:{name:"Celebrate",duration:2,move:0,scale:[1,1.12,1.03,1.12,1],rotation:[0,-8,8,-5,0]}
};
const HISTORY_ERAS=["1600s","1700s","Early 1800s","Mid / Late 1800s","World Wars","Cold War","Modern","Custom"];
const yearToEra=year=>year<1700?"1600s":year<1800?"1700s":year<1850?"Early 1800s":year<1914?"Mid / Late 1800s":year<1946?"World Wars":year<1991?"Cold War":"Modern";
const BACKGROUNDS={
 parchment:{name:"Parchment Map",kind:"map",tags:["history","map"]},
 worldMap:{name:"World Map",kind:"map",tags:["world","map"]},
 americasMap:{name:"Americas Map",kind:"map",tags:["americas","map"]},
 europeMap:{name:"Europe Map",kind:"map",tags:["europe","map"]},
 africaMap:{name:"Africa Map",kind:"map",tags:["africa","map"]},
 asiaMap:{name:"Asia Map",kind:"map",tags:["asia","map"]},
 battleMap:{name:"Military Campaign Map",kind:"map",tags:["war","map","arrows"]},
 countryside:{name:"Countryside",kind:"scene",tags:["field","village"]},
 farmVillage:{name:"Farm Village",kind:"scene",tags:["farm","village"]},
 forest:{name:"Forest",kind:"scene",tags:["forest","nature"]},
 jungle:{name:"Tropical Jungle",kind:"scene",tags:["jungle","tropical"]},
 mountainPass:{name:"Mountain Pass",kind:"scene",tags:["mountain","campaign"]},
 riverCrossing:{name:"River Crossing",kind:"scene",tags:["river","campaign"]},
 village:{name:"Old Village",kind:"scene",tags:["village","town"]},
 oldTownStreet:{name:"Old Town Street",kind:"scene",tags:["town","street","1700s"]},
 castle:{name:"Fortress Courtyard",kind:"scene",tags:["fort","castle"]},
 coastalFort:{name:"Coastal Fort",kind:"scene",tags:["fort","ocean","colonial"]},
 royalCourt:{name:"Royal Court",kind:"scene",tags:["royal","court"]},
 throneRoom:{name:"Throne Room",kind:"scene",tags:["royal","interior"]},
 governmentHall:{name:"Government Hall",kind:"scene",tags:["government","interior"]},
 lectureHall:{name:"Lecture Hall",kind:"scene",tags:["lecture","education"]},
 library:{name:"Library",kind:"scene",tags:["library","education"]},
 mapRoom:{name:"Map / Strategy Room",kind:"scene",tags:["map","war room"]},
 shipDeck:{name:"Sailing Ship Deck",kind:"scene",tags:["ship","ocean","colonial"]},
 colonialPort:{name:"Colonial Port",kind:"scene",tags:["port","colonial","trade"]},
 harbor:{name:"Harbor",kind:"scene",tags:["harbor","trade"]},
 ocean:{name:"Open Ocean",kind:"scene",tags:["ocean","navy"]},
 city:{name:"City",kind:"scene",tags:["city"]},
 cityBattleStreet:{name:"Battle-Damaged Street",kind:"scene",tags:["battle","city","street"]},
 battlefield:{name:"Battlefield",kind:"scene",tags:["war","battle"]},
 battlefieldNight:{name:"Battlefield at Night",kind:"scene",tags:["war","battle","night"]},
 trench:{name:"Trench",kind:"scene",tags:["world war","trench"]},
 militaryCamp:{name:"Military Camp",kind:"scene",tags:["camp","army"]},
 factory:{name:"Factory",kind:"scene",tags:["industrial","factory"]},
 classroom:{name:"Classroom",kind:"scene",tags:["school","lecture"]},
 newspaper:{name:"Newspaper / Headline",kind:"graphic",tags:["headline","newspaper"]},
 desert:{name:"Desert",kind:"scene",tags:["desert","campaign"]},
 snowField:{name:"Snow Field",kind:"scene",tags:["snow","winter","campaign"]}
};
const PRESETS={
 unionSquare:{name:"Union Square",era:"Mid / Late 1800s",shape:"square",countryCode:"US",year:1863,expression:"determined",prop:"rifle"},
 unionCircle:{name:"Union Circle",era:"Mid / Late 1800s",shape:"circle",countryCode:"US",year:1863,expression:"determined",prop:"rifle"},
 unionTriangle:{name:"Union Triangle",era:"Mid / Late 1800s",shape:"triangle",countryCode:"US",year:1863,expression:"determined",prop:"rifle"},
 american1776:{name:"American Revolution",era:"1700s",shape:"square",countryCode:"US",year:1776,expression:"determined",hat:"tricorn",prop:"musket"},
 georgeWashington:{name:"George Washington",era:"1700s",shape:"square",countryCode:"US",year:1777,expression:"determined",hat:"tricorn",hairStyle:"wave",prop:"sword"},
 britishEmpire:{name:"British Empire",era:"1700s",shape:"square",countryCode:"GB",year:1776,expression:"neutral",prop:"musket"},
 spanishEmpire:{name:"Spanish Empire",era:"1600s",shape:"square",countryCode:"ES",year:1650,expression:"neutral",prop:"sword"},
 kingdomFrance:{name:"Kingdom of France",era:"1700s",shape:"square",countryCode:"FR",year:1750,expression:"neutral",hat:"crown"},
 franceRevolution:{name:"Revolutionary France",era:"1700s",shape:"square",countryCode:"FR",year:1795,expression:"determined"},
 dutchRepublic:{name:"Dutch Republic",era:"1600s",shape:"square",countryCode:"NL",year:1640,expression:"neutral"},
 portugalRoyal:{name:"Kingdom of Portugal",era:"1700s",shape:"square",countryCode:"PT",year:1750,expression:"neutral"},
 haitiRevolution:{name:"Haitian Revolutionary",era:"Early 1800s",shape:"square",countryCode:"HT",year:1803,expression:"determined",prop:"sword"},
 capois:{name:"Capois-la-Mort",era:"Early 1800s",shape:"square",countryCode:"HT",year:1803,expression:"determined",prop:"sword",accessory:"sash"},
 dessalines:{name:"Jean-Jacques Dessalines",era:"Early 1800s",shape:"square",countryCode:"HT",year:1803,expression:"determined",hat:"officer",prop:"sword",accessory:"sash"},
 french1803:{name:"French Army 1803",era:"Early 1800s",shape:"square",countryCode:"FR",year:1803,expression:"angry",prop:"musket"},
 empireBrazil:{name:"Empire of Brazil",era:"Early 1800s",shape:"square",countryCode:"BR",year:1825,expression:"neutral"},
 confederateHistorical:{name:"Confederate States (historical)",era:"Mid / Late 1800s",shape:"square",countryCode:"CSA",year:1863,expression:"angry",prop:"rifle"},
 prussia:{name:"Prussia",era:"1700s",shape:"square",countryCode:"PRU",year:1750,expression:"determined",prop:"rifle"},
 habsburg:{name:"Habsburg Monarchy",era:"1700s",shape:"square",countryCode:"AT",year:1750,expression:"neutral"},
 ottoman:{name:"Ottoman Empire",era:"1700s",shape:"square",countryCode:"OTT",year:1750,expression:"neutral",prop:"sword"},
 russianEmpire:{name:"Russian Empire",era:"Mid / Late 1800s",shape:"square",countryCode:"RU",year:1880,expression:"neutral"},
 germanEmpire:{name:"German Empire",era:"Mid / Late 1800s",shape:"square",countryCode:"DE",year:1880,expression:"determined"},
 mexico:{name:"Mexico",era:"Mid / Late 1800s",shape:"square",countryCode:"MX",year:1867,expression:"neutral"},
 granColombia:{name:"Gran Colombia",era:"Early 1800s",shape:"square",countryCode:"GC",year:1825,expression:"neutral"},
 qing:{name:"Qing China",era:"1700s",shape:"square",countryCode:"CN",year:1750,expression:"neutral"},
 japan:{name:"Japan",era:"Mid / Late 1800s",shape:"square",countryCode:"JP",year:1870,expression:"neutral"},
 persia:{name:"Persia",era:"1700s",shape:"square",countryCode:"IR",year:1750,expression:"neutral"},
 india:{name:"India / Subcontinent",era:"Mid / Late 1800s",shape:"square",countryCode:"IN",year:1880,expression:"neutral"},
 modernUS:{name:"Modern United States",era:"Modern",shape:"square",countryCode:"US",year:2026,expression:"neutral"},
 modernGB:{name:"Modern United Kingdom",era:"Modern",shape:"circle",countryCode:"GB",year:2026,expression:"neutral"},
 modernFR:{name:"Modern France",era:"Modern",shape:"triangle",countryCode:"FR",year:2026,expression:"neutral"}
};
const ERA_CHARACTER_PRESETS={
 "1600s":["spanishEmpire","dutchRepublic"],
 "1700s":["american1776","georgeWashington","britishEmpire","kingdomFrance","franceRevolution","prussia","habsburg","ottoman","portugalRoyal","qing","persia"],
 "Early 1800s":["haitiRevolution","capois","dessalines","french1803","empireBrazil","granColombia"],
 "Mid / Late 1800s":["unionSquare","unionCircle","unionTriangle","confederateHistorical","russianEmpire","germanEmpire","mexico","japan","india"],
 "World Wars":["modernUS","modernGB","modernFR"],
 "Cold War":["modernUS","modernGB","modernFR"],
 Modern:["modernUS","modernGB","modernFR"],
 Custom:Object.keys(PRESETS)
};
const BUBBLE_STYLES={speech:{name:"Speech Bubble",fill:"#fff",stroke:"#222",text:"#171717",tail:"speech",radius:22},thought:{name:"Thought Bubble",fill:"#fff",stroke:"#222",text:"#171717",tail:"thought",radius:28},caption:{name:"Caption Box",fill:"#111d",stroke:"#0000",text:"#fff",tail:"none",radius:8},history:{name:"History Parchment",fill:"#f3e4bd",stroke:"#5b4630",text:"#302419",tail:"speech",radius:12},comic:{name:"Comic Burst",fill:"#fff8cf",stroke:"#222",text:"#111",tail:"burst",radius:4},subtitle:{name:"Subtitle",fill:"#000a",stroke:"#0000",text:"#fff",tail:"none",radius:2}};
function guessCountry(raw){
 const txt=((raw?.name||"")+" "+(raw?.tags||[]).join(" ")+" "+(raw?.rig?.era||"")).toLowerCase();
 if(txt.includes("hait"))return"HT";if(txt.includes("french")||txt.includes("france"))return"FR";if(txt.includes("brit")||txt.includes("england"))return"GB";if(txt.includes("span"))return"ES";if(txt.includes("brazil"))return"BR";if(txt.includes("confeder"))return"CSA";if(txt.includes("german"))return"DE";if(txt.includes("russian"))return"RU";if(txt.includes("mexic"))return"MX";if(txt.includes("china")||txt.includes("qing"))return"CN";if(txt.includes("japan"))return"JP";if(txt.includes("india"))return"IN";return"US"
}
function character(name="Union Square",x=640,y=430,preset="unionSquare"){
 const p=PRESETS[preset]||PRESETS.unionSquare;return{id:id(),type:"character",name:name||p.name,tags:["character",preset],x,y,scale:1,rotation:0,facing:1,layer:5,
  visual:{shape:p.shape||"square",countryCode:p.countryCode||"US",historicalYear:p.year||1863,followProjectYear:true,flagVariant:"auto",expression:p.expression||"neutral",stroke:"#17191d",eyeColor:"#111",mouthEnabled:true,mouthOpen:false,hairStyle:p.hairStyle||"none",hat:p.hat||"none",accessory:p.accessory||"none"},
  prop:p.prop||"none",keyframes:[],clips:[]}
}
function scene(name="Scene 1"){return{id:id(),name,duration:8,background:{preset:"countryside",mode:"preset",assetId:null,fit:"cover",opacity:1,panX:0,panY:0,scale:1,brightness:1,blur:0,keyframes:[],tags:["history"]},transition:{type:"cut",duration:.35},camera:{x:640,y:360,zoom:1,keyframes:[]},markers:[],notes:"",script:"",caption:"",tags:["history"],characters:[character()],bubbles:[]}}
function project(){const s=scene("Opening Scene");return{schema:"mep-video-project",version:6,id:id(),name:"MEP History Video",category:"History",era:"Mid / Late 1800s",year:1863,tags:["history"],width:1280,height:720,fps:30,activeSceneId:s.id,scenes:[s],assets:[],scripts:{project:"",sceneById:{}},sync:{provider:"firestore",status:"local",revision:0,lastSyncedAt:null},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
function capture(c){return{x:c.x,y:c.y,scale:c.scale,rotation:c.rotation||0,facing:c.facing,mouthOpen:!!c.visual?.mouthOpen}}
const lerp=(a,b,t)=>a+(b-a)*t;function ease(t,type="linear"){if(type==="hold")return 0;if(type==="easeIn")return t*t;if(type==="easeOut")return 1-(1-t)*(1-t);if(type==="easeInOut")return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return t}
function stateAt(c,time){
 const ks=(c.keyframes||[]).slice().sort((a,b)=>a.time-b.time);if(!ks.length)return capture(c);if(time<=ks[0].time)return structuredClone(ks[0].state);if(time>=ks.at(-1).time)return structuredClone(ks.at(-1).state);
 let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++)if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}
 const q=ease((time-a.time)/(b.time-a.time),b.easing||"linear");return{x:lerp(a.state.x,b.state.x,q),y:lerp(a.state.y,b.state.y,q),scale:lerp(a.state.scale,b.state.scale,q),rotation:lerp(a.state.rotation||0,b.state.rotation||0,q),facing:q<.5?(a.state.facing||1):(b.state.facing||1),mouthOpen:q<.5?!!a.state.mouthOpen:!!b.state.mouthOpen}
}
function normalizeCharacter(raw,index=0,projectYear=1863){
 const presetKey=raw?.tags?.[1]&&PRESETS[raw.tags[1]]?raw.tags[1]:"unionSquare",base=character(raw?.name||("Character "+(index+1)),Number.isFinite(raw?.x)?raw.x:460+index*150,Number.isFinite(raw?.y)?raw.y:430,presetKey),oldVisual=raw?.visual||{},oldLook=oldVisual.lookType;
 const c={...base,id:raw?.id||base.id,name:raw?.name||base.name,tags:Array.isArray(raw?.tags)?raw.tags:base.tags,x:Number.isFinite(raw?.x)?raw.x:base.x,y:Number.isFinite(raw?.y)?raw.y:base.y,scale:Number.isFinite(raw?.scale)?raw.scale:1,rotation:Number.isFinite(raw?.rotation)?raw.rotation:0,facing:raw?.facing===-1?-1:1,layer:Number.isFinite(raw?.layer)?raw.layer:5};
 c.visual={...base.visual,...oldVisual};delete c.visual.lookType;c.visual.shape=["square","circle","triangle"].includes(oldVisual.shape)?oldVisual.shape:(["square","circle","triangle"].includes(oldLook)?oldLook:"square");c.visual.countryCode=oldVisual.countryCode||guessCountry(raw);c.visual.historicalYear=Number.isFinite(oldVisual.historicalYear)?oldVisual.historicalYear:projectYear;c.visual.followProjectYear=oldVisual.followProjectYear!==false;c.visual.expression=EXPRESSIONS.includes(oldVisual.expression)?oldVisual.expression:(EXPRESSIONS.includes(raw?.rig?.expression)?raw.rig.expression:"neutral");c.visual.mouthEnabled=oldVisual.mouthEnabled!==false;c.visual.mouthOpen=!!oldVisual.mouthOpen;c.visual.hat=oldVisual.hat||raw?.rig?.hat||"none";c.visual.hairStyle=oldVisual.hairStyle||raw?.rig?.hairStyle||"none";c.visual.accessory=oldVisual.accessory||raw?.rig?.accessory||"none";c.prop=raw?.prop||raw?.rig?.prop||base.prop||"none";
 c.keyframes=Array.isArray(raw?.keyframes)?raw.keyframes.filter(k=>Number.isFinite(k?.time)&&k?.state).map(k=>({id:k.id||id(),time:k.time,easing:EASINGS[k.easing]?k.easing:"linear",label:k.label||"",state:{x:Number.isFinite(k.state.x)?k.state.x:c.x,y:Number.isFinite(k.state.y)?k.state.y:c.y,scale:Number.isFinite(k.state.scale)?k.state.scale:c.scale,rotation:Number.isFinite(k.state.rotation)?k.state.rotation:0,facing:k.state.facing===-1?-1:1,mouthOpen:!!k.state.mouthOpen}})):[];c.clips=Array.isArray(raw?.clips)?raw.clips:[];return c
}
function normalizeScene(raw,index=0,projectYear=1863){
 const base=scene("Scene "+(index+1)),s={...base,...(raw||{})};s.id=s.id||id();s.duration=Number.isFinite(s.duration)&&s.duration>0?Math.min(300,s.duration):8;s.background={...base.background,...(raw?.background||{})};if(!BACKGROUNDS[s.background.preset])s.background.preset="countryside";s.background.keyframes=Array.isArray(s.background.keyframes)?s.background.keyframes:[];s.transition={...base.transition,...(raw?.transition||{})};s.camera={...base.camera,...(raw?.camera||{})};s.characters=Array.isArray(raw?.characters)?raw.characters.map((c,i)=>normalizeCharacter(c,i,projectYear)):base.characters;s.bubbles=Array.isArray(raw?.bubbles)?raw.bubbles:[];s.markers=Array.isArray(raw?.markers)?raw.markers:[];s.tags=Array.isArray(raw?.tags)?raw.tags:[];return s
}
function migrate(raw){
 if(!raw)return project();if(raw.schema!=="mep-video-project"&&!Array.isArray(raw.scenes))return project();const year=Number.isFinite(raw.year)?raw.year:1863,p={...project(),...raw};p.schema="mep-video-project";p.version=6;p.year=year;p.era=raw.era&&HISTORY_ERAS.includes(raw.era)?raw.era:yearToEra(year);p.assets=Array.isArray(raw.assets)?raw.assets:[];p.scripts={project:raw.scripts?.project||"",sceneById:raw.scripts?.sceneById||{}};p.sync={provider:"firestore",status:"local",revision:raw.sync?.revision||0,lastSyncedAt:raw.sync?.lastSyncedAt||null};p.scenes=(raw.scenes||[]).map((s,i)=>normalizeScene(s,i,year));if(!p.scenes.length)p.scenes=[scene()];if(!p.scenes.some(s=>s.id===p.activeSceneId))p.activeSceneId=p.scenes[0].id;delete p.customPoses;return p
}
function activeScene(p){return p.scenes.find(s=>s.id===p.activeSceneId)||p.scenes[0]}
function backgroundAt(s,time){
 const b=s.background||{},keys=(b.keyframes||[]).slice().sort((a,b)=>a.time-b.time);let state={preset:b.preset||"countryside",mode:b.mode||"preset",assetId:b.assetId||null,fit:b.fit||"cover",opacity:Number.isFinite(b.opacity)?b.opacity:1,panX:Number(b.panX)||0,panY:Number(b.panY)||0,scale:Number(b.scale)||1,brightness:Number.isFinite(b.brightness)?b.brightness:1,blur:Number(b.blur)||0};keys.forEach(k=>{if(time>=k.time)state={...state,...k}});return state
}
function librarySnapshot(){return{schema:"mep-library-v3",version:3,eras:HISTORY_ERAS,shapes:SHAPES,expressions:EXPRESSIONS,characterPresets:structuredClone(PRESETS),eraCharacterPresets:structuredClone(ERA_CHARACTER_PRESETS),backgrounds:structuredClone(BACKGROUNDS),props:structuredClone(PROPS),animationClips:structuredClone(ANIMATION_CLIPS),bubbleStyles:structuredClone(BUBBLE_STYLES),historicalFlags:window.MEPHistoryFlags?structuredClone(window.MEPHistoryFlags.HISTORICAL):{},updatedAt:new Date().toISOString()}}
function validateProject(p){const errors=[],warnings=[];if(p?.schema!=="mep-video-project")errors.push("Invalid project schema");if(!Array.isArray(p?.scenes)||!p.scenes.length)errors.push("Project needs at least one scene");(p?.scenes||[]).forEach((s,i)=>{if(!(s.duration>0))errors.push("Scene "+(i+1)+" has invalid duration");if(!BACKGROUNDS[s.background?.preset]&&s.background?.mode!=="image")warnings.push("Scene "+(i+1)+" has an unknown background preset");(s.characters||[]).forEach((c,j)=>{if(!c.id)errors.push("Scene "+(i+1)+" character "+(j+1)+" has no id");if(!SHAPES[c.visual?.shape])errors.push("Scene "+(i+1)+" character "+(j+1)+" has invalid shape");(c.keyframes||[]).forEach(k=>{if(k.time<0||k.time>s.duration)errors.push("Keyframe outside scene duration")})})});return{ok:!errors.length,errors,warnings}}
return{SHAPES,EXPRESSIONS,PROPS,EASINGS,ANIMATION_CLIPS,HISTORY_ERAS,BACKGROUNDS,CHARACTER_PRESETS:PRESETS,ERA_CHARACTER_PRESETS,BUBBLE_STYLES,id,character,scene,project,capture,stateAt,poseAt:stateAt,migrate,activeScene,backgroundAt,librarySnapshot,validateProject,yearToEra};
})();