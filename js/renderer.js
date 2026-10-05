window.MEPRenderer=(()=>{
const rad=d=>d*Math.PI/180;
function end(p,len,ang,face=1){return{x:p.x+Math.sin(rad(ang))*len*face,y:p.y+Math.cos(rad(ang))*len}}
function geometry(s){
 const sc=s.scale,face=s.facing,p=s.pose,hip={x:s.x,y:s.y},shoulder=end(hip,-100*sc,p.torso,face),neck=end(shoulder,-22*sc,p.torso,face),head=end(neck,-35*sc,p.head+p.torso,face);
 const la1=end(shoulder,70*sc,p.leftUpperArm-110,face),la2=end(la1,65*sc,p.leftUpperArm+p.leftLowerArm-110,face);
 const ra1=end(shoulder,70*sc,p.rightUpperArm+110,face),ra2=end(ra1,65*sc,p.rightUpperArm+p.rightLowerArm+110,face);
 const ll1=end(hip,82*sc,p.leftUpperLeg-15,face),ll2=end(ll1,78*sc,p.leftUpperLeg+p.leftLowerLeg-8,face);
 const rl1=end(hip,82*sc,p.rightUpperLeg+15,face),rl2=end(rl1,78*sc,p.rightUpperLeg+p.rightLowerLeg+8,face);
 return{hip,shoulder,neck,head,leftElbow:la1,leftHand:la2,rightElbow:ra1,rightHand:ra2,leftKnee:ll1,leftFoot:ll2,rightKnee:rl1,rightFoot:rl2};
}
function line(ctx,a,b,w=10){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle="#242424";ctx.lineWidth=w;ctx.lineCap="round";ctx.stroke()}
function draw(ctx,s,selected=false,rig={}){\n const g=geometry(s),sc=s.scale;
 line(ctx,g.hip,g.shoulder,18*sc);line(ctx,g.shoulder,g.leftElbow,11*sc);line(ctx,g.leftElbow,g.leftHand,9*sc);line(ctx,g.shoulder,g.rightElbow,11*sc);line(ctx,g.rightElbow,g.rightHand,9*sc);line(ctx,g.hip,g.leftKnee,13*sc);line(ctx,g.leftKnee,g.leftFoot,11*sc);line(ctx,g.hip,g.rightKnee,13*sc);line(ctx,g.rightKnee,g.rightFoot,11*sc);
 ctx.beginPath();ctx.arc(g.head.x,g.head.y,30*sc,0,Math.PI*2);ctx.fillStyle=rig.skin||"#f2c7a5";ctx.fill();ctx.strokeStyle=rig.line||"#242424";ctx.lineWidth=5*sc;ctx.stroke();
 const eyeX=g.head.x+10*sc*s.facing;ctx.beginPath();ctx.arc(eyeX,g.head.y-4*sc,2.5*sc,0,Math.PI*2);ctx.fillStyle="#222";ctx.fill();
 if(selected){Object.values(g).forEach(pt=>{ctx.beginPath();ctx.arc(pt.x,pt.y,5,0,Math.PI*2);ctx.fillStyle="#ffb020";ctx.fill()});ctx.strokeStyle="#ffb020";ctx.lineWidth=2;ctx.strokeRect(g.hip.x-45*sc,g.head.y-45*sc,90*sc,(g.hip.y-g.head.y)+190*sc)}
 return g;
}
return{draw,geometry};
})();