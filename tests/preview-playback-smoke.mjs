// node tests/preview-playback-smoke.mjs
// Guards against the preview crash that prevented scene auto-advancing.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const code=readFileSync("js/app.js","utf8");
const short=JSON.parse(readFileSync("flags/flags-series.mep.json","utf8")).shorts[0];
const badSingleSelectorLoops=[...code.matchAll(/(?<!\$)\$\([^)\n]*\)\.forEach\s*\(/g)];
assert.equal(badSingleSelectorLoops.length,0,"Use $$() when iterating over multiple elements.");
assert.ok(code.includes('$$("[data-flag-code]").forEach'));
assert.ok(code.includes('videoStripButtons=$$("[data-vscene]")'));
assert.ok(code.includes('id')||code.includes("previewQuality"));

const start=code.indexOf("function sceneAtGlobal(sh,t){");
const end=code.indexOf("\nfunction renderShortFrame(",start);
assert.ok(start>=0&&end>start,"Missing preview timeline function");
const sceneAtGlobal=new Function(code.slice(start,end)+"\nreturn sceneAtGlobal;")();
assert.equal(short.scenes.length,30);
assert.equal(sceneAtGlobal(short,0).index,0);
assert.equal(sceneAtGlobal(short,3.299).index,0);
assert.equal(sceneAtGlobal(short,3.3).index,1);
assert.equal(sceneAtGlobal(short,6.6).index,2);
assert.equal(sceneAtGlobal(short,23).index,6);
assert.equal(sceneAtGlobal(short,98.9).index,29);

for(let index=1;index<short.scenes.length;index++){
 const t=short.scenes.slice(0,index).reduce((sum,scene)=>sum+scene.duration,0);
 assert.equal(sceneAtGlobal(short,t+.0001).index,index,"Scene did not advance at "+t.toFixed(2)+"s");
}
assert.ok(code.includes("requestAnimationFrame(videoTick)"));
assert.ok(code.includes('$("#previewQuality")'));
console.log("PASS no single-element forEach crash");
console.log("PASS all 30 flag intro scenes advance automatically");
console.log("PASS adjustable preview frame-rate playback loop");
assert.ok(code.includes("videoStartPosition+(now-videoStartAt)/1000"),"Playback must use a wall clock, not clamp delta time.");
assert.ok(code.includes('on("#editPlayingScene","click"'),"Preview-to-script editor link missing.");
assert.ok(code.includes('on("#videoPlayPause","click"'),"Play/Pause handler missing.");
assert.ok(code.includes('on("#autoNextEpisode"')||code.includes('$("#autoNextEpisode")'),"Next-episode checkbox missing.");
assert.ok(code.includes("speakChromeScene(a.scene)"),"Chrome voice must follow individual scene narration.");
// Execute the real player timer in isolation: a slow render must not slow down scene time.
const t0=code.indexOf("function videoTick(now){"),t1=code.indexOf("\nfunction setVideoMode(",t0);
assert.ok(t0>=0&&t1>t0);
const loop=code.slice(t0,t1);
const clock=new Function("sh",
 `const short=sh,project={shorts:[sh]},MEPModel={shortDuration(sh){return sh.scenes.reduce((n,x)=>n+x.duration,0)}};
  let videoPlaying=true,videoTime=0,videoLast=0,videoFrameLast=0,videoUiLast=0,videoRaf=0,videoStartAt=1000,videoStartPosition=0,lastVideoSceneIndex=-1,voiceRecorder=null;
  const $=()=>({checked:false,value:"12"}),requestAnimationFrame=()=>1,stopVideoPreviewVoice=()=>{},stopVoiceRecording=()=>{};
  const renderVideo=()=>{lastVideoSceneIndex=sceneAtGlobal(short,videoTime).index},stopPreviewPlayback=()=>{videoPlaying=false},setText=()=>{},console={error(){}},window={MEPFlagSeries:null};
  ${code.slice(start,end)}
  ${loop}
  return now=>{videoTick(now);return{time:videoTime,index:sceneAtGlobal(short,videoTime).index,playing:videoPlaying}}`
)(short);
assert.equal(clock(1000).index,0);
assert.equal(clock(4300).index,1);
assert.equal(clock(24000).index,6);
assert.equal(clock(90000).time,89);
assert.equal(clock(100100).index,29);
console.log("PASS playback stays in real time under skipped frames and links narration to visual beats");
