window.MEPModel=(()=>{
const DEFAULT_POSE={head:0,torso:0,leftUpperArm:-25,leftLowerArm:-10,rightUpperArm:25,rightLowerArm:10,leftUpperLeg:-8,leftLowerLeg:5,rightUpperLeg:8,rightLowerLeg:5};
const POSES={
 idle:{...DEFAULT_POSE},
 attention:{...DEFAULT_POSE,leftUpperArm:-8,rightUpperArm:8,leftUpperLeg:0,rightUpperLeg:0},
 point:{...DEFAULT_POSE,rightUpperArm:82,rightLowerArm:5,leftUpperArm:-18},
 talk:{...DEFAULT_POSE,leftUpperArm:-65,leftLowerArm:-35,rightUpperArm:55,rightLowerArm:35},
 victory:{...DEFAULT_POSE,leftUpperArm:-145,leftLowerArm:0,rightUpperArm:145,rightLowerArm:0},
 marchA:{...DEFAULT_POSE,leftUpperArm:-55,rightUpperArm:55,leftUpperLeg:24,rightUpperLeg:-24,leftLowerLeg:20,rightLowerLeg:-10},
 marchB:{...DEFAULT_POSE,leftUpperArm:55,rightUpperArm:-55,leftUpperLeg:-24,rightUpperLeg:24,leftLowerLeg:-10,rightLowerLeg:20}
};
const HISTORY_ERAS=["Ancient","Medieval","Early Modern","Industrial","World Wars","Cold War","Modern","Custom"];
const BACKGROUNDS={
 parchment:{name:"Parchment / Map",fill:"#eee2c5",ground:"#c7b58d",tags:["map","parchment","history"]},
 battlefield:{name:"Battlefield",fill:"#c9d1bd",ground:"#72755f",tags:["war","field","battle"]},
 palace:{name:"Palace Hall",fill:"#eadfcf",ground:"#9b795d",tags:["royal","palace","politics"]},
 city:{name:"City",fill:"#d9e0e5",ground:"#858b90",tags:["city","modern","street"]},
 countryside:{name:"Countryside",fill:"#d9e7d0",ground:"#769064",tags:["farm","country","village"]},
 archive:{name:"Archive / Document",fill:"#f0eadc",ground:"#b9ad96",tags:["document","archive","biography"]}
};
let uid=0;const id=()=>Date.now().toString(36)+(uid++).toString(36);
function character(name="Historian",x=640,y=405,template="civilian"){
 return{id:id(),type:"character",name,tags:["character",template],x,y,scale:1,facing:1,rig:{type:"mep-humanoid-v1",body:"adult",skin:"#f2c7a5",line:"#242424",shirt:"#58667a",hair:"#34261e",headScale:1,limbScale:1},pose:{...DEFAULT_POSE},keyframes:[]};
}
function scene(name="Scene 1"){
 return{id:id(),name,duration:8,background:{preset:"parchment",tags:["history","map"],customFill:null},tags:["history"],characters:[character()]};
}
function project(){
 const s=scene();return{schema:"mep-video-project",version:2,id:id(),name:"Untitled History",category:"History",era:"Custom",tags:["history"],width:1280,height:720,fps:30,activeSceneId:s.id,scenes:[s],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
function migrate(p){
 if(p?.version>=2&&Array.isArray(p.scenes))return p;
 if(p?.characters){const s=scene();s.duration=p.duration||8;s.characters=p.characters;s.background={preset:"parchment",tags:["history"],customFill:p.background||null};return{...project(),name:p.name||"Imported Project",category:p.category||"History",fps:p.fps||30,activeSceneId:s.id,scenes:[s]};}
 return project();
}
const lerp=(a,b,t)=>a+(b-a)*t;
function poseAt(c,time){const ks=(c.keyframes||[]).slice().sort((a,b)=>a.time-b.time);if(!ks.length)return{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}};if(time<=ks[0].time)return structuredClone(ks[0].state);if(time>=ks.at(-1).time)return structuredClone(ks.at(-1).state);let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++)if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}const q=(time-a.time)/(b.time-a.time),o={x:lerp(a.state.x,b.state.x,q),y:lerp(a.state.y,b.state.y,q),scale:lerp(a.state.scale,b.state.scale,q),facing:q<.5?a.state.facing:b.state.facing,pose:{}};Object.keys(DEFAULT_POSE).forEach(k=>o.pose[k]=lerp(a.state.pose[k],b.state.pose[k],q));return o}
const capture=c=>({x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}});
function applyPose(c,name){if(POSES[name])c.pose={...POSES[name]}}
function activeScene(p){return p.scenes.find(s=>s.id===p.activeSceneId)||p.scenes[0]}
return{DEFAULT_POSE,POSES,HISTORY_ERAS,BACKGROUNDS,id,character,scene,project,migrate,poseAt,capture,applyPose,activeScene};
})();