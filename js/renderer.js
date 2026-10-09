window.MEPRenderer=(()=>{
const rad=d=>d*Math.PI/180;
function circle(ctx,x,y,r,fill,stroke="#222",sw=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(sw){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke()}}
function roundRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function shapePath(ctx,shape,cx,cy,size){
 ctx.beginPath();
 if(shape==="circle")ctx.arc(cx,cy,size/2,0,Math.PI*2);
 else if(shape==="triangle"){ctx.moveTo(cx,cy-size*.56);ctx.lineTo(cx+size*.54,cy+size*.48);ctx.lineTo(cx-size*.54,cy+size*.48);ctx.closePath()}
 else roundRect(ctx,cx-size/2,cy-size/2,size,size,size*.14)
}
function drawEyes(ctx,cx,cy,size,expression="neutral",color="#111"){
 const dx=size*.18,ey=cy-size*.08,r=Math.max(3,size*.045);ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(3,size*.04);ctx.lineCap="round";
 if(expression==="happy"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.arc(x,ey+4,r*1.3,Math.PI,Math.PI*2);ctx.stroke()}}
 else if(expression==="sad"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.arc(x,ey-3,r*1.3,0,Math.PI);ctx.stroke()}}
 else if(expression==="surprised"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.arc(x,ey,r*1.4,0,Math.PI*2);ctx.stroke()}}
 else if(expression==="sleepy"){for(const x of [cx-dx,cx+dx]){ctx.beginPath();ctx.moveTo(x-r*1.5,ey);ctx.lineTo(x+r*1.5,ey);ctx.stroke()}}
 else{for(const x of [cx-dx,cx+dx])circle(ctx,x,ey,r,color,color,0)}
 if(expression==="angry"||expression==="determined"){ctx.lineWidth=Math.max(4,size*.045);ctx.beginPath();ctx.moveTo(cx-dx-r*1.8,ey-r*2.1);ctx.lineTo(cx-dx+r*1.8,ey-r*.6);ctx.moveTo(cx+dx-r*1.8,ey-r*.6);ctx.lineTo(cx+dx+r*1.8,ey-r*2.1);ctx.stroke()}
 ctx.restore()
}
function drawMouth(ctx,cx,cy,size,visual,state){
 if(visual.mouthEnabled===false)return;ctx.save();ctx.strokeStyle=visual.eyeColor||"#111";ctx.fillStyle=visual.eyeColor||"#111";ctx.lineWidth=Math.max(2,size*.025);ctx.lineCap="round";const open=state.mouthOpen??visual.mouthOpen;
 if(open){ctx.beginPath();ctx.arc(cx,cy+size*.19,size*.046,0,Math.PI*2);ctx.fill()}else{ctx.beginPath();ctx.moveTo(cx-size*.08,cy+size*.18);ctx.lineTo(cx+size*.08,cy+size*.18);ctx.stroke()}ctx.restore()
}
function drawAccessory(ctx,cx,cy,size,v={}){
 ctx.save();const hair=v.hairStyle||"none",hat=v.hat||"none";
 if(hair!=="none"){ctx.strokeStyle="#30231c";ctx.lineWidth=Math.max(6,size*.075);ctx.beginPath();ctx.arc(cx,cy-size*.13,size*.36,Math.PI*1.06,Math.PI*1.94);ctx.stroke()}
 ctx.strokeStyle="#202126";ctx.lineWidth=Math.max(2,size*.025);
 if(hat==="crown"){ctx.fillStyle="#e5b83c";ctx.beginPath();ctx.moveTo(cx-size*.31,cy-size*.37);ctx.lineTo(cx-size*.23,cy-size*.57);ctx.lineTo(cx-size*.08,cy-size*.45);ctx.lineTo(cx,cy-size*.64);ctx.lineTo(cx+size*.12,cy-size*.45);ctx.lineTo(cx+size*.27,cy-size*.57);ctx.lineTo(cx+size*.31,cy-size*.37);ctx.closePath();ctx.fill();ctx.stroke()}
 else if(hat==="helmet"){ctx.fillStyle="#59654c";ctx.beginPath();ctx.arc(cx,cy-size*.27,size*.34,Math.PI,Math.PI*2);ctx.lineTo(cx+size*.36,cy-size*.25);ctx.lineTo(cx-size*.36,cy-size*.25);ctx.closePath();ctx.fill();ctx.stroke()}
 else if(hat==="officer"||hat==="tricorn"){ctx.fillStyle="#30343b";ctx.beginPath();ctx.moveTo(cx-size*.39,cy-size*.34);ctx.lineTo(cx,cy-size*.56);ctx.lineTo(cx+size*.39,cy-size*.34);ctx.lineTo(cx,cy-size*.4);ctx.closePath();ctx.fill();ctx.stroke()}
 ctx.restore()
}
function drawProp(ctx,cx,cy,size,prop="none",face=1){
 if(!prop||prop==="none")return;ctx.save();ctx.translate(cx+size*.56*face,cy+size*.02);ctx.scale(face,1);ctx.strokeStyle="#553b2a";ctx.fillStyle="#745036";ctx.lineCap="round";
 if(["spear","staff","rifle","musket","pointer"].includes(prop)){ctx.lineWidth=Math.max(4,size*.042);ctx.beginPath();ctx.moveTo(-size*.12,size*.36);ctx.lineTo(size*.18,-size*.48);ctx.stroke();if(prop==="spear"){ctx.fillStyle="#aeb5ba";ctx.beginPath();ctx.moveTo(size*.18,-size*.48);ctx.lineTo(size*.1,-size*.31);ctx.lineTo(size*.25,-size*.36);ctx.closePath();ctx.fill()}}
 else if(prop==="sword"){ctx.strokeStyle="#c4c9ce";ctx.lineWidth=Math.max(4,size*.038);ctx.beginPath();ctx.moveTo(0,size*.12);ctx.lineTo(size*.3,-size*.45);ctx.stroke();ctx.strokeStyle="#63452f";ctx.lineWidth=Math.max(6,size*.055);ctx.beginPath();ctx.moveTo(-size*.07,size*.05);ctx.lineTo(size*.12,size*.12);ctx.stroke()}
 else if(prop==="bow"){ctx.strokeStyle="#765033";ctx.lineWidth=Math.max(3,size*.03);ctx.beginPath();ctx.arc(0,-size*.08,size*.3,-1.15,1.15);ctx.stroke()}
 else if(prop==="axe"){ctx.lineWidth=Math.max(5,size*.045);ctx.beginPath();ctx.moveTo(0,size*.13);ctx.lineTo(size*.16,-size*.38);ctx.stroke();ctx.fillStyle="#8d9397";ctx.fillRect(size*.08,-size*.45,size*.24,size*.14)}
 else if(prop==="torch"){ctx.lineWidth=Math.max(5,size*.045);ctx.beginPath();ctx.moveTo(0,size*.13);ctx.lineTo(size*.13,-size*.34);ctx.stroke();ctx.fillStyle="#ed7b24";circle(ctx,size*.14,-size*.44,size*.09,"#ed7b24","#0000",0)}
 ctx.restore()
}
function drawCharacter(ctx,state,ch,selected=false){
 const v=ch.visual||{},shape=v.shape||"square",size=114*(state.scale||1),cx=state.x,cy=state.y;ctx.save();ctx.translate(cx,cy);ctx.rotate(rad(state.rotation||0));ctx.translate(-cx,-cy);
 shapePath(ctx,shape,cx,cy,size);ctx.save();ctx.clip();const flag=window.MEPHistoryFlags?MEPHistoryFlags.resolve(v.countryCode||"US",v.historicalYear||1863,v.flagVariant||"auto"):null;if(flag&&window.MEPHistoryFlags)MEPHistoryFlags.render(ctx,cx-size/2,cy-size/2,size,size,flag);else{ctx.fillStyle="#e6e6e6";ctx.fillRect(cx-size/2,cy-size/2,size,size)}ctx.restore();
 shapePath(ctx,shape,cx,cy,size);ctx.strokeStyle=selected?"#ffb020":v.stroke||"#17191d";ctx.lineWidth=selected?6:4;ctx.stroke();
 drawEyes(ctx,cx,cy,size,v.expression||"neutral",v.eyeColor||"#111");drawMouth(ctx,cx,cy,size,v,state);drawAccessory(ctx,cx,cy,size,v);drawProp(ctx,cx,cy,size,ch.prop||"none",state.facing||1);
 if(selected){ctx.setLineDash([7,5]);ctx.strokeStyle="#ffb020";ctx.lineWidth=2;ctx.strokeRect(cx-size*.67,cy-size*.67,size*1.34,size*1.34);ctx.setLineDash([])}ctx.restore()
}
function bounds(state,ch){const s=114*(state.scale||1);return{x:state.x-s*.7,y:state.y-s*.7,w:s*1.4,h:s*1.4}}

