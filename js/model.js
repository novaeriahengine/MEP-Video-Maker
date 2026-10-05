window.MEPModel=(()=>{
const DEFAULT_POSE={head:0,torso:0,leftUpperArm:-25,leftLowerArm:-10,rightUpperArm:25,rightLowerArm:10,leftUpperLeg:-8,leftLowerLeg:5,rightUpperLeg:8,rightLowerLeg:5};
let uid=0; const id=()=>Date.now().toString(36)+(uid++).toString(36);
function character(name="Historian",x=640,y=405){return{id:id(),name,x,y,scale:1,facing:1,pose:{...DEFAULT_POSE},keyframes:[]}}
function project(){return{version:1,name:"Untitled History",category:"History",width:1280,height:720,duration:8,fps:30,background:"#f5f0e5",characters:[character()]}}
const lerp=(a,b,t)=>a+(b-a)*t;
function poseAt(c,time){
 const ks=c.keyframes.slice().sort((a,b)=>a.time-b.time);
 if(!ks.length)return{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}};
 if(time<=ks[0].time)return structuredClone(ks[0].state);
 if(time>=ks[ks.length-1].time)return structuredClone(ks[ks.length-1].state);
 let a=ks[0],b=ks[1];for(let i=0;i<ks.length-1;i++)if(time>=ks[i].time&&time<=ks[i+1].time){a=ks[i];b=ks[i+1];break}
 const t=(time-a.time)/(b.time-a.time),out={x:lerp(a.state.x,b.state.x,t),y:lerp(a.state.y,b.state.y,t),scale:lerp(a.state.scale,b.state.scale,t),facing:t<.5?a.state.facing:b.state.facing,pose:{}};
 Object.keys(DEFAULT_POSE).forEach(k=>out.pose[k]=lerp(a.state.pose[k],b.state.pose[k],t));return out;
}
function capture(c){return{x:c.x,y:c.y,scale:c.scale,facing:c.facing,pose:{...c.pose}}}
return{DEFAULT_POSE,project,character,poseAt,capture,id};
})();