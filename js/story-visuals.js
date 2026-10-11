window.MEPStoryVisuals=(()=>{
const T={
  ink:"#1f2930",cream:"#efe4c8",paper:"#f5ecd6",sky:"#9db9c5",skyDark:"#566879",
  ground:"#a98d69",green:"#7d9270",brick:"#986b5d",wood:"#6f513f",stone:"#8e8d84",
  ocean:"#6f9fb2",blue:"#557da2",red:"#a84d48",gold:"#d5ad55",white:"#fffaf0",
  molasses:"#6b3d28",smoke:"#5e6160",water:"#9fc7d2"
};
const clamp=v=>Math.max(0,Math.min(1,v));
function rr(ctx,x,y,w,h,r=12){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function line(ctx,a,b,color=T.ink,width=6,dash=[]){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore()}
function circle(ctx,x,y,r,fill,stroke=T.ink,sw=3){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(sw){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke()}}
function label(ctx,text,x,y,size=34,color=T.white,stroke=T.ink){ctx.save();ctx.font="900 "+size+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineWidth=Math.max(4,size*.12);ctx.strokeStyle=stroke;ctx.strokeText(text,x,y);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore()}
function callout(ctx,text,w,h,accent=T.gold){if(!text)return;ctx.save();ctx.font="900 "+Math.max(28,w*.055)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";const tw=Math.min(w*.86,ctx.measureText(text).width+w*.1);rr(ctx,(w-tw)/2,h*.16,tw,h*.085,14);ctx.fillStyle="rgba(31,41,48,.86)";ctx.fill();ctx.fillStyle=accent;ctx.fillText(text,w/2,h*.202,w*.78);ctx.restore()}
function person(ctx,x,y,s=1,fill=T.blue){circle(ctx,x,y-34*s,18*s,fill);ctx.fillStyle=fill;rr(ctx,x-18*s,y-18*s,36*s,58*s,10*s);ctx.fill();line(ctx,{x:x-12*s,y:y+8*s},{x:x-28*s,y:y+38*s},T.ink,4*s);line(ctx,{x:x+12*s,y:y+8*s},{x:x+28*s,y:y+38*s},T.ink,4*s)}
function ship(ctx,x,y,s=1,flip=1,fill=T.ink){ctx.save();ctx.translate(x,y);ctx.scale(flip,1);ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(-100*s,0);ctx.lineTo(110*s,0);ctx.lineTo(72*s,34*s);ctx.lineTo(-70*s,34*s);ctx.closePath();ctx.fill();ctx.fillRect(-18*s,-42*s,66*s,42*s);ctx.strokeStyle=T.cream;ctx.lineWidth=4*s;ctx.beginPath();ctx.moveTo(10*s,-42*s);ctx.lineTo(10*s,-130*s);ctx.lineTo(78*s,-28*s);ctx.stroke();ctx.restore()}
function arrow(ctx,a,b,p,color=T.red,width=10){const q={x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p};line(ctx,a,q,color,width);const ang=Math.atan2(q.y-a.y,q.x-a.x);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(ang);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-24,12);ctx.lineTo(-24,-12);ctx.closePath();ctx.fill();ctx.restore()}
function document(ctx,x,y,s=1,text=""){ctx.save();ctx.fillStyle=T.paper;ctx.strokeStyle=T.ink;ctx.lineWidth=3;rr(ctx,x-70*s,y-90*s,140*s,180*s,8*s);ctx.fill();ctx.stroke();ctx.strokeStyle="#766b5e";ctx.lineWidth=3*s;for(let yy=y-52*s;yy<y+45*s;yy+=24*s){ctx.beginPath();ctx.moveTo(x-48*s,yy);ctx.lineTo(x+48*s,yy);ctx.stroke()}if(text)label(ctx,text,x,y+68*s,18*s,T.ink,T.paper);ctx.restore()}
function finishBackground(ctx,key,w,h){ctx.save();ctx.fillStyle="rgba(239,228,200,.07)";ctx.fillRect(0,0,w,h);const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(31,41,48,.05)");g.addColorStop(.65,"rgba(31,41,48,0)");g.addColorStop(1,"rgba(31,41,48,.18)");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle="rgba(31,41,48,.18)";ctx.lineWidth=4;ctx.strokeRect(2,2,w-4,h-4);ctx.restore()}
function drawSmalls(ctx,beat,p,w,h){
 if(beat==="take-ship"){ship(ctx,w*.58,h*.63,1.15);person(ctx,w*.28,h*.69,1,T.blue);for(let i=0;i<3;i++)person(ctx,w*(.18+i*.09),h*.80,.7,T.gold);arrow(ctx,{x:w*.28,y:h*.69},{x:w*.48,y:h*.65},p,T.gold,8);callout(ctx,"HE TOOK THE PLANTER",w,h)}
 else if(beat==="family-boards"){ship(ctx,w*.62,h*.62,1.05);for(let i=0;i<4;i++){const x=w*(.16+i*.1),y=h*(.76-i*.015);person(ctx,x,y,.72,i%2?T.gold:T.blue);arrow(ctx,{x,y:y-20},{x:w*.5,y:h*.65},p,T.blue,6)}callout(ctx,"HIS FAMILY BOARDED",w,h)}
 else if(beat==="checkpoint"){ship(ctx,w*(.25+.38*p),h*.62,.9);ctx.fillStyle=T.stone;rr(ctx,w*.68,h*.46,w*.2,h*.22,8);ctx.fill();label(ctx,"FORT SUMTER",w*.78,h*.43,22,T.cream,T.ink);circle(ctx,w*.77,h*.58,18,T.red);callout(ctx,"PASS THE CHECKPOINT",w,h,T.red)}
 else if(beat==="white-flag"){ship(ctx,w*.48,h*.65,1.0);line(ctx,{x:w*.48,y:h*.49},{x:w*.48,y:h*.32},T.ink,5);ctx.fillStyle=T.white;ctx.fillRect(w*.48,h*.32,w*.12,h*.08);callout(ctx,"WHITE SHEET = UNION",w,h,T.gold)}
}
function drawCowpens(ctx,beat,p,w,h){
 const ys=[.38,.52,.68];for(let i=0;i<3;i++){ctx.strokeStyle=i===2?T.blue:"#7890a3";ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(w*.16,h*ys[i]);ctx.lineTo(w*.58,h*ys[i]);ctx.stroke()}
 if(beat==="two-volleys"){for(let i=0;i<5;i++)circle(ctx,w*(.22+i*.075),h*.52,8,T.gold);for(let i=0;i<5;i++){ctx.fillStyle=T.red;ctx.beginPath();ctx.moveTo(w*(.68+i*.045),h*.4);ctx.lineTo(w*(.71+i*.045),h*.43);ctx.lineTo(w*(.68+i*.045),h*.46);ctx.fill()}callout(ctx,"TWO VOLLEYS",w,h)}
 else if(beat==="retreat"){arrow(ctx,{x:w*.52,y:h*.52},{x:w*.32,y:h*.68},p,T.blue,8);callout(ctx,"THEN FALL BACK",w,h)}
 else if(beat==="british-chase"){arrow(ctx,{x:w*.84,y:h*.34},{x:w*.57,y:h*.65},p,T.red,10);callout(ctx,"THE BRITISH TOOK THE BAIT",w,h,T.red)}
 else if(beat==="trap"){arrow(ctx,{x:w*.25,y:h*.82},{x:w*.55,y:h*.66},p,T.blue,10);arrow(ctx,{x:w*.82,y:h*.78},{x:w*.58,y:h*.66},p,T.blue,10);callout(ctx,"THE TRAP CLOSED",w,h)}
}
function drawMolasses(ctx,beat,p,w,h){
 const tx=w*.66,ty=h*.48;ctx.fillStyle=T.stone;ctx.fillRect(tx-70,ty-170,140,260);ctx.strokeStyle=T.ink;ctx.lineWidth=7;ctx.strokeRect(tx-70,ty-170,140,260);
 if(beat==="rupture"){ctx.strokeStyle=T.red;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx+10,ty-130);ctx.lineTo(tx-20,ty-70);ctx.lineTo(tx+18,ty-20);ctx.stroke();circle(ctx,tx+6,ty-45,18,T.molasses,T.ink,2);callout(ctx,"THE TANK RUPTURED",w,h,T.red)}
 else if(beat==="wave"){ctx.fillStyle=T.molasses;ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,h*(.68-.12*p));ctx.bezierCurveTo(w*.28,h*(.54-.08*p),w*.62,h*.74,w,h*.62);ctx.lineTo(w,h);ctx.closePath();ctx.fill();callout(ctx,"2.3 MILLION GALLONS",w,h,T.gold)}
 else if(beat==="aftermath"){ctx.fillStyle="rgba(107,61,40,.45)";ctx.fillRect(0,h*.7,w,h*.3);for(let i=0;i<5;i++)line(ctx,{x:w*(.12+i*.17),y:h*.72},{x:w*(.2+i*.17),y:h*.84},T.wood,9);callout(ctx,"21 PEOPLE DIED",w,h,T.red)}
}
function drawFarnsworth(ctx,beat,p,w,h){
 if(beat==="furrows"){for(let i=0;i<10;i++){ctx.strokeStyle=T.gold;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(w*.5,h*.46);ctx.lineTo(w*(-.2+i*.15),h);ctx.stroke()}callout(ctx,"AN IDEA IN THE FURROWS",w,h)}
 else if(beat==="scan-lines"){ctx.strokeStyle=T.water;ctx.lineWidth=4;for(let i=0;i<15;i++){const yy=h*(.3+i*.028);ctx.globalAlpha=clamp((p*18-i)/3);ctx.beginPath();ctx.moveTo(w*.2,yy);ctx.lineTo(w*.8,yy);ctx.stroke()}ctx.globalAlpha=1;callout(ctx,"TURN THE IMAGE INTO LINES",w,h,T.gold)}
 else if(beat==="television"){ctx.fillStyle=T.ink;rr(ctx,w*.25,h*.32,w*.5,h*.34,24);ctx.fill();ctx.fillStyle="#b8d5d8";rr(ctx,w*.3,h*.36,w*.4,h*.22,16);ctx.fill();ctx.strokeStyle="#5fa4aa";ctx.lineWidth=3;for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(w*.32,h*(.38+i*.018));ctx.lineTo(w*.68,h*(.38+i*.018));ctx.stroke()}callout(ctx,"ELECTRONIC TELEVISION",w,h)}
}
function drawArmistead(ctx,beat,p,w,h){
 if(beat==="enter-camp"){person(ctx,w*.28,h*.7,1,T.blue);person(ctx,w*.7,h*.68,1,T.red);arrow(ctx,{x:w*.32,y:h*.66},{x:w*.58,y:h*.66},p,T.gold,7);callout(ctx,"INSIDE THE BRITISH CAMP",w,h)}
 else if(beat==="intel"){person(ctx,w*.28,h*.7,1,T.blue);person(ctx,w*.7,h*.68,1,T.red);document(ctx,w*(.63-.24*p),h*.58,.65,"INTEL");callout(ctx,"HE GATHERED INFORMATION",w,h)}
 else if(beat==="deliver"){document(ctx,w*(.25+.42*p),h*.53,.62,"INTEL");person(ctx,w*.18,h*.72,.9,T.blue);person(ctx,w*.76,h*.72,.9,T.gold);callout(ctx,"BACK TO LAFAYETTE",w,h,T.gold)}
}
function drawSampson(ctx,beat,p,w,h){
 if(beat==="enlist"){document(ctx,w*.62,h*.52,.75,"ROBERT SHURTLEFF");person(ctx,w*.28,h*.72,1,T.blue);callout(ctx,"ENLISTED UNDER A MAN'S NAME",w,h)}
 else if(beat==="wounded"){person(ctx,w*.42,h*.7,1,T.blue);ctx.strokeStyle=T.red;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(w*.5,h*.68);ctx.lineTo(w*.58,h*.62);ctx.stroke();circle(ctx,w*.58,h*.62,10,T.red,T.ink,2);callout(ctx,"WOUNDED — IDENTITY HIDDEN",w,h,T.red)}
 else if(beat==="hospital"){ctx.fillStyle=T.white;rr(ctx,w*.2,h*.42,w*.6,h*.27,18);ctx.fill();ctx.strokeStyle=T.ink;ctx.lineWidth=5;ctx.stroke();ctx.fillStyle=T.red;ctx.fillRect(w*.47,h*.47,w*.06,h*.16);ctx.fillRect(w*.42,h*.52,w*.16,h*.06);callout(ctx,"DISCOVERED AFTER ILLNESS",w,h)}
}
function drawMorgan(ctx,beat,p,w,h){
 const sy=h*.48;ctx.fillStyle=T.ink;ctx.fillRect(w*.49,h*.3,18,h*.36);for(const [i,c] of [[0,T.red],[1,T.gold],[2,"#5a8b67"]])circle(ctx,w*.5,h*(.34+i*.085),18,c,T.ink,3);
 if(beat==="conflict"){for(let i=0;i<3;i++){ctx.fillStyle=i===0?T.blue:T.red;rr(ctx,w*(.08+i*.25),sy+i*35,110,55,10);ctx.fill();circle(ctx,w*(.11+i*.25),sy+55+i*35,16,T.ink,T.ink,0);circle(ctx,w*(.2+i*.25),sy+55+i*35,16,T.ink,T.ink,0)}callout(ctx,"STOP OR GO WASN'T ENOUGH",w,h)}
 else if(beat==="all-stop"){ctx.save();ctx.globalAlpha=.28+.72*p;ctx.fillStyle=T.red;ctx.fillRect(0,h*.62,w,h*.07);ctx.restore();callout(ctx,"ALL DIRECTIONS STOP",w,h,T.gold)}
 else if(beat==="patent"){document(ctx,w*.5,h*.55,.75,"1923");callout(ctx,"THREE-POSITION SIGNAL",w,h)}
}
function drawCochran(ctx,beat,p,w,h){
 if(beat==="chipped"){for(let i=0;i<4;i++){circle(ctx,w*(.28+i*.14),h*.58,42,T.white,T.ink,3)}ctx.strokeStyle=T.red;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(w*.54,h*.54);ctx.lineTo(w*.58,h*.61);ctx.stroke();callout(ctx,"HER DISHES KEPT GETTING CHIPPED",w,h,T.red)}
 else if(beat==="rack"){ctx.strokeStyle=T.wood;ctx.lineWidth=8;ctx.beginPath();ctx.arc(w*.5,h*.55,w*.2,0,Math.PI*2);ctx.stroke();for(let a=0;a<Math.PI*2;a+=Math.PI/6)line(ctx,{x:w*.5,y:h*.55},{x:w*.5+Math.cos(a)*w*.2,y:h*.55+Math.sin(a)*w*.12},T.wood,5);callout(ctx,"WIRE RACKS HELD THE DISHES",w,h)}
 else if(beat==="water"){ctx.strokeStyle=T.water;ctx.lineWidth=6;for(let i=0;i<8;i++){const a=-Math.PI*.8+i*Math.PI*.22;const r=80+120*p;ctx.beginPath();ctx.moveTo(w*.5,h*.62);ctx.lineTo(w*.5+Math.cos(a)*r,h*.62+Math.sin(a)*r);ctx.stroke()}callout(ctx,"PRESSURIZED HOT WATER",w,h,T.gold)}
}
function drawReeves(ctx,beat,p,w,h){
 if(beat==="warrant"){document(ctx,w*.5,h*.53,.8,"WARRANT");callout(ctx,"DEPUTY U.S. MARSHAL",w,h)}
 else if(beat==="ride"){person(ctx,w*(.2+.5*p),h*.67,1,T.blue);ctx.strokeStyle=T.wood;ctx.lineWidth=10;ctx.beginPath();ctx.arc(w*(.2+.5*p),h*.75,55,Math.PI,Math.PI*2);ctx.stroke();callout(ctx,"THOUSANDS OF MILES OF TERRITORY",w,h)}
 else if(beat==="disguise"){person(ctx,w*.35,h*.7,1,T.blue);person(ctx,w*.68,h*.7,1,T.red);document(ctx,w*.52,h*.54,.48,"ARREST");callout(ctx,"TRACK. DISGUISE. ARREST.",w,h,T.gold)}
}
function drawJones(ctx,beat,p,w,h){
 if(beat==="approach"){ship(ctx,w*(.24+.16*p),h*.65,1,T.blue,1);ship(ctx,w*(.78-.16*p),h*.62,1,T.red,-1);callout(ctx,"THE SHIPS CLOSED IN",w,h)}
 else if(beat==="locked"){ship(ctx,w*.42,h*.66,1.05,T.blue,1);ship(ctx,w*.62,h*.62,1.05,T.red,-1);circle(ctx,w*.52,h*.57,18,T.gold,T.red,3);callout(ctx,"LOCKED TOGETHER",w,h,T.red)}
 else if(beat==="surrender"){ship(ctx,w*.52,h*.63,1.08,T.red,-1);line(ctx,{x:w*.52,y:h*.46},{x:w*.52,y:h*.3},T.ink,5);ctx.fillStyle=T.white;ctx.fillRect(w*.52,h*.3,w*.11,h*.07);callout(ctx,"SERAPIS SURRENDERED",w,h,T.gold)}
 else if(beat==="sinking"){ship(ctx,w*.38,h*(.62+.13*p),1.05,T.blue,1);ctx.save();ctx.globalAlpha=p;ctx.fillStyle=T.smoke;for(let i=0;i<4;i++)circle(ctx,w*(.34+i*.04),h*(.45-i*.04),24+i*5,T.smoke,T.smoke,0);ctx.restore();ship(ctx,w*.72,h*.62,.9,T.red,-1);callout(ctx,"HIS OWN SHIP SANK",w,h,T.red)}
}
function drawBeat(ctx,g,time=0){
 const start=g.startTime??0,end=g.endTime??999,p=clamp((time-start)/Math.max(.001,end-start));
 const w=ctx.canvas.width,h=ctx.canvas.height,story=String(g.story||"").toLowerCase(),beat=String(g.beat||g.label||"").toLowerCase();
 ctx.save();
 if(story==="smalls")drawSmalls(ctx,beat,p,w,h);
 else if(story==="cowpens")drawCowpens(ctx,beat,p,w,h);
 else if(story==="molasses")drawMolasses(ctx,beat,p,w,h);
 else if(story==="farnsworth")drawFarnsworth(ctx,beat,p,w,h);
 else if(story==="armistead")drawArmistead(ctx,beat,p,w,h);
 else if(story==="sampson")drawSampson(ctx,beat,p,w,h);
 else if(story==="morgan")drawMorgan(ctx,beat,p,w,h);
 else if(story==="cochran")drawCochran(ctx,beat,p,w,h);
 else if(story==="reeves")drawReeves(ctx,beat,p,w,h);
 else if(story==="jones")drawJones(ctx,beat,p,w,h);
 ctx.restore();
}
return{theme:T,drawBeat,finishBackground};
})();