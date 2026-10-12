// Turns a narrated place reference into an explicit visual instruction.  This
// is deliberately deterministic: a scene can be reviewed and adjusted before
// any future LLM is involved.
window.MEPVisualDirector=(()=>{
 const countries=[
  ["AG","Antigua and Barbuda"],["AR","Argentina"],["BB","Barbados"],["BO","Bolivia"],["BR","Brazil"],["BS","Bahamas"],["BZ","Belize"],["CA","Canada"],["CL","Chile"],["CO","Colombia"],["CR","Costa Rica"],["CU","Cuba"],["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["GD","Grenada"],["GT","Guatemala"],["GY","Guyana"],["HN","Honduras"],["HT","Haiti"],["JM","Jamaica"],["KN","Saint Kitts and Nevis"],["LC","Saint Lucia"],["MX","Mexico"],["NI","Nicaragua"],["PA","Panama"],["PE","Peru"],["PY","Paraguay"],["SR","Suriname"],["SV","El Salvador"],["TT","Trinidad and Tobago"],["US","United States"],["UY","Uruguay"],["VC","Saint Vincent and the Grenadines"],["VE","Venezuela"]
 ].map(([code,name])=>({code,name,rx:new RegExp("\\b"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/ /g,"\\s+")+"\\b","i")}));
 countries.find(x=>x.code==="US").rx=/\b(united states|u\.?s\.?a?\.?|american)\b/i;
 countries.find(x=>x.code==="BS").rx=/\b(the\s+bahamas|bahamas)\b/i;
 const states={
  AL:["Alabama",-86.8,32.8],AK:["Alaska",-152.4,64.2],AZ:["Arizona",-111.7,34.2],AR:["Arkansas",-92.4,34.9],CA:["California",-119.7,37.3],CO:["Colorado",-105.5,39.0],CT:["Connecticut",-72.7,41.6],DE:["Delaware",-75.5,39.0],FL:["Florida",-81.7,27.8],GA:["Georgia",-83.4,32.7],HI:["Hawaii",-155.5,19.8],ID:["Idaho",-114.7,44.2],IL:["Illinois",-89.4,40.0],IN:["Indiana",-86.1,40.0],IA:["Iowa",-93.5,42.0],KS:["Kansas",-98.2,38.5],KY:["Kentucky",-85.3,37.6],LA:["Louisiana",-91.9,31.1],ME:["Maine",-69.1,45.3],MD:["Maryland",-76.7,39.0],MA:["Massachusetts",-71.8,42.3],MI:["Michigan",-85.5,44.3],MN:["Minnesota",-94.2,46.3],MS:["Mississippi",-89.7,32.7],MO:["Missouri",-92.6,38.5],MT:["Montana",-109.5,46.9],NE:["Nebraska",-99.8,41.5],NV:["Nevada",-116.6,39.3],NH:["New Hampshire",-71.6,43.7],NJ:["New Jersey",-74.5,40.1],NM:["New Mexico",-106.1,34.4],NY:["New York",-75.5,42.9],NC:["North Carolina",-79.4,35.5],ND:["North Dakota",-100.5,47.5],OH:["Ohio",-82.8,40.3],OK:["Oklahoma",-97.5,35.6],OR:["Oregon",-120.6,43.9],PA:["Pennsylvania",-77.8,40.9],RI:["Rhode Island",-71.5,41.7],SC:["South Carolina",-80.9,33.8],SD:["South Dakota",-100.2,44.4],TN:["Tennessee",-86.4,35.8],TX:["Texas",-99.9,31.0],UT:["Utah",-111.7,39.4],VT:["Vermont",-72.7,44.1],VA:["Virginia",-78.7,37.5],WA:["Washington",-120.7,47.4],WV:["West Virginia",-80.6,38.6],WI:["Wisconsin",-89.7,44.6],WY:["Wyoming",-107.6,43.0]
 };
 const cities={
  "new york":["New York City","US",-74.006,40.713],"washington, d.c.":["Washington, D.C.","US",-77.037,38.907],"los angeles":["Los Angeles","US",-118.244,34.052],"chicago":["Chicago","US",-87.630,41.878],"houston":["Houston","US",-95.370,29.760],"miami":["Miami","US",-80.192,25.762],"mexico city":["Mexico City","MX",-99.133,19.433],"port-au-prince":["Port-au-Prince","HT",-72.307,18.594],"brasilia":["Brasília","BR",-47.882,-15.794],"buenos aires":["Buenos Aires","AR",-58.382,-34.604]
 };
 const rx=value=>new RegExp("\\b"+value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/ /g,"\\s+")+"\\b","i");
 function locate(text=""){
  const clean=String(text||"");
  for(const [key,[label,country,lon,lat]] of Object.entries(cities))if(rx(key).test(clean))return{kind:"city",country,label,longitude:lon,latitude:lat,zoom:1.16};
  for(const [code,[label,lon,lat]] of Object.entries(states))if(rx(label).test(clean))return{kind:"state",country:"US",state:code,label,longitude:lon,latitude:lat,zoom:1.18};
  const found=countries.find(item=>item.rx.test(clean));
  return found?{kind:"country",country:found.code,label:found.name,zoom:1.08}:null;
 }
 function apply(scene,{text=scene?.script||"",force=false}={}){
  if(!scene)return null;const location=locate(text);if(!location)return null;
  const before=JSON.stringify({mapHighlights:scene.mapHighlights||[],mapFocus:scene.mapFocus||null,flagDisplay:scene.flagDisplay||null});
  scene.mapHighlights=[...new Set([...(scene.mapHighlights||[]),location.country])];
  scene.mapFocus={...(scene.mapFocus||{}),...location,auto:true};
  if((force||!scene.flagDisplay)&&location.country)scene.flagDisplay={code:location.country,title:location.kind==="state"?"United States":""+location.label,subtitle:location.kind==="state"?location.label:"Map focus · "+location.label,layout:"side",startScale:.9,endScale:1.05,designNote:location.kind==="state"?location.label.toUpperCase()+" HIGHLIGHTED":""};
  if(force||!scene.visualIntent)scene.visualIntent="Map zooms to "+location.label+"; show the exact "+location.country+" flag as the narration names it.";
  return{location,changed:before!==JSON.stringify({mapHighlights:scene.mapHighlights||[],mapFocus:scene.mapFocus||null,flagDisplay:scene.flagDisplay||null})};
 }
 return{countries,states,cities,locate,apply};
})();