window.MEPRenderer=(()=>{
const rad=d=>d*Math.PI/180;
function end(p,len,ang,face=1){return{x:p.x+Math.sin(rad(ang))*len*face,y:p.y+Math.cos(rad(ang))*len}}
function geometry(s,rig={}){
 const style=MEPModel.BODY_STYLES[rig.bodyStyle]||MEPModel.BODY_STYLES.historyCutout,sc=s.scale||1,face=s.facing||1,p=s.pose||MEPModel.DEFAULT_POSE,len=style.length||1,hip={x:s.x,y:s.y};
 const shoulder=end(hip,-100*sc*len,p.torso||0,face),neck=end(shoulder,-22*sc,p.torso||0,face),head=end(neck,-38*sc,(p.head||0)+(p.torso||0),face);
 const leftElbow=end(shoulder,70*sc*len,(p.leftUpperArm||0)-110,face),leftHand=end(leftElbow,65*sc*len,(p.leftUpperArm||0)+(p.leftLowerArm||0)-110,face);
 const rightElbow=end(shoulder,70*sc*len,(p.rightUpperArm||0)+110,face),rightHand=end(rightElbow,65*sc*len,(p.rightUpperArm||0)+(p.rightLowerArm||0)+110,face);
 const leftKnee=end(hip,82*sc*len,(p.leftUpperLeg||0)-15,face),leftFoot=end(leftKnee,78*sc*len,(p.leftUpperLeg||0)+(p.leftLowerLeg||0)-8,face);
 const rightKnee=end(hip,82*sc*len,(p.rightUpperLeg||0)+15,face),rightFoot=end(rightKnee,78*sc*len,(p.rightUpperLeg||0)+(p.rightLowerLeg||0)+8,face);
 return{hip,shoulder,neck,head,leftElbow,leftHand,rightElbow,rightHand,leftKnee,leftFoot,rightKnee,rightFoot}
}
function line(ctx,a,b,w,color){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap="round";ctx.stroke()}
function circle(ctx,p,r,fill,stroke="#242424",sw=3){ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(sw){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke()}}
function roundRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function drawEyes(ctx,cx,cy,size,expression="neutral",color="#111"){
 const dx=size*.18,ey=cy-size*.07,r=Math.max(3,size*.045);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(3,size*.045);ctx.lineCap="round";
 if(expression==="happy"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.arc(x,ey+4,r*1.3,Math.PI,Math.PI*2);ctx.stroke()}}
 else if(expression==="sad"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.arc(x,ey-3,r*1.3,0,Math.PI);ctx.stroke()}}
 else if(expression==="surprised"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.arc(x,ey,r*1.35,0,Math.PI*2);ctx.stroke()}}
 else if(expression==="sleepy"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.moveTo(x-r*1.5,ey);ctx.lineTo(x+r*1.5,ey);ctx.stroke()}}
 else{for(const x of [cx-dx,cx+dx])circle(ctx,{x,y:ey},r,color,color,0)}
 if(expression==="angry"||expression==="determined"){ctx.lineWidth=Math.max(4,size*.05);ctx.beginPath();ctx.moveTo(cx-dx-r*1.8,ey-r*2.2);ctx.lineTo(cx-dx+r*1.8,ey-r*.7);ctx.moveTo(cx+dx-r*1.8,ey-r*.7);ctx.lineTo(cx+dx+r*1.8,ey-r*2.2);ctx.stroke()}
 ctx.restore()
}
function drawMouth(ctx,cx,cy,size,visual={},state={}){
 if(visual.mouthEnabled===false)return;ctx.save();ctx.strokeStyle=visual.eyeColor||"#111";ctx.fillStyle=visual.eyeColor||"#111";ctx.lineWidth=Math.max(2,size*.025);ctx.lineCap="round";
 const open=state.mouthOpen??visual.mouthOpen;if(open){ctx.beginPath();ctx.arc(cx,cy+size*.19,size*.045,0,Math.PI*2);ctx.fill()}else{ctx.beginPath();ctx.moveTo(cx-size*.08,cy+size*.18);ctx.lineTo(cx+size*.08,cy+size*.18);ctx.stroke()}ctx.restore()
}
function drawAccessory(ctx,cx,cy,size,visual={},rig={}){
 const hat=visual.hat||rig.hat||"none",hair=visual.hairStyle||rig.hairStyle||"none";ctx.save();
 if(hair&&hair!=="none"){ctx.strokeStyle=rig.hair||"#2d2119";ctx.lineWidth=Math.max(6,size*.08);ctx.beginPath();ctx.arc(cx,cy-size*.12,size*.37,Math.PI*1.08,Math.PI*1.92);ctx.stroke()}
 ctx.strokeStyle="#202126";ctx.lineWidth=Math.max(2,size*.025);
 if(hat==="crown"){ctx.fillStyle="#e4b53b";ctx.beginPath();ctx.moveTo(cx-size*.32,cy-size*.36);ctx.lineTo(cx-size*.25,cy-size*.58);ctx.lineTo(cx-size*.1,cy-size*.45);ctx.lineTo(cx,cy-size*.63);ctx.lineTo(cx+size*.12,cy-size*.45);ctx.lineTo(cx+size*.27,cy-size*.58);ctx.lineTo(cx+size*.32,cy-size*.36);ctx.closePath();ctx.fill();ctx.stroke()}
 else if(hat==="helmet"){ctx.fillStyle="#59654c";ctx.beginPath();ctx.arc(cx,cy-size*.27,size*.34,Math.PI,Math.PI*2);ctx.lineTo(cx+size*.36,cy-size*.25);ctx.lineTo(cx-size*.36,cy-size*.25);ctx.closePath();ctx.fill();ctx.stroke()}
 else if(hat==="officer"||hat==="tricorn"){ctx.fillStyle="#30343b";ctx.beginPath();ctx.moveTo(cx-size*.38,cy-size*.34);ctx.lineTo(cx,cy-size*.56);ctx.lineTo(cx+size*.38,cy-size*.34);ctx.lineTo(cx,cy-size*.4);ctx.closePath();ctx.fill();ctx.stroke()}
 ctx.restore()
}
function drawProp(ctx,cx,cy,size,prop="none",face=1){
 if(!prop||prop==="none")return;ctx.save();ctx.translate(cx+size*.42*face,cy+size*.02);ctx.scale(face,1);ctx.strokeStyle="#4e3828";ctx.fillStyle="#6a4a2d";ctx.lineCap="round";
 if(["spear","staff","rifle","musket"].includes(prop)){ctx.lineWidth=Math.max(4,size*.045);ctx.beginPath();ctx.moveTo(-size*.08,size*.35);ctx.lineTo(size*.16,-size*.5);ctx.stroke();if(prop==="spear"){ctx.fillStyle="#aaa";ctx.beginPath();ctx.moveTo(size*.16,-size*.5);ctx.lineTo(size*.09,-size*.33);ctx.lineTo(size*.23,-size*.37);ctx.closePath();ctx.fill()}}
 else if(prop==="sword"){ctx.strokeStyle="#c1c6ca";ctx.lineWidth=Math.max(4,size*.04);ctx.beginPath();ctx.moveTo(0,size*.08);ctx.lineTo(size*.28,-size*.45);ctx.stroke();ctx.strokeStyle="#65482f";ctx.lineWidth=Math.max(6,size*.06);ctx.beginPath();ctx.moveTo(-size*.08,size*.03);ctx.lineTo(size*.1,size*.1);ctx.stroke()}
 else if(prop==="bow"){ctx.strokeStyle="#6a4a2d";ctx.lineWidth=Math.max(3,size*.03);ctx.beginPath();ctx.arc(0,-size*.1,size*.28,-1.1,1.1);ctx.stroke()}
 else if(prop==="axe"){ctx.lineWidth=Math.max(5,size*.045);ctx.beginPath();ctx.moveTo(0,size*.12);ctx.lineTo(size*.16,-size*.38);ctx.stroke();ctx.fillStyle="#8b8f92";ctx.fillRect(size*.08,-size*.44,size*.25,size*.13)}
 else if(prop==="torch"){ctx.lineWidth=Math.max(5,size*.045);ctx.beginPath();ctx.moveTo(0,size*.12);ctx.lineTo(size*.12,-size*.35);ctx.stroke();ctx.fillStyle="#e77722";ctx.beginPath();ctx.arc(size*.13,-size*.45,size*.1,0,Math.PI*2);ctx.fill()}
 ctx.restore()
}
function shapePath(ctx,shape,cx,cy,size){
 ctx.beginPath();if(shape==="circle")ctx.arc(cx,cy,size/2,0,Math.PI*2);else if(shape==="triangle"){ctx.moveTo(cx,cy-size*.55);ctx.lineTo(cx+size*.53,cy+size*.48);ctx.lineTo(cx-size*.53,cy+size*.48);ctx.closePath()}else roundRect(ctx,cx-size/2,cy-size/2,size,size,size*.15)
}
function drawShapeCharacter(ctx,state,ch,selected=false){
 const v=ch.visual||{},shape=v.lookType==="country"?(v.shape||"square"):(v.lookType||v.shape||"square"),size=112*(state.scale||1),cx=state.x,cy=state.y,rot=state.rotation||0;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(rad(rot));ctx.translate(-cx,-cy);shapePath(ctx,shape,cx,cy,size);ctx.save();ctx.clip();
 if(v.lookType==="country"&&window.MEPHistoryFlags){const flag=MEPHistoryFlags.resolve(v.countryCode||"US",v.historicalYear||1800,v.flagVariant||"auto");MEPHistoryFlags.render(ctx,cx-size/2,cy-size/2,size,size,flag)}
 else{const grad=ctx.createLinearGradient(cx-size/2,cy-size/2,cx+size/2,cy+size/2);grad.addColorStop(0,v.fill||"#eef0f2");grad.addColorStop(1,"#cfd3d9");ctx.fillStyle=grad;ctx.fillRect(cx-size/2,cy-size/2,size,size)}
 ctx.restore();shapePath(ctx,shape,cx,cy,size);ctx.strokeStyle=selected?"#ffb020":v.stroke||"#17191d";ctx.lineWidth=selected?6:4;ctx.stroke();
 drawEyes(ctx,cx,cy,size,v.expression||ch.rig?.expression||"neutral",v.eyeColor||"#111");drawMouth(ctx,cx,cy,size,v,state);drawAccessory(ctx,cx,cy,size,v,ch.rig||{});drawProp(ctx,cx,cy,size,ch.rig?.prop||"none",state.facing||1);
 if(selected){ctx.setLineDash([7,5]);ctx.strokeStyle="#ffb020";ctx.lineWidth=2;ctx.strokeRect(cx-size*.65,cy-size*.65,size*1.3,size*1.3);ctx.setLineDash([])}
 ctx.restore()
}
function drawHumanoid(ctx,s,selected=false,rig={}){
 const g=geometry(s,rig),sc=s.scale||1,style=MEPModel.BODY_STYLES[rig.bodyStyle]||MEPModel.BODY_STYLES.historyCutout,tw=style.torsoWidth||1,lw=style.limbWidth||1,lineColor=rig.line||"#242424",skin=rig.skin||"#d49b74",shirt=rig.shirt||"#58667a",pants=rig.pants||"#343a46";
 line(ctx,g.hip,g.shoulder,31*sc*tw,shirt);line(ctx,g.shoulder,g.leftElbow,16*sc*lw,shirt);line(ctx,g.leftElbow,g.leftHand,13*sc*lw,skin);line(ctx,g.shoulder,g.rightElbow,16*sc*lw,shirt);line(ctx,g.rightElbow,g.rightHand,13*sc*lw,skin);line(ctx,g.hip,g.leftKnee,19*sc*lw,pants);line(ctx,g.leftKnee,g.leftFoot,16*sc*lw,pants);line(ctx,g.hip,g.rightKnee,19*sc*lw,pants);line(ctx,g.rightKnee,g.rightFoot,16*sc*lw,pants);
 circle(ctx,g.leftHand,8*sc,skin,lineColor,2);circle(ctx,g.rightHand,8*sc,skin,lineColor,2);circle(ctx,g.head,33*sc*(rig.headScale||1)*(style.headScale||1),skin,lineColor,4*sc);
 drawEyes(ctx,g.head.x,g.head.y,70*sc,rig.expression||"neutral",lineColor);drawMouth(ctx,g.head.x,g.head.y,70*sc,{mouthEnabled:true,eyeColor:lineColor},s);drawAccessory(ctx,g.head.x,g.head.y,70*sc,{hat:rig.hat,hairStyle:rig.hairStyle},rig);drawProp(ctx,g.rightHand.x,g.rightHand.y,90*sc,rig.prop||"none",s.facing||1);
 if(selected)Object.values(g).forEach(pt=>circle(ctx,pt,5,"#ffb020","#fff",1))
}
function drawCharacter(ctx,state,ch,selected=false){const look=ch.visual?.lookType||"humanoid";if(look==="humanoid")drawHumanoid(ctx,state,selected,ch.rig||{});else drawShapeCharacter(ctx,state,ch,selected)}
function draw(ctx,state,selected=false,rig={},character=null){if(character)return drawCharacter(ctx,state,character,selected);return drawHumanoid(ctx,state,selected,rig)}
function bounds(state,ch){if(ch.visual?.lookType&&ch.visual.lookType!=="humanoid"){const s=112*(state.scale||1);return{x:state.x-s*.7,y:state.y-s*.7,w:s*1.4,h:s*1.4}}const g=geometry(state,ch.rig||{}),pts=Object.values(g),minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x)),minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));return{x:minX-35,y:minY-45,w:maxX-minX+70,h:maxY-minY+90}}
function gradientSky(ctx,w,h,top,bottom){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
function hills(ctx,w,h,colors,base=.56){colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,h*(base+i*.07));for(let x=0;x<=w;x+=80)ctx.lineTo(x,h*(base+i*.07)+Math.sin(x*.012+i)*25);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill()})}
function trees(ctx,w,h,start=.45){ctx.fillStyle="#344834";for(let x=30;x<w;x+=145){ctx.fillRect(x,h*start,9,h*.17);ctx.beginPath();ctx.arc(x+4,h*(start-.02),38,0,Math.PI*2);ctx.fill()}}
function building(ctx,x,y,w,h,fill="#8a7768"){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);ctx.fillStyle="#b8d3e5";for(let yy=y+25;yy<y+h-25;yy+=55)for(let xx=x+20;xx<x+w-20;xx+=50)ctx.fillRect(xx,yy,26,30)}
function drawMap(ctx,key,w,h){
 ctx.fillStyle=key==="parchment"?"#e6d7a8":"#9cc3d6";ctx.fillRect(0,0,w,h);ctx.fillStyle=key==="parchment"?"#9f8b5d":"#6e8e62";
 const blobs=key==="europeMap"?[[.48,.34,.16,.16],[.58,.24,.09,.16],[.39,.27,.08,.08]]:key==="africaMap"?[[.52,.44,.16,.26],[.6,.66,.05,.09]]:key==="asiaMap"?[[.58,.33,.29,.21],[.8,.52,.1,.12]]:key==="americasMap"?[[.32,.25,.15,.2],[.4,.52,.09,.26],[.28,.12,.08,.1]]:[[.2,.28,.12,.19],[.33,.52,.08,.22],[.53,.29,.2,.17],[.6,.53,.12,.2],[.82,.58,.08,.09]];
 blobs.forEach(([x,y,rx,ry])=>{ctx.beginPath();ctx.ellipse(w*x,h*y,w*rx,h*ry,0,0,Math.PI*2);ctx.fill()});ctx.strokeStyle="#3e4a4655";ctx.lineWidth=2;for(let x=0;x<w;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
}
function drawBackground(ctx,key,w=1280,h=720){
 if(["parchment","worldMap","americasMap","europeMap","africaMap","asiaMap"].includes(key))return drawMap(ctx,key,w,h);
 if(key==="prehistoricCamp"){gradientSky(ctx,w,h,"#8fb8d0","#efb56f");hills(ctx,w,h,["#817556","#675a45"]);trees(ctx,w,h,.48);ctx.fillStyle="#5d4632";for(const x of [100,850]){ctx.beginPath();ctx.moveTo(x,580);ctx.lineTo(x+130,350);ctx.lineTo(x+260,580);ctx.closePath();ctx.fill()}ctx.fillStyle="#f38b25";circle(ctx,{x:620,y:565},24,"#f38b25","#0000",0)}
 else if(key==="forest"){gradientSky(ctx,w,h,"#9cc6d6","#d8c693");hills(ctx,w,h,["#5f7950","#405a3d"]);trees(ctx,w,h,.35);trees(ctx,w,h,.52)}
 else if(key==="countryside"){gradientSky(ctx,w,h,"#91c4e4","#f4c98a");hills(ctx,w,h,["#8ea06c","#6f865b"]);trees(ctx,w,h,.5)}
 else if(key==="battlefield"){gradientSky(ctx,w,h,"#8fa3ac","#c3a779");hills(ctx,w,h,["#786f59","#625a4b"]);ctx.strokeStyle="#443a2f";ctx.lineWidth=4;for(let x=80;x<w;x+=180){ctx.beginPath();ctx.moveTo(x,470);ctx.lineTo(x+80,545);ctx.stroke()}}
 else if(key==="village"){gradientSky(ctx,w,h,"#a8cbdc","#e8cf9d");ctx.fillStyle="#7a8d68";ctx.fillRect(0,470,w,250);for(let x=70;x<w;x+=210){building(ctx,x,320,145,160,"#9a7857");ctx.fillStyle="#6e4c34";ctx.beginPath();ctx.moveTo(x-12,320);ctx.lineTo(x+72,250);ctx.lineTo(x+157,320);ctx.closePath();ctx.fill()}}
 else if(key==="castle"){gradientSky(ctx,w,h,"#a8c4d6","#d6d0bd");ctx.fillStyle="#747b82";ctx.fillRect(0,440,w,280);for(let x=100;x<w;x+=250){ctx.fillRect(x,210,180,310);for(let k=0;k<5;k++)ctx.fillRect(x+k*36,185,22,35)}}
 else if(key==="royalCourt"||key==="throneRoom"){ctx.fillStyle=key==="throneRoom"?"#29333e":"#e6d7bf";ctx.fillRect(0,0,w,h);ctx.fillStyle=key==="throneRoom"?"#761f34":"#8d5c54";for(let x=0;x<w;x+=220)ctx.fillRect(x,0,70,h*.74);ctx.fillStyle="#d2b44a";ctx.fillRect(w*.43,h*.35,w*.14,h*.36);ctx.fillStyle="#704337";ctx.fillRect(0,h*.78,w,h*.22)}
 else if(key==="shipDeck"){gradientSky(ctx,w,h,"#6bb7ed","#c4def0");ctx.fillStyle="#326aa9";ctx.fillRect(0,h*.42,w,h*.58);ctx.fillStyle="#8c5c3d";ctx.fillRect(0,h*.58,w,h*.42);ctx.strokeStyle="#4d3224";ctx.lineWidth=4;for(let y=h*.6;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.fillStyle="#62432f";ctx.fillRect(w*.68,h*.18,28,h*.42);ctx.strokeStyle="#c7b8a1";ctx.lineWidth=5;for(let x=60;x<650;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+260,h*.58);ctx.stroke()}}
 else if(key==="colonialPort"||key==="harbor"){gradientSky(ctx,w,h,"#82bfe0","#d7ddc5");ctx.fillStyle="#4f89a7";ctx.fillRect(0,h*.48,w,h*.52);ctx.fillStyle="#765641";ctx.fillRect(0,h*.72,w,h*.28);for(let x=80;x<w;x+=220){ctx.fillRect(x,h*.42,12,h*.3);ctx.fillRect(x-40,h*.44,130,9)}}
 else if(key==="ocean"){gradientSky(ctx,w,h,"#82bfe0","#d7ddc5");ctx.fillStyle="#3d78a3";ctx.fillRect(0,h*.48,w,h*.52);ctx.strokeStyle="#d6ecf8aa";for(let y=h*.53;y<h;y+=45){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+8);ctx.stroke()}}
 else if(key==="city"||key==="cityBattleStreet"){gradientSky(ctx,w,h,"#8fa9c0","#c8c4b7");for(let x=0;x<w;x+=170){building(ctx,x,140+(x%340?80:0),150,420-(x%340?80:0),x%340?"#7b7f84":"#958578")}ctx.fillStyle="#555";ctx.fillRect(0,h*.76,w,h*.24);if(key==="cityBattleStreet"){ctx.fillStyle="#222";for(let x=120;x<w;x+=260){ctx.beginPath();ctx.moveTo(x,300);ctx.lineTo(x+30,350);ctx.lineTo(x-25,380);ctx.closePath();ctx.fill()}}}
 else if(key==="trench"){gradientSky(ctx,w,h,"#8b9b9f","#b2a381");ctx.fillStyle="#665541";ctx.fillRect(0,h*.58,w,h*.42);ctx.fillStyle="#3f352a";ctx.fillRect(0,h*.72,w,h*.16);ctx.strokeStyle="#9a8767";ctx.lineWidth=8;for(let x=0;x<w;x+=130){ctx.beginPath();ctx.moveTo(x,h*.58);ctx.lineTo(x+95,h*.72);ctx.stroke()}}
 else if(key==="factory"){ctx.fillStyle="#9fa4a8";ctx.fillRect(0,0,w,h);for(let x=0;x<w;x+=180)building(ctx,x,220,160,330,"#6d7175");ctx.fillStyle="#45484c";for(let x=100;x<w;x+=320)ctx.fillRect(x,70,48,220)}
 else if(key==="classroom"||key==="library"){ctx.fillStyle="#d7cab2";ctx.fillRect(0,0,w,h);ctx.fillStyle="#6d5138";if(key==="library"){for(let x=80;x<w;x+=250){ctx.fillRect(x,90,190,430);ctx.fillStyle="#9d3c3c";for(let y=120;y<490;y+=35)ctx.fillRect(x+15,y,160,15);ctx.fillStyle="#6d5138"}}else{ctx.fillStyle="#40524a";ctx.fillRect(250,100,780,260);ctx.fillStyle="#8c7658";for(let y=470;y<700;y+=90)for(let x=120;x<1180;x+=220)ctx.fillRect(x,y,150,45)}}
 else if(key==="mapRoom"){ctx.fillStyle="#cdbf9e";ctx.fillRect(0,0,w,h);drawMap(ctx,"parchment",w*.58,h*.55);ctx.fillStyle="#70533b";ctx.fillRect(90,h*.68,w*.82,120);ctx.fillStyle="#2f3943";ctx.fillRect(0,0,60,h);ctx.fillRect(w-60,0,60,h)}
 else if(key==="desert"){gradientSky(ctx,w,h,"#91c4df","#f0cc85");hills(ctx,w,h,["#d8ae61","#bd8d4d"],.62)}
 else{ctx.fillStyle="#ece5cf";ctx.fillRect(0,0,w,h)}
}
function drawBubble(ctx,b){const st=MEPModel.BUBBLE_STYLES[b.style]||MEPModel.BUBBLE_STYLES.speech,x=b.x||300,y=b.y||120,w=b.width||300,h=b.height||100,r=st.radius||10;ctx.save();ctx.fillStyle=b.fill||st.fill;ctx.strokeStyle=b.stroke||st.stroke;ctx.lineWidth=b.strokeWidth||3;roundRect(ctx,x,y,w,h,r);ctx.fill();ctx.stroke();if(st.tail==="speech"){ctx.beginPath();const tx=b.tailX??x+w*.25,ty=b.tailY??y+h+40;ctx.moveTo(x+w*.2,y+h-2);ctx.lineTo(tx,ty);ctx.lineTo(x+w*.36,y+h-2);ctx.closePath();ctx.fill();ctx.stroke()}ctx.fillStyle=b.textColor||st.text;ctx.font=(b.bold?"700 ":"600 ")+(b.fontSize||28)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";const words=String(b.text||"Dialogue").split(/\s+/),lines=[];let lineText="";for(const word of words){const test=lineText?lineText+" "+word:word;if(ctx.measureText(test).width>w-30&&lineText){lines.push(lineText);lineText=word}else lineText=test}if(lineText)lines.push(lineText);const lh=(b.fontSize||28)*1.15,start=y+h/2-(lines.length-1)*lh/2;lines.forEach((ln,i)=>ctx.fillText(ln,x+w/2,start+i*lh,w-24));ctx.restore()}
return{draw,drawCharacter,drawHumanoid,drawShapeCharacter,geometry,bounds,drawBackground,drawBubble};
})();