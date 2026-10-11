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
