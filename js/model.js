window.MEPModel=(()=>{
const id=()=>crypto.randomUUID?crypto.randomUUID():"mep-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
const SHAPES={square:"Square",circle:"Circle",triangle:"Triangle"};
const EXPRESSIONS=["neutral","happy","angry","sad","surprised","determined","sleepy"];
const PROPS={none:{name:"None"},sword:{name:"Sword"},rifle:{name:"Rifle"},musket:{name:"Musket"},pointer:{name:"Pointer"}};
const EASINGS={linear:"Linear",easeIn:"Ease In",easeOut:"Ease Out",easeInOut:"Ease In / Out",hold:"Hold"};
const GRAPHIC_TYPES={label:"Label",arrow:"Arrow",front:"Front Line",route:"Movement Route",plane:"Plane Route",zone:"Highlighted Zone",impact:"Impact Marker"};
const ANIMATION_CLIPS={
 slide:{name:"Slide Across",duration:2,move:160,scale:[1,1],rotation:[0,0]},
 talk:{name:"Narrate / Talk",duration:2.4,move:0,scale:[1,1.04,1,1.04,1],rotation:[0,-2,2,-2,0],mouth:[false,true,false,true,false]},
 bounce:{name:"Bounce",duration:1.8,move:0,y:[0,-28,0,-18,0],scale:[1,1.04,.98,1.03,1]},
 emphasize:{name:"Emphasize",duration:1.4,move:0,scale:[1,1.18,1],rotation:[0,-6,0]},
 charge:{name:"Advance",duration:2,move:170,scale:[1,1.05,1],rotation:[0,-5,0]},
 retreat:{name:"Retreat",duration:2,move:-150,scale:[1,1],rotation:[0,5,0]}
};
const HISTORY_ERAS=["1600s","1700s","Early 1800s","Mid / Late 1800s","World Wars","Cold War","Modern","Custom"];
const yearToEra=year=>year<1700?"1600s":year<1800?"1700s":year<1850?"Early 1800s":year<1914?"Mid / Late 1800s":year<1946?"World Wars":year<1991?"Cold War":"Modern";
const BACKGROUNDS={
 parchment:{name:"Historical Parchment Map · Auto",kind:"map"},worldMap:{name:"Historical World Map · Auto Borders",kind:"map"},americasMap:{name:"Historical Americas · Auto Borders",kind:"map"},europeMap:{name:"Historical Europe · Auto Borders",kind:"map"},africaMap:{name:"Historical Africa · Auto Borders",kind:"map"},asiaMap:{name:"Historical Asia · Auto Borders",kind:"map"},
 westernFrontMap:{name:"WWI Western Front · Historical 1914/1920",kind:"map"},easternFrontMap:{name:"WWI Eastern Front · Historical 1914/1920",kind:"map"},pearlHarborMap:{name:"Pearl Harbor / Pacific · Historical 1938/1945",kind:"map"},normandyMap:{name:"Normandy · Historical 1938/1945",kind:"map"},coldWarMap:{name:"Cold War Europe · Historical 1960/1994",kind:"map"},revolutionMap:{name:"American Revolution · Historical 1783",kind:"map"},napoleonicMap:{name:"Napoleonic Europe · Historical 1815",kind:"map"},
 battleMap:{name:"Military Campaign Map",kind:"map"},countryside:{name:"Countryside",kind:"scene"},farmVillage:{name:"Farm Village",kind:"scene"},forest:{name:"Forest",kind:"scene"},mountainPass:{name:"Mountain Pass",kind:"scene"},riverCrossing:{name:"River Crossing",kind:"scene"},oldTownStreet:{name:"Old Town Street",kind:"scene"},coastalFort:{name:"Coastal Fort",kind:"scene"},royalCourt:{name:"Royal Court",kind:"scene"},governmentHall:{name:"Government Hall",kind:"scene"},lectureHall:{name:"Lecture Hall",kind:"scene"},library:{name:"Library",kind:"scene"},mapRoom:{name:"Map / Strategy Room",kind:"scene"},shipDeck:{name:"Sailing Ship Deck",kind:"scene"},colonialPort:{name:"Colonial Port",kind:"scene"},ocean:{name:"Open Ocean",kind:"scene"},city:{name:"City",kind:"scene"},cityBattleStreet:{name:"Battle-Damaged Street",kind:"scene"},battlefield:{name:"Battlefield",kind:"scene"},battlefieldNight:{name:"Battlefield at Night",kind:"scene"},trench:{name:"Trench",kind:"scene"},militaryCamp:{name:"Military Camp",kind:"scene"},factory:{name:"Factory",kind:"scene"},classroom:{name:"Classroom",kind:"scene"},newspaper:{name:"Newspaper / Headline",kind:"graphic"},desert:{name:"Desert",kind:"scene"},snowField:{name:"Snow Field",kind:"scene"}
};
const PRESETS={
 noveriaHost:{name:"Noveria Host",era:"Modern",shape:"circle",countryCode:"US",year:2026,followProjectYear:false,expression:"neutral",prop:"pointer",hairStyle:"side"},
 unionSquare:{name:"Union",era:"Mid / Late 1800s",shape:"square",countryCode:"US",year:1863,expression:"determined",prop:"rifle"},
 american1776:{name:"American Colonies",era:"1700s",shape:"square",countryCode:"US",year:1776,expression:"determined",hat:"tricorn",prop:"musket"},
 georgeWashington:{name:"George Washington",era:"1700s",shape:"circle",countryCode:"US",year:1777,expression:"determined",hat:"tricorn",prop:"sword"},
 britishEmpire:{name:"British Empire",era:"1700s",shape:"square",countryCode:"GB",year:1776,expression:"neutral",prop:"musket"},
 kingdomFrance:{name:"Kingdom of France",era:"1700s",shape:"square",countryCode:"FR",year:1750,expression:"neutral"},
 franceRevolution:{name:"Revolutionary France",era:"1700s",shape:"square",countryCode:"FR",year:1793,expression:"determined"},
 napoleonicFrance:{name:"Napoleonic France",era:"Early 1800s",shape:"square",countryCode:"FR",year:1815,expression:"determined",prop:"sword"},
 prussia:{name:"Prussia",era:"1700s",shape:"square",countryCode:"PRU",year:1750,expression:"determined",prop:"rifle"},
 british1815:{name:"Britain 1815",era:"Early 1800s",shape:"square",countryCode:"GB",year:1815,expression:"determined",prop:"rifle"},
 confederateHistorical:{name:"Confederate States (historical)",era:"Mid / Late 1800s",shape:"square",countryCode:"CSA",year:1863,expression:"angry",prop:"rifle"},
 germanEmpire:{name:"German Empire",era:"World Wars",shape:"square",countryCode:"DE",year:1914,expression:"determined",prop:"rifle"},
 austriaHungary:{name:"Austria-Hungary",era:"World Wars",shape:"square",countryCode:"AT",year:1914,expression:"determined",prop:"rifle"},
 russianEmpire:{name:"Russian Empire",era:"World Wars",shape:"square",countryCode:"RU",year:1914,expression:"determined",prop:"rifle"},
 france1914:{name:"France 1914",era:"World Wars",shape:"square",countryCode:"FR",year:1914,expression:"determined",prop:"rifle"},
 britain1914:{name:"Britain 1914",era:"World Wars",shape:"square",countryCode:"GB",year:1914,expression:"determined",prop:"rifle"},
 usa1941:{name:"United States 1941",era:"World Wars",shape:"square",countryCode:"US",year:1941,expression:"surprised"},
 japan1941:{name:"Japan 1941",era:"World Wars",shape:"square",countryCode:"JP",year:1941,expression:"determined"},
 usa1944:{name:"United States 1944",era:"World Wars",shape:"square",countryCode:"US",year:1944,expression:"determined"},
 britain1944:{name:"Britain 1944",era:"World Wars",shape:"square",countryCode:"GB",year:1944,expression:"determined"},
 canada1944:{name:"Canada 1944",era:"World Wars",shape:"square",countryCode:"CA",year:1944,expression:"determined"},
 germany1944:{name:"Germany 1944",era:"World Wars",shape:"square",countryCode:"DE",year:1944,expression:"angry"},
 soviet1945:{name:"Soviet Union",era:"World Wars",shape:"square",countryCode:"RU",year:1945,expression:"determined"},
 usa1962:{name:"United States 1962",era:"Cold War",shape:"square",countryCode:"US",year:1962,expression:"determined"},
 ussr1962:{name:"Soviet Union 1962",era:"Cold War",shape:"square",countryCode:"RU",year:1962,expression:"determined"},
 cuba1962:{name:"Cuba 1962",era:"Cold War",shape:"square",countryCode:"CU",year:1962,expression:"determined"},
 eastGermany:{name:"East Germany",era:"Cold War",shape:"square",countryCode:"DE",year:1961,expression:"neutral"},
 westGermany:{name:"West Germany",era:"Cold War",shape:"circle",countryCode:"DE",year:1989,expression:"happy"},
 modernUS:{name:"Modern United States",era:"Modern",shape:"square",countryCode:"US",year:2026,expression:"neutral"},
 modernGB:{name:"Modern United Kingdom",era:"Modern",shape:"circle",countryCode:"GB",year:2026,expression:"neutral"},
 modernFR:{name:"Modern France",era:"Modern",shape:"triangle",countryCode:"FR",year:2026,expression:"neutral"}
};
const ERA_CHARACTER_PRESETS={
 "1600s":["britishEmpire","kingdomFrance"],"1700s":["american1776","georgeWashington","britishEmpire","kingdomFrance","franceRevolution","prussia"],"Early 1800s":["napoleonicFrance","british1815","prussia"],"Mid / Late 1800s":["unionSquare","confederateHistorical"],"World Wars":["germanEmpire","austriaHungary","russianEmpire","france1914","britain1914","usa1941","japan1941","usa1944","britain1944","canada1944","germany1944","soviet1945"],"Cold War":["usa1962","ussr1962","cuba1962","eastGermany","westGermany"],Modern:["noveriaHost","modernUS","modernGB","modernFR"],Custom:Object.keys(PRESETS)
};
const BUBBLE_STYLES={speech:{name:"Speech Bubble",fill:"#fff",stroke:"#222",text:"#171717",tail:"speech",radius:22},thought:{name:"Thought Bubble",fill:"#fff",stroke:"#222",text:"#171717",tail:"thought",radius:28},caption:{name:"Caption Box",fill:"#111d",stroke:"#0000",text:"#fff",tail:"none",radius:8},history:{name:"History Parchment",fill:"#f3e4bd",stroke:"#5b4630",text:"#302419",tail:"speech",radius:12},subtitle:{name:"Subtitle",fill:"#000a",stroke:"#0000",text:"#fff",tail:"none",radius:2}};
function character(name="Noveria Host",x=360,y=930,preset="noveriaHost"){
 const p=PRESETS[preset]||PRESETS.noveriaHost;return{id:id(),type:"character",name:name||p.name,tags:["character",preset],x,y,scale:1,rotation:0,facing:1,layer:5,visual:{shape:p.shape||"square",countryCode:p.countryCode||"US",historicalYear:p.year||2026,followProjectYear:p.followProjectYear!==false,flagVariant:"auto",expression:p.expression||"neutral",stroke:"#17191d",eyeColor:"#111",mouthEnabled:true,mouthOpen:false,hairStyle:p.hairStyle||"none",hat:p.hat||"none",accessory:p.accessory||"none"},prop:p.prop||"none",keyframes:[],clips:[]}
}
function scene(name="Scene 1",duration=7){return{id:id(),name,duration,background:{preset:"europeMap",mode:"preset",assetId:null,fit:"cover",opacity:1,panX:0,panY:0,scale:1,brightness:1,blur:0,keyframes:[],tags:["history"]},transition:{type:"cut",duration:.3},camera:{x:360,y:640,zoom:1,keyframes:[]},markers:[],notes:"",script:"",caption:"",tags:["history"],characters:[],bubbles:[],graphics:[]}}
function short(title="Untitled Short"){
 const s=scene("Opening",7);return{id:id(),title,description:"",hashtags:["#History","#Shorts","#NoveriaHistory"],year:1944,era:"World Wars",width:720,height:1280,fps:30,activeSceneId:s.id,scenes:[s],voice:{source:"mic",assetId:null,chromeVoice:"",ttsRate:.92,ttsPitch:.96,pitchSemitones:0,speed:1,bass:0,mid:0,treble:0,presence:2,compression:.35,echo:0,grit:0,gain:1},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
}
function syncAlias(p){const sh=activeShort(p);if(sh){p.scenes=sh.scenes;p.activeSceneId=sh.activeSceneId;p.year=sh.year;p.era=sh.era;p.width=sh.width;p.height=sh.height;p.fps=sh.fps}return p}
function project(name="Untitled Project"){
 const sh=short("Untitled Short");return syncAlias({schema:"mep-video-project",version:7,id:id(),name,category:"YouTube Shorts",tags:["history","shorts"],activeShortId:sh.id,shorts:[sh],scenes:sh.scenes,activeSceneId:sh.activeSceneId,year:sh.year,era:sh.era,width:sh.width,height:sh.height,fps:sh.fps,assets:[],scripts:{project:"",sceneById:{}},sync:{provider:"firestore",status:"local",revision:0,lastSyncedAt:null},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})
}
function capture(c){return{x:c.x,y:c.y,scale:c.scale,rotation:c.rotation||0,facing:c.facing,mouthOpen:!!c.visual?.mouthOpen}}
const lerp=(a,b,t)=>a+(b-a)*t;function ease(t,type="linear"){if(type==="hold")return 0;if(type==="easeIn")return t*t;if(type==="easeOut")return 1-(1-t)*(1-t);if(type==="easeInOut")return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;return t}
function stateAt(c,time){
 const ks=(c.keyframes||[]).slice().sort((a,b)=>a.time-b.time);if(!ks.length)return capture(c);if(time<=ks[0].time)return structuredClone(ks[0].state);if(time>=ks.at(-1).time)return structuredClone(ks.at(-1).state);let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++)if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}const q=ease((time-a.time)/(b.time-a.time),b.easing||"linear");return{x:lerp(a.state.x,b.state.x,q),y:lerp(a.state.y,b.state.y,q),scale:lerp(a.state.scale,b.state.scale,q),rotation:lerp(a.state.rotation||0,b.state.rotation||0,q),facing:q<.5?(a.state.facing||1):(b.state.facing||1),mouthOpen:q<.5?!!a.state.mouthOpen:!!b.state.mouthOpen}
}
function normalizeCharacter(raw,index=0,year=1944){
 const preset=raw?.tags?.[1]&&PRESETS[raw.tags[1]]?raw.tags[1]:"modernUS",base=character(raw?.name||("Character "+(index+1)),Number.isFinite(raw?.x)?raw.x:260+index*150,Number.isFinite(raw?.y)?raw.y:820,preset),c={...base,...(raw||{})};c.visual={...base.visual,...(raw?.visual||{})};delete c.visual.lookType;c.visual.shape=SHAPES[c.visual.shape]?c.visual.shape:"square";c.visual.historicalYear=Number.isFinite(c.visual.historicalYear)?c.visual.historicalYear:year;c.prop=raw?.prop||raw?.rig?.prop||base.prop;c.keyframes=Array.isArray(raw?.keyframes)?raw.keyframes.filter(k=>Number.isFinite(k?.time)&&k?.state).map(k=>({id:k.id||id(),time:k.time,easing:EASINGS[k.easing]?k.easing:"linear",state:{x:Number.isFinite(k.state.x)?k.state.x:c.x,y:Number.isFinite(k.state.y)?k.state.y:c.y,scale:Number.isFinite(k.state.scale)?k.state.scale:c.scale,rotation:Number.isFinite(k.state.rotation)?k.state.rotation:0,facing:k.state.facing===-1?-1:1,mouthOpen:!!k.state.mouthOpen}})):[];delete c.rig;delete c.pose;return c
}
function normalizeGraphic(g){return{id:g?.id||id(),type:GRAPHIC_TYPES[g?.type]?g.type:"label",label:g?.label||"",startTime:Number.isFinite(g?.startTime)?g.startTime:0,endTime:Number.isFinite(g?.endTime)?g.endTime:999,x:Number(g?.x)||360,y:Number(g?.y)||500,x2:Number(g?.x2)||520,y2:Number(g?.y2)||360,points:Array.isArray(g?.points)?g.points:[],color:g?.color||"#d54444",fill:g?.fill||"#d5444433",width:Number(g?.width)||8,size:Number(g?.size)||42,countryCode:g?.countryCode||"US",progressStart:Number.isFinite(g?.progressStart)?g.progressStart:0,progressEnd:Number.isFinite(g?.progressEnd)?g.progressEnd:1}}
function normalizeScene(raw,index=0,year=1944){
 const base=scene("Scene "+(index+1)),s={...base,...(raw||{})};s.id=s.id||id();s.duration=Number.isFinite(s.duration)&&s.duration>0?Math.min(60,s.duration):7;s.background={...base.background,...(raw?.background||{})};if(!BACKGROUNDS[s.background.preset])s.background.preset="europeMap";s.background.keyframes=Array.isArray(s.background.keyframes)?s.background.keyframes:[];s.transition={...base.transition,...(raw?.transition||{})};s.camera={...base.camera,...(raw?.camera||{})};s.characters=Array.isArray(raw?.characters)?raw.characters.map((c,i)=>normalizeCharacter(c,i,year)):[];s.bubbles=Array.isArray(raw?.bubbles)?raw.bubbles:[];s.markers=Array.isArray(raw?.markers)?raw.markers:[];s.graphics=Array.isArray(raw?.graphics)?raw.graphics.map(normalizeGraphic):[];return s
}
function normalizeShort(raw,index=0){
 const b=short(raw?.title||("Short "+(index+1))),sh={...b,...(raw||{})};sh.id=sh.id||id();sh.year=Number.isFinite(raw?.year)?raw.year:1944;sh.era=raw?.era||yearToEra(sh.year);sh.width=720;sh.height=1280;sh.fps=[24,30,60].includes(Number(raw?.fps))?Number(raw.fps):30;sh.description=raw?.description||"";sh.hashtags=Array.isArray(raw?.hashtags)?raw.hashtags:["#History","#Shorts","#NoveriaHistory"];sh.voice={...b.voice,...(raw?.voice||{})};sh.scenes=(raw?.scenes||[]).map((s,i)=>normalizeScene(s,i,sh.year));if(!sh.scenes.length)sh.scenes=[scene()];if(!sh.scenes.some(s=>s.id===sh.activeSceneId))sh.activeSceneId=sh.scenes[0].id;return sh
}
function migrate(raw){
 if(!raw)return project();if(raw.schema!=="mep-video-project"&&!Array.isArray(raw.scenes))return project();const p={...project(raw.name||"Untitled Project"),...raw};p.schema="mep-video-project";p.version=7;p.assets=Array.isArray(raw.assets)?raw.assets:[];p.scripts={project:raw.scripts?.project||"",sceneById:raw.scripts?.sceneById||{}};p.sync={provider:"firestore",status:"local",revision:raw.sync?.revision||0,lastSyncedAt:raw.sync?.lastSyncedAt||null};
 if(Array.isArray(raw.shorts)&&raw.shorts.length)p.shorts=raw.shorts.map(normalizeShort);else{const sh=normalizeShort({title:raw.name||"Imported Short",description:"",year:Number.isFinite(raw.year)?raw.year:1944,era:raw.era,scenes:Array.isArray(raw.scenes)?raw.scenes:[],activeSceneId:raw.activeSceneId});p.shorts=[sh];p.activeShortId=sh.id}
 if(!p.shorts.some(s=>s.id===p.activeShortId))p.activeShortId=p.shorts[0].id;delete p.customPoses;return syncAlias(p)
}
function activeShort(p){return p.shorts?.find(s=>s.id===p.activeShortId)||p.shorts?.[0]||null}
function setActiveShort(p,shortId){const sh=p.shorts.find(s=>s.id===shortId)||p.shorts[0];p.activeShortId=sh.id;return syncAlias(p)}
function activeScene(p){const sh=activeShort(p);return sh?.scenes.find(s=>s.id===sh.activeSceneId)||sh?.scenes[0]||null}
function setActiveScene(p,sceneId){const sh=activeShort(p);if(sh?.scenes.some(s=>s.id===sceneId))sh.activeSceneId=sceneId;return syncAlias(p)}
function backgroundAt(s,time){const b=s.background||{},keys=(b.keyframes||[]).slice().sort((a,b)=>a.time-b.time);let state={preset:b.preset||"europeMap",mode:b.mode||"preset",assetId:b.assetId||null,fit:b.fit||"cover",opacity:Number.isFinite(b.opacity)?b.opacity:1,panX:Number(b.panX)||0,panY:Number(b.panY)||0,scale:Number(b.scale)||1,brightness:Number.isFinite(b.brightness)?b.brightness:1,blur:Number(b.blur)||0};keys.forEach(k=>{if(time>=k.time)state={...state,...k}});return state}
function shortDuration(sh){return(sh?.scenes||[]).reduce((n,s)=>n+(Number(s.duration)||0),0)}
function librarySnapshot(){return{schema:"mep-library-v4",version:4,eras:HISTORY_ERAS,shapes:SHAPES,expressions:EXPRESSIONS,characterPresets:structuredClone(PRESETS),eraCharacterPresets:structuredClone(ERA_CHARACTER_PRESETS),backgrounds:structuredClone(BACKGROUNDS),props:structuredClone(PROPS),animationClips:structuredClone(ANIMATION_CLIPS),graphicTypes:structuredClone(GRAPHIC_TYPES),bubbleStyles:structuredClone(BUBBLE_STYLES),historicalFlags:window.MEPHistoryFlags?structuredClone(window.MEPHistoryFlags.HISTORICAL):{},updatedAt:new Date().toISOString()}}
function validateProject(p){const errors=[],warnings=[];if(p?.schema!=="mep-video-project")errors.push("Invalid project schema");if(!Array.isArray(p?.shorts)||!p.shorts.length)errors.push("Project needs at least one short");(p?.shorts||[]).forEach((sh,si)=>{const d=shortDuration(sh);if(d<1)errors.push("Short "+(si+1)+" has no duration");if(d>60)warnings.push("Short "+(si+1)+" is longer than 60 seconds");(sh.scenes||[]).forEach((s,i)=>{if(!(s.duration>0))errors.push("Short "+(si+1)+" scene "+(i+1)+" has invalid duration");(s.characters||[]).forEach((c,j)=>{if(!SHAPES[c.visual?.shape])errors.push("Invalid character shape at short "+(si+1)+" scene "+(i+1))})})});return{ok:!errors.length,errors,warnings}}
return{SHAPES,EXPRESSIONS,PROPS,EASINGS,GRAPHIC_TYPES,ANIMATION_CLIPS,HISTORY_ERAS,BACKGROUNDS,CHARACTER_PRESETS:PRESETS,ERA_CHARACTER_PRESETS,BUBBLE_STYLES,id,character,scene,short,project,capture,stateAt,poseAt:stateAt,migrate,activeShort,setActiveShort,activeScene,setActiveScene,syncAlias,backgroundAt,shortDuration,librarySnapshot,validateProject,yearToEra};
})();