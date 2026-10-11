// Canvas captions are part of the same render path for preview AND export.
window.MEPCaptions=(()=>{
 const defaults={enabled:false,source:"narration",position:"bottom",x:50,y:84,fontSize:40,color:"#fff8e7",accent:"#f1c35f",stroke:"#202832",background:"none",animationIn:"rise",animationOut:"fade",wordsPerCaption:5,uppercase:false,shadow:true,highlight:true};
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function style(sh){return {...defaults,...(sh?.captionStyle||{})}}
 function segments(scene,sh){
  const st=style(sh),duration=Math.max(.1,Number(scene?.duration)||3),text=st.source==="scene"?String(scene?.caption||scene?.script||""):String(scene?.script||scene?.caption||"");
  if(Array.isArray(scene?.captionSegments)&&scene.captionSegments.length)return scene.captionSegments.filter(s=>s&&s.text).map(s=>({text:String(s.text),start:clamp(Number(s.start)||0,0,duration),end:clamp(Number(s.end)||duration,0,duration)})).filter(s=>s.end>s.start);
  const words=text.trim().split(/\s+/).filter(Boolean),per=clamp(Math.round(Number(st.wordsPerCaption)||5),2,12);
  if(!words.length)return [];
  const pieces=[];for(let i=0;i<words.length;i+=per)pieces.push(words.slice(i,i+per).join(" "));
  return pieces.map((txt,i)=>({text:txt,start:duration*i/pieces.length,end:duration*(i+1)/pieces.length}));
 }
 function wrap(ctx,text,maxWidth){
  const words=String(text).split(/\s+/),lines=[];let line="";
  for(const word of words){const next=line?line+" "+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next}
  if(line)lines.push(line);return lines.slice(0,3);
 }
 function draw(ctx,scene,time,sh){
  const st=style(sh);if(!st.enabled)return false;
  const cues=segments(scene,sh),cue=cues.find(c=>time>=c.start&&time<c.end)||cues.at(-1);
  if(!cue)return false;
  const w=ctx.canvas.width,h=ctx.canvas.height,dur=cue.end-cue.start,t=clamp(time-cue.start,0,dur),enter=clamp(t/Math.min(.24,dur*.35),0,1),exit=clamp((dur-t)/Math.min(.22,dur*.32),0,1);
  const ease=x=>1-Math.pow(1-x,3),en=ease(enter),ex=ease(exit);
  let a=1,dx=0,dy=0,scale=1;
  if(st.animationIn==="fade")a*=enter;
  if(st.animationIn==="rise")dy+=28*(1-en);
  if(st.animationIn==="slide-left")dx+=w*.19*(1-en);
  if(st.animationIn==="slide-right")dx-=w*.19*(1-en);
  if(st.animationIn==="pop")scale*=.78+.22*en;
  if(st.animationIn==="typewriter")a*=Math.max(.12,en);
  if(st.animationOut==="fade")a*=exit;
  if(st.animationOut==="rise")dy-=20*(1-ex);
  if(st.animationOut==="slide-left")dx-=w*.16*(1-ex);
  if(st.animationOut==="slide-right")dx+=w*.16*(1-ex);
  if(st.animationOut==="pop")scale*=.86+.14*ex;
  const fs=clamp(Number(st.fontSize)||40,20,72),x=clamp(Number(st.x)||50,8,92)*w/100;
  const baseline=st.position==="top"?h*.21:st.position==="middle"?h*.52:st.position==="custom"?clamp(Number(st.y)||84,10,92)*h/100:h*.83;
  ctx.save();ctx.globalAlpha*=clamp(a,0,1);ctx.translate(x+dx,baseline+dy);ctx.scale(scale,scale);
  ctx.font="900 "+fs+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
  const maxW=Math.min(w*.86,Math.max(110,2*Math.min(x,w-x)-12)),txt=st.uppercase?cue.text.toLocaleUpperCase():cue.text;
  const actual=st.animationIn==="typewriter"?txt.slice(0,Math.max(1,Math.ceil(txt.length*en))):txt;
  const lines=wrap(ctx,actual,maxW),lh=fs*1.22,top=-(lines.length-1)*lh/2;
  if(st.background==="box"){ctx.fillStyle="rgba(24,30,37,.8)";const boxW=maxW+28,boxH=lines.length*lh+22;ctx.beginPath();ctx.roundRect(-boxW/2,-boxH/2,boxW,boxH,12);ctx.fill()}
  if(st.shadow){ctx.shadowColor="rgba(0,0,0,.65)";ctx.shadowBlur=10;ctx.shadowOffsetY=3}
  lines.forEach((line,i)=>{
   const yy=top+i*lh,words=line.split(/\s+/),full=ctx.measureText(line).width;
   let cursor=-full/2;
   for(let j=0;j<words.length;j++){
    const word=words[j],wordW=ctx.measureText(word).width,spaceW=j<words.length-1?ctx.measureText(" ").width:0;
    const important=/\d|patent|invent|freedom|victor|first|stop|saf|signal|fiber|strong|light|escape|breakthrough|machine|wiper|bag|electric|intelligen|filament/i.test(word);
    const caution=/dead|injur|danger|burst|crash|fire|attack|sank|destroy|failure/i.test(word);
    ctx.lineWidth=Math.max(3,fs*.13);ctx.strokeStyle=st.stroke||defaults.stroke;ctx.strokeText(word,cursor+wordW/2,yy,Math.min(wordW,maxW));
    ctx.fillStyle=st.highlight&&caution?"#e78478":st.highlight&&important?(st.accent||defaults.accent):(st.color||defaults.color);
    ctx.fillText(word,cursor+wordW/2,yy,Math.min(wordW,maxW));cursor+=wordW+spaceW;
   }
  });
  ctx.restore();return true;
 }
 return{defaults,style,segments,draw};
})();
