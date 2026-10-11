// Narration-only normalization: preserve written scene text and captions.
window.MEPSpeech=(()=>{
 function normalize(text){
  return String(text||"")
    .replace(/\b(?:WWII|W\.W\.I\.I\.)\b/gi,"World War Two")
    .replace(/\b(?:WWI|W\.W\.I\.)\b/gi,"World War One")
    .replace(/\bWorld\s+War\s+(?:II|2)\b/gi,"World War Two")
    .replace(/\bWorld\s+War\s+(?:I|1)\b/gi,"World War One")
    .replace(/\b(?:First\s+World\s+War)\b/gi,"World War One")
    .replace(/\b(?:Second\s+World\s+War)\b/gi,"World War Two");
 }
 return {normalize};
})();