function gradientSky(ctx,w,h,top,bottom){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
function hills(ctx,w,h,colors,base=.56){colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,h*(base+i*.07));for(let x=0;x<=w;x+=70)ctx.lineTo(x,h*(base+i*.07)+Math.sin(x*.012+i)*24);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill()})}
function trees(ctx,w,h,start=.45,color="#344834"){ctx.fillStyle=color;for(let x=30;x<w;x+=145){ctx.fillRect(x,h*start,9,h*.17);ctx.beginPath();ctx.arc(x+4,h*(start-.02),38,0,Math.PI*2);ctx.fill()}}
function building(ctx,x,y,w,h,fill="#8a7768"){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);ctx.fillStyle="#b8d3e5";for(let yy=y+25;yy<y+h-25;yy+=55)for(let xx=x+18;xx<x+w-18;xx+=48)ctx.fillRect(xx,yy,25,30)}
function drawMap(ctx,key,w,h){
 ctx.fillStyle=key==="parchment"?"#e6d7a8":"#9cc3d6";ctx.fillRect(0,0,w,h);ctx.fillStyle=key==="parchment"?"#9f8b5d":"#6e8e62";
 const blobs=key==="europeMap"?[[.48,.34,.16,.16],[.58,.24,.09,.16],[.39,.27,.08,.08]]:key==="africaMap"?[[.52,.44,.16,.26],[.6,.66,.05,.09]]:key==="asiaMap"?[[.58,.33,.29,.21],[.8,.52,.1,.12]]:key==="americasMap"?[[.32,.25,.15,.2],[.4,.52,.09,.26],[.28,.12,.08,.1]]:[[.2,.28,.12,.19],[.33,.52,.08,.22],[.53,.29,.2,.17],[.6,.53,.12,.2],[.82,.58,.08,.09]];
 blobs.forEach(([x,y,rx,ry])=>{ctx.beginPath();ctx.ellipse(w*x,h*y,w*rx,h*ry,0,0,Math.PI*2);ctx.fill()});ctx.strokeStyle="#3e4a463d";ctx.lineWidth=1.5;for(let x=0;x<w;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 if(key==="battleMap"){ctx.strokeStyle="#b2272d";ctx.lineWidth=7;ctx.lineCap="round";for(const a of [[220,500,500,360],[770,520,640,300],[930,210,710,260]]){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[2],a[3]);ctx.stroke();ctx.fillStyle="#b2272d";ctx.beginPath();ctx.moveTo(a[2],a[3]);ctx.lineTo(a[2]-20,a[3]+8);ctx.lineTo(a[2]-7,a[3]+25);ctx.closePath();ctx.fill()}}
}
function tents(ctx,w,h,y=.68){for(let x=70;x<w;x+=190){ctx.fillStyle=x%380?"#8d795b":"#6f6452";ctx.beginPath();ctx.moveTo(x,h*y);ctx.lineTo(x+65,h*(y-.13));ctx.lineTo(x+130,h*y);ctx.closePath();ctx.fill();ctx.strokeStyle="#473b30";ctx.lineWidth=2;ctx.stroke()}}
function drawBackground(ctx,key,w=1280,h=720){
 if(["parchment","worldMap","americasMap","europeMap","africaMap","asiaMap","battleMap"].includes(key))return drawMap(ctx,key,w,h);
 if(key==="countryside"||key==="farmVillage"){gradientSky(ctx,w,h,"#8fc3e3","#f1c782");hills(ctx,w,h,["#8ca46b","#6f8758"]);trees(ctx,w,h,.5);if(key==="farmVillage"){ctx.fillStyle="#a87a4f";for(let x=120;x<w;x+=280){ctx.fillRect(x,420,130,100);ctx.fillStyle="#6c4731";ctx.beginPath();ctx.moveTo(x-12,420);ctx.lineTo(x+65,360);ctx.lineTo(x+142,420);ctx.closePath();ctx.fill();ctx.fillStyle="#a87a4f"}}}
 else if(key==="forest"||key==="jungle"){gradientSky(ctx,w,h,key==="jungle"?"#86b9a4":"#9cc6d6","#d8c693");hills(ctx,w,h,[key==="jungle"?"#4a714d":"#5f7950","#405a3d"]);trees(ctx,w,h,.32,key==="jungle"?"#294e34":"#344834");trees(ctx,w,h,.54,key==="jungle"?"#1f3d29":"#2f4933")}
 else if(key==="mountainPass"||key==="snowField"){gradientSky(ctx,w,h,"#8fb6d7","#d9e4ea");ctx.fillStyle=key==="snowField"?"#dce7ee":"#6b7074";for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(i*330-150,h*.68);ctx.lineTo(i*330+170,h*.19);ctx.lineTo(i*330+480,h*.68);ctx.closePath();ctx.fill()}ctx.fillStyle=key==="snowField"?"#f4f7f9":"#8b806c";ctx.fillRect(0,h*.68,w,h*.32)}
 else if(key==="riverCrossing"){gradientSky(ctx,w,h,"#8dc4e1","#e4c98d");hills(ctx,w,h,["#799365","#657c54"]);ctx.fillStyle="#4d91b7";ctx.beginPath();ctx.moveTo(420,h);ctx.bezierCurveTo(540,520,720,530,850,330);ctx.lineTo(1000,330);ctx.bezierCurveTo(820,560,690,620,620,h);ctx.closePath();ctx.fill()}
 else if(key==="village"||key==="oldTownStreet"){gradientSky(ctx,w,h,"#a8cbdc","#e8cf9d");ctx.fillStyle="#6f756d";ctx.fillRect(0,h*.73,w,h*.27);for(let x=60;x<w;x+=190){building(ctx,x,250+(x%380?70:0),150,260-(x%380?70:0),x%380?"#9d7e61":"#b28a68");ctx.fillStyle="#674832";ctx.beginPath();ctx.moveTo(x-12,250+(x%380?70:0));ctx.lineTo(x+75,190+(x%380?70:0));ctx.lineTo(x+162,250+(x%380?70:0));ctx.closePath();ctx.fill()}}
 else if(key==="castle"||key==="coastalFort"){gradientSky(ctx,w,h,"#a8c4d6","#d6d0bd");if(key==="coastalFort"){ctx.fillStyle="#4d86a4";ctx.fillRect(0,h*.58,w,h*.42)}ctx.fillStyle="#777d82";ctx.fillRect(0,h*.5,w,h*.3);for(let x=90;x<w;x+=260){ctx.fillRect(x,190,190,340);for(let k=0;k<5;k++)ctx.fillRect(x+k*38,165,22,35)}}
 else if(key==="royalCourt"||key==="throneRoom"||key==="governmentHall"){ctx.fillStyle=key==="throneRoom"?"#29333e":"#e5d8c0";ctx.fillRect(0,0,w,h);ctx.fillStyle=key==="governmentHall"?"#d7d7d1":key==="throneRoom"?"#761f34":"#8d5c54";for(let x=0;x<w;x+=220)ctx.fillRect(x,0,70,h*.74);ctx.fillStyle="#d2b44a";ctx.fillRect(w*.43,h*.35,w*.14,h*.36);ctx.fillStyle=key==="governmentHall"?"#7e807d":"#704337";ctx.fillRect(0,h*.78,w,h*.22)}
 else if(key==="lectureHall"||key==="classroom"){ctx.fillStyle="#d9cdae";ctx.fillRect(0,0,w,h);ctx.fillStyle="#3c5048";ctx.fillRect(260,90,760,250);ctx.fillStyle="#8b7356";for(let y=455;y<700;y+=85)for(let x=110;x<1200;x+=220)ctx.fillRect(x,y,160,42);if(key==="lectureHall"){ctx.fillStyle="#6c4a37";ctx.fillRect(510,360,260,70)}}
 else if(key==="library"){ctx.fillStyle="#d6c9b1";ctx.fillRect(0,0,w,h);ctx.fillStyle="#694c37";for(let x=70;x<w;x+=240){ctx.fillRect(x,80,185,450);for(let y=110;y<510;y+=38){ctx.fillStyle=y%76?"#9b3a3a":"#2f526e";ctx.fillRect(x+14,y,155,16);ctx.fillStyle="#694c37"}}}
 else if(key==="mapRoom"){ctx.fillStyle="#cdbf9e";ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(250,100);ctx.scale(.62,.55);drawMap(ctx,"parchment",w,h);ctx.restore();ctx.fillStyle="#70533b";ctx.fillRect(90,h*.7,w*.82,120)}
 else if(key==="shipDeck"){gradientSky(ctx,w,h,"#6bb7ed","#c4def0");ctx.fillStyle="#326aa9";ctx.fillRect(0,h*.42,w,h*.58);ctx.fillStyle="#8c5c3d";ctx.fillRect(0,h*.58,w,h*.42);ctx.strokeStyle="#4d3224";ctx.lineWidth=4;for(let y=h*.6;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.fillStyle="#62432f";ctx.fillRect(w*.68,h*.18,28,h*.42);ctx.strokeStyle="#c7b8a1";ctx.lineWidth=5;for(let x=60;x<650;x+=100){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+260,h*.58);ctx.stroke()}}
 else if(key==="colonialPort"||key==="harbor"){gradientSky(ctx,w,h,"#82bfe0","#d7ddc5");ctx.fillStyle="#4f89a7";ctx.fillRect(0,h*.48,w,h*.52);ctx.fillStyle="#765641";ctx.fillRect(0,h*.72,w,h*.28);for(let x=80;x<w;x+=220){ctx.fillRect(x,h*.42,12,h*.3);ctx.fillRect(x-40,h*.44,130,9)}}
 else if(key==="ocean"){gradientSky(ctx,w,h,"#82bfe0","#d7ddc5");ctx.fillStyle="#3d78a3";ctx.fillRect(0,h*.48,w,h*.52)}
 else if(key==="city"||key==="cityBattleStreet"){gradientSky(ctx,w,h,"#8fa9c0","#c8c4b7");for(let x=0;x<w;x+=170)building(ctx,x,140+(x%340?80:0),150,420-(x%340?80:0),x%340?"#7b7f84":"#958578");ctx.fillStyle="#555";ctx.fillRect(0,h*.76,w,h*.24);if(key==="cityBattleStreet"){ctx.fillStyle="#222";for(let x=120;x<w;x+=260){ctx.beginPath();ctx.moveTo(x,300);ctx.lineTo(x+30,350);ctx.lineTo(x-25,380);ctx.closePath();ctx.fill()}}}
 else if(key==="battlefield"||key==="battlefieldNight"){gradientSky(ctx,w,h,key==="battlefieldNight"?"#1f2d48":"#8fa3ac",key==="battlefieldNight"?"#6c5949":"#c3a779");hills(ctx,w,h,[key==="battlefieldNight"?"#3a3d3d":"#786f59","#625a4b"]);ctx.strokeStyle="#443a2f";ctx.lineWidth=4;for(let x=80;x<w;x+=180){ctx.beginPath();ctx.moveTo(x,470);ctx.lineTo(x+80,545);ctx.stroke()}if(key==="battlefieldNight"){ctx.fillStyle="#ef8b32";for(let x=130;x<w;x+=290)circle(ctx,x,560,18,"#ef8b32","#0000",0)}}
 else if(key==="trench"){gradientSky(ctx,w,h,"#8b9b9f","#b2a381");ctx.fillStyle="#665541";ctx.fillRect(0,h*.58,w,h*.42);ctx.fillStyle="#3f352a";ctx.fillRect(0,h*.72,w,h*.16);ctx.strokeStyle="#9a8767";ctx.lineWidth=8;for(let x=0;x<w;x+=130){ctx.beginPath();ctx.moveTo(x,h*.58);ctx.lineTo(x+95,h*.72);ctx.stroke()}}
 else if(key==="militaryCamp"){gradientSky(ctx,w,h,"#8fa9b3","#d4bc8c");hills(ctx,w,h,["#6f7558","#5e614d"]);tents(ctx,w,h,.72);ctx.fillStyle="#e68025";circle(ctx,640,570,20,"#e68025","#0000",0)}
 else if(key==="factory"){ctx.fillStyle="#9fa4a8";ctx.fillRect(0,0,w,h);for(let x=0;x<w;x+=180)building(ctx,x,220,160,330,"#6d7175");ctx.fillStyle="#45484c";for(let x=100;x<w;x+=320)ctx.fillRect(x,70,48,220)}
 else if(key==="newspaper"){ctx.fillStyle="#eee3c9";ctx.fillRect(0,0,w,h);ctx.fillStyle="#29251f";ctx.font="900 64px Georgia";ctx.textAlign="center";ctx.fillText("HISTORY NEWS",w/2,90);ctx.fillRect(80,120,w-160,5);ctx.font="700 34px Georgia";ctx.fillText("Add your headline with a caption",w/2,175);ctx.fillStyle="#777";for(let x=90;x<w-90;x+=260)for(let y=230;y<h-60;y+=35)ctx.fillRect(x,y,210,8)}
 else if(key==="desert"){gradientSky(ctx,w,h,"#91c4df","#f0cc85");hills(ctx,w,h,["#d8ae61","#bd8d4d"],.62)}
 else{ctx.fillStyle="#ece5cf";ctx.fillRect(0,0,w,h)}
}
function drawBubble(ctx,b){const st=MEPModel.BUBBLE_STYLES[b.style]||MEPModel.BUBBLE_STYLES.speech,x=b.x||300,y=b.y||120,w=b.width||300,h=b.height||100,r=st.radius||10;ctx.save();ctx.fillStyle=b.fill||st.fill;ctx.strokeStyle=b.stroke||st.stroke;ctx.lineWidth=b.strokeWidth||3;roundRect(ctx,x,y,w,h,r);ctx.fill();ctx.stroke();if(st.tail==="speech"){ctx.beginPath();const tx=b.tailX??x+w*.25,ty=b.tailY??y+h+40;ctx.moveTo(x+w*.2,y+h-2);ctx.lineTo(tx,ty);ctx.lineTo(x+w*.36,y+h-2);ctx.closePath();ctx.fill();ctx.stroke()}ctx.fillStyle=b.textColor||st.text;ctx.font=(b.bold?"700 ":"600 ")+(b.fontSize||28)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";const words=String(b.text||"Dialogue").split(/\s+/),lines=[];let lineText="";for(const word of words){const test=lineText?lineText+" "+word:word;if(ctx.measureText(test).width>w-30&&lineText){lines.push(lineText);lineText=word}else lineText=test}if(lineText)lines.push(lineText);const lh=(b.fontSize||28)*1.15,start=y+h/2-(lines.length-1)*lh/2;lines.forEach((ln,i)=>ctx.fillText(ln,x+w/2,start+i*lh,w-24));ctx.restore()}
return{drawCharacter,bounds,drawBackground,drawBubble};
})();