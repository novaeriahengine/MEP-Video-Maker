// Purpose-built illustrated backgrounds and moving invention mechanisms for Shorts 11–15.
window.MEPInventionScenes=(()=>{
 const keys=new Set(["snowyTrolley1902","wiperWorkshop1903","paperBagFactory1868","paperBagPatent1871","draftingOffice1876","lightbulbLab1882","railway1887","telegraphStation1887","polymerLab1965","kevlarApplications"]);
 const C={sky:"#c7d4d8",cream:"#f1e3c3",ink:"#26323a",gold:"#dab05c",blue:"#6c93a8",green:"#71816c",brown:"#806451",brick:"#96776a",red:"#ac514c",light:"#f6e6a4",dark:"#394653"};
 const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 function line(g,x,y,x2,y2,c=C.ink,sw=5){g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.strokeStyle=c;g.lineWidth=sw;g.lineCap="round";g.stroke()}
 function circle(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
 function label(g,t,x,y,size=26,color=C.ink){g.font="800 "+size+"px system-ui";g.textAlign="center";g.textBaseline="middle";g.lineJoin="round";g.lineWidth=5;g.strokeStyle=C.cream;g.strokeText(t,x,y,640);g.fillStyle=color;g.fillText(t,x,y,640)}
 function base(g,ground=C.brown,night=false){rect(g,0,0,720,1280,night?C.dark:C.sky);rect(g,0,450,720,210,night?"#55616a":C.cream);rect(g,0,740,720,540,ground);line(g,0,740,720,740,"#52616a",3)}
 function person(g,x,y,fill=C.ink){circle(g,x,y-100,30,fill);rect(g,x-25,y-65,50,100,fill);line(g,x-15,y+35,x-35,y+96,fill,14);line(g,x+15,y+35,x+35,y+96,fill,14);line(g,x-25,y-35,x-75,y+10,fill,11);line(g,x+25,y-35,x+65,y+10,fill,11)}
 function machine(g,x,y,w=230,h=230){rect(g,x,y,w,h,C.dark);rect(g,x+15,y+18,w-30,h-35,"#8f9b98");rect(g,x+25,y+32,w-50,h-77,C.cream);line(g,x+25,y+h+10,x+w-25,y+h+10,C.ink,9)}
 function bag(g,x,y,s=1){g.save();g.translate(x,y);g.scale(s,s);rect(g,-55,-95,110,180,"#d4b584");line(g,-55,-95,55,-95,C.brown,4);line(g,-55,84,55,84,C.brown,4);line(g,-55,84,-25,105,C.brown,4);line(g,55,84,25,105,C.brown,4);g.restore()}
 function bulb(g,x,y,r=65,lit=true){g.save();circle(g,x,y,r,lit?C.light:"#c3d0d0");rect(g,x-25,y+r-3,50,52,C.dark);for(let k=0;k<5;k++)line(g,x-25,y+r+8*k,x+25,y+r+8*k,"#9da5a5",3);line(g,x-r*.4,y+r*.05,x+r*.4,y+r*.05,C.red,6);if(lit){g.strokeStyle="#fff2bc";g.lineWidth=3;for(let a=0;a<Math.PI*2;a+=Math.PI/6){line(g,x+Math.cos(a)*r*1.25,y+Math.sin(a)*r*1.25,x+Math.cos(a)*r*1.65,y+Math.sin(a)*r*1.65,C.gold,4)}}g.restore()}
 function trolley(g,x,y,ice=true){rect(g,x,y,500,190,C.brick);rect(g,x+26,y+25,448,97,C.cream);for(let k=0;k<5;k++)rect(g,x+38+k*84,y+37,71,77,C.blue);rect(g,x+12,y+190,480,25,C.dark);circle(g,x+85,y+213,27,C.ink);circle(g,x+411,y+213,27,C.ink);if(ice)for(let k=0;k<14;k++)circle(g,x+45+k*31,y+26+(k%3)*20,5,C.cream)}
 function train(g,x,y){rect(g,x,y,320,130,C.dark);rect(g,x+60,y-105,180,110,C.brick);rect(g,x+230,y-60,85,60,C.ink);for(let k=0;k<3;k++)circle(g,x+55+k*105,y+143,27,C.ink);rect(g,x+100,y-80,65,65,C.blue)}
 function document(g,x,y){rect(g,x,y,220,280,"#f2e7cf");for(let k=0;k<7;k++)line(g,x+20,y+40+k*31,x+200,y+40+k*31,"#b4a68b",3)}
 function bottle(g,x,y,fill="#94b1ba"){rect(g,x-34,y-60,68,60,"#98a5a4");rect(g,x-73,y,146,205,fill);rect(g,x-80,y+200,160,14,C.dark)}
 function lab(g){base(g,"#6f7068",false);rect(g,50,250,620,420,"#aeb9b6");rect(g,50,667,620,70,C.brown);rect(g,0,950,720,330,"#626565")}
 function paperFactory(g){base(g,"#9a8066");for(let x=60;x<680;x+=170){rect(g,x,270,130,300,C.brick);rect(g,x+27,340,76,90,C.dark)}rect(g,40,740,640,80,C.brown);machine(g,180,800,340,190)}
 function setCaption(g,t){label(g,t,360,300,27,C.ink)}
 function draw(ctx,key,w,h,options={}){
  const time=Math.max(0,Number(options.time)||0),dur=Math.max(.1,Number(options.duration)||3.2),p=Math.min(1,time/dur),intent=String(options.intent||"");
  ctx.save();ctx.scale(w/720,h/1280);
  if(key==="snowyTrolley1902"){
   base(ctx,"#7d8586");for(let x=45;x<700;x+=180){rect(ctx,x,230,130,440,C.brick);rect(ctx,x+22,290,83,90,C.dark)}
   trolley(ctx,110,660,true);
   if(/wiper|sweep|clear/.test(intent)){const x=310+160*Math.sin(p*Math.PI);line(ctx,310,688,x,550,C.ink,9);line(ctx,x-75,550,x+75,550,C.dark,12)}
   if(/snow|storm|driver|cold/.test(intent))for(let k=0;k<22;k++)circle(ctx,(41*k+time*19)%720,360+(k*71)%400,4,C.cream);
   if(/mary|watch|notice|idea/.test(intent))person(ctx,165,875,C.blue);
   if(/patent|car|standard/.test(intent))label(ctx,"1903 · WIPER",360,540,35);
  }else if(key==="wiperWorkshop1903"){
   base(ctx,"#7d6c58");rect(ctx,70,270,580,430,"#b4b4a7");rect(ctx,90,730,540,55,C.brown);
   rect(ctx,190,405,340,190,C.blue);rect(ctx,202,418,316,165,C.cream);
   const angle=-.8+1.6*p;const x=360+145*Math.sin(angle),y=575-130*Math.cos(angle);
   line(ctx,360,575,x,y,C.ink,13);circle(ctx,360,575,12,C.gold);rect(ctx,300,820,130,155,C.dark);
   if(/lever|sweep|wipe|test|spring/.test(intent)){line(ctx,365,825,405,745,C.gold,10);label(ctx,"LEVER → BLADE",360,320,28)}
   if(/patent|rejected/.test(intent))document(ctx,480,630);
   if(/mary|sketch/.test(intent))person(ctx,175,880,C.blue);
  }else if(key==="paperBagFactory1868"){
   paperFactory(ctx);for(let i=0;i<3;i++)bag(ctx,130+i*140,995,.53);
   if(/feed|cut|fold|glue|machine|automatic/.test(intent)){bag(ctx,230+190*p,845,.6);label(ctx,intent.toUpperCase().slice(0,24),350,550,30)}
   if(/knight|design|sketch|idea/.test(intent))person(ctx,570,910,C.blue);
   if(/cone|unstable|old/.test(intent))label(ctx,"OLD BAGS TIPPED OVER",350,590,28);
  }else if(key==="paperBagPatent1871"){
   base(ctx,"#806c57");rect(ctx,70,240,580,510,C.brick);document(ctx,250,490);
   if(/patent|court|blueprint|evidence|copy/.test(intent))label(ctx,"BLUEPRINTS",360,370,32);
   bag(ctx,560,870,.68);person(ctx,130,890,C.blue);
   if(/patent|win|1871/.test(intent))label(ctx,"1871",400,875,45,C.gold);
  }else if(key==="draftingOffice1876"){
   base(ctx,"#8b7967");rect(ctx,40,250,640,460,C.cream);rect(ctx,110,730,500,65,C.brown);
   document(ctx,250,500);person(ctx,140,900,C.dark);
   if(/bell|telephone|draft|draw/.test(intent)){label(ctx,"TELEPHONE DRAWING",390,390,27);line(ctx,345,550,440,650,C.blue,6)}
   if(/gas|old light|lamp/.test(intent)){bulb(ctx,525,590,50,false);label(ctx,"EARLY LIGHTING",360,360,28)}
  }else if(key==="lightbulbLab1882"){
   lab(ctx);rect(ctx,140,760,460,60,C.brown);
   bulb(ctx,360,610,90,/bright|glow|lasting|durable|electric|light|patent|home|carbon/.test(intent));
   if(/carbon|filament|treat|strength|patent/.test(intent)){line(ctx,305,616,415,616,C.red,7);label(ctx,"CARBON FILAMENT",360,365,30)}
   if(/gas|before/.test(intent)){rect(ctx,540,490,35,155,C.brown);circle(ctx,558,475,20,C.gold)}
   if(/latimer|work/.test(intent))person(ctx,150,945,C.dark);
  }else if(key==="railway1887"){
   base(ctx,"#83877c");rect(ctx,0,920,720,260,"#656862");
   for(let y=945;y<1180;y+=60){line(ctx,0,y,720,y,C.brown,14)}
   train(ctx,100+175*p,720);for(let x=60;x<700;x+=230){line(ctx,x,390,x,710,C.dark,8);line(ctx,x,435,x+230,435,C.dark,5)}
   if(/message|signal|telegraph|wire|send|communicat/.test(intent)){line(ctx,85,430,635,430,C.gold,6);circle(ctx,300+220*p,430,10,C.gold);label(ctx,"SIGNAL",360,345,30)}
   if(/danger|risk|collision/.test(intent))label(ctx,"NO WARNING?",360,360,34,C.red);
  }else if(key==="telegraphStation1887"){
   base(ctx,"#807262");rect(ctx,50,250,620,450,"#bdc2bd");rect(ctx,145,740,445,80,C.brown);rect(ctx,250,590,220,135,C.dark);
   for(let i=0;i<6;i++)circle(ctx,280+i*34,650,8,C.gold);
   if(/operator|dispatch|send|signal|receive|telegraph|morse/.test(intent))for(let i=0;i<5;i++)circle(ctx,300+i*45+15*p,540,5,C.gold);
   if(/woods|invent|patent|company/.test(intent))person(ctx,140,875,C.dark);
   if(/patent|legal|edison/.test(intent))document(ctx,470,510);
  }else if(key==="polymerLab1965"){
   lab(ctx);rect(ctx,160,730,430,70,C.brown);bottle(ctx,280,485,"#b5bcbb");bottle(ctx,450,505,"#d2d5c0");
   if(/cloudy|liquid|solution|odd/.test(intent)){for(let i=0;i<16;i++)circle(ctx,215+(i*19)%140,530+(i*11)%140,4,C.cream);label(ctx,"CLOUDY SOLUTION",360,340,29)}
   if(/fiber|spin|test|strong|strand/.test(intent)){for(let i=0;i<8;i++)line(ctx,230+i*14,690,380+i*10,930,C.gold,3);label(ctx,"STRONG NEW FIBERS",370,365,29)}
   if(/kwolek|chemist|experiment/.test(intent))person(ctx,120,910,C.dark);
  }else if(key==="kevlarApplications"){
   base(ctx,"#737c7e");rect(ctx,0,780,720,500,"#77816e");
   // Woven fiber with visible vertical/horizontal warp.
   for(let i=0;i<12;i++){line(ctx,170+i*31,475,170+i*31,770,C.gold,12);line(ctx,165,490+i*23,560,490+i*23,C.brown,5)}
   if(/vest|protect|armor|police/.test(intent)){rect(ctx,250,735,220,245,C.dark);rect(ctx,290,750,140,188,C.gold);label(ctx,"PROTECTIVE VEST",360,380,30)}
   else if(/rope|cable/.test(intent)){for(let j=0;j<5;j++)line(ctx,140,825+j*20,580,825+j*20,C.gold,8);label(ctx,"CABLES + ROPES",360,385,32)}
   else if(/steel|strength|weight|five/.test(intent)){label(ctx,"5× STRENGTH BY WEIGHT",360,382,32);label(ctx,"LIGHTWEIGHT FIBER",360,960,30)}
  }
  // Minimal editorial framing, shared between all five inventions.
  // The shared app draws the Noveria brand once, above the visual layer.
  ctx.restore();
 }
 return{has:key=>keys.has(key),draw};
})();
