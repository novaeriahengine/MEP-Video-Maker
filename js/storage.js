window.MEPStorage=(()=>{
const KEY="mep-video-maker-project-v1";
function save(p){localStorage.setItem(KEY,JSON.stringify(p));}
function load(){try{const p=JSON.parse(localStorage.getItem(KEY));return p&&p.version?p:null}catch{return null}}
function download(p){const blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(p.name||"mep-project").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".mep.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
return{save,load,download};
})();