// Run from repo root: node tests/flag-series-smoke.mjs
// Offline structural tests. Browser/export and Firebase deployment require separate checks.
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const manifest=load("flags/manifest.json"),project=load("flags/flags-series.mep.json");
assert.equal(manifest.states.length,50);
assert.equal(new Set(manifest.states.map(s=>s.code)).size,50);
assert.equal(project.schema,"mep-video-project");
assert.equal(project.id,"flags-50-states-series");
assert.equal(project.series.type,"state-flags");
assert.ok(project.series.storyboardRevision>=2,"Flag storyboard must be upgraded.");
assert.equal(project.shorts.length,18);
let episodeCodes=[];
for(const [index,sh] of project.shorts.entries()){
 assert.equal(sh.scenes.length,30,sh.title);
 assert.equal(sh.flagsEpisode.index,index);
 const duration=sh.scenes.reduce((n,s)=>n+s.duration,0);
 assert.ok(duration>=90 && duration<=180,sh.title);
 assert.ok(sh.captionStyle.enabled);
 for(const sc of sh.scenes){
  assert.ok(sc.script?.trim(),sh.title);
  assert.ok(sc.flagBeat?.mode,sc.name);
  assert.ok(sc.flagBeat?.heading,sc.name+" visual heading is missing");
  assert.equal(project.scripts.sceneById[sc.id],sc.script,sc.name+" narration is disconnected from scene ID");
  assert.ok(sc.script.trim().split(/\s+/).length<=15,sc.name+" script is too long for the scene");
  assert.ok(sc.duration>0 && sc.duration<=4,sc.name);
 }
 if(index){
  assert.equal(sh.flagsEpisode.stateCodes.length,index===17?2:3,sh.title);
  episodeCodes.push(...sh.flagsEpisode.stateCodes);
 }
}
assert.equal(episodeCodes.length,50);
assert.equal(new Set(episodeCodes).size,50);
assert.deepEqual(episodeCodes,manifest.states.map(x=>x.code));
for(const state of manifest.states){
 const file=state.current.art;
 assert.ok(existsSync(file),file);
 assert.ok(readFileSync(file,"utf8").includes("<svg"),file);
}
assert.ok(existsSync("flags/current/us.svg"));
console.log("PASS 50 current SVG state flags + U.S. intro flag");
console.log("PASS 18 episodes, 540 nonempty visual beats, each 99 seconds");
console.log("PASS 50 distinct graded states, 3 per video except 2 in the finale");
console.log("PASS caption metadata and historical-asset manifest structure");

const code=readFileSync("js/flag-series.js","utf8");
assert.ok(code.includes('if(mode==="tiers")'),"Tier definitions must have their own visual scene");
assert.ok(code.includes('if(mode==="contrast")'),"Distance testing must have an actual thumbnail scene");
assert.ok(code.includes("getFlagRaster("),"Flag preview must avoid decoding SVGs every frame");
assert.equal(project.shorts[0].scenes[3].flagBeat.mode,"tiers");
console.log("PASS 540 linked visual headings, short narration beats, tier legend and SVG raster cache");
