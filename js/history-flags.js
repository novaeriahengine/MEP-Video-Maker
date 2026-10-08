window.MEPHistoryFlags=(()=>{
const ISO_CODES="AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW".split(" ");
const NAMES={
 AD:"Andorra",AE:"United Arab Emirates",AF:"Afghanistan",AG:"Antigua and Barbuda",AL:"Albania",AM:"Armenia",AO:"Angola",AR:"Argentina",AT:"Austria",AU:"Australia",AZ:"Azerbaijan",BA:"Bosnia and Herzegovina",BB:"Barbados",BD:"Bangladesh",BE:"Belgium",BF:"Burkina Faso",BG:"Bulgaria",BH:"Bahrain",BI:"Burundi",BJ:"Benin",BN:"Brunei",BO:"Bolivia",BR:"Brazil",BS:"Bahamas",BT:"Bhutan",BW:"Botswana",BY:"Belarus",BZ:"Belize",CA:"Canada",CD:"DR Congo",CF:"Central African Republic",CG:"Republic of the Congo",CH:"Switzerland",CI:"Côte d’Ivoire",CL:"Chile",CM:"Cameroon",CN:"China",CO:"Colombia",CR:"Costa Rica",CU:"Cuba",CV:"Cabo Verde",CY:"Cyprus",CZ:"Czechia",DE:"Germany",DJ:"Djibouti",DK:"Denmark",DM:"Dominica",DO:"Dominican Republic",DZ:"Algeria",EC:"Ecuador",EE:"Estonia",EG:"Egypt",ER:"Eritrea",ES:"Spain",ET:"Ethiopia",FI:"Finland",FJ:"Fiji",FM:"Micronesia",FR:"France",GA:"Gabon",GB:"United Kingdom",GD:"Grenada",GE:"Georgia",GH:"Ghana",GM:"Gambia",GN:"Guinea",GQ:"Equatorial Guinea",GR:"Greece",GT:"Guatemala",GW:"Guinea-Bissau",GY:"Guyana",HN:"Honduras",HR:"Croatia",HT:"Haiti",HU:"Hungary",ID:"Indonesia",IE:"Ireland",IL:"Israel",IN:"India",IQ:"Iraq",IR:"Iran",IS:"Iceland",IT:"Italy",JM:"Jamaica",JO:"Jordan",JP:"Japan",KE:"Kenya",KG:"Kyrgyzstan",KH:"Cambodia",KI:"Kiribati",KM:"Comoros",KN:"Saint Kitts and Nevis",KP:"North Korea",KR:"South Korea",KW:"Kuwait",KZ:"Kazakhstan",LA:"Laos",LB:"Lebanon",LC:"Saint Lucia",LI:"Liechtenstein",LK:"Sri Lanka",LR:"Liberia",LS:"Lesotho",LT:"Lithuania",LU:"Luxembourg",LV:"Latvia",LY:"Libya",MA:"Morocco",MC:"Monaco",MD:"Moldova",ME:"Montenegro",MG:"Madagascar",MH:"Marshall Islands",MK:"North Macedonia",ML:"Mali",MM:"Myanmar",MN:"Mongolia",MR:"Mauritania",MT:"Malta",MU:"Mauritius",MV:"Maldives",MW:"Malawi",MX:"Mexico",MY:"Malaysia",MZ:"Mozambique",NA:"Namibia",NE:"Niger",NG:"Nigeria",NI:"Nicaragua",NL:"Netherlands",NO:"Norway",NP:"Nepal",NR:"Nauru",NZ:"New Zealand",OM:"Oman",PA:"Panama",PE:"Peru",PG:"Papua New Guinea",PH:"Philippines",PK:"Pakistan",PL:"Poland",PS:"Palestine",PT:"Portugal",PW:"Palau",PY:"Paraguay",QA:"Qatar",RO:"Romania",RS:"Serbia",RU:"Russia",RW:"Rwanda",SA:"Saudi Arabia",SB:"Solomon Islands",SC:"Seychelles",SD:"Sudan",SE:"Sweden",SG:"Singapore",SI:"Slovenia",SK:"Slovakia",SL:"Sierra Leone",SM:"San Marino",SN:"Senegal",SO:"Somalia",SR:"Suriname",SS:"South Sudan",ST:"São Tomé and Príncipe",SV:"El Salvador",SY:"Syria",SZ:"Eswatini",TD:"Chad",TG:"Togo",TH:"Thailand",TJ:"Tajikistan",TL:"Timor-Leste",TM:"Turkmenistan",TN:"Tunisia",TO:"Tonga",TR:"Türkiye",TT:"Trinidad and Tobago",TV:"Tuvalu",TW:"Taiwan",TZ:"Tanzania",UA:"Ukraine",UG:"Uganda",US:"United States",UY:"Uruguay",UZ:"Uzbekistan",VA:"Vatican City",VC:"Saint Vincent and the Grenadines",VE:"Venezuela",VN:"Vietnam",VU:"Vanuatu",WS:"Samoa",YE:"Yemen",ZA:"South Africa",ZM:"Zambia",ZW:"Zimbabwe"
};
const HISTORICAL={
 US:[
  {from:1775,to:1776,id:"grand-union",label:"Thirteen Colonies — Grand Union",pattern:"grandUnion"},
  {from:1777,to:1794,id:"us-13",label:"United States — 13-star flag",pattern:"us13"},
  {from:1795,to:1817,id:"us-15",label:"United States — 15-star flag",pattern:"us15"},
  {from:1818,to:1860,id:"us-union-19c",label:"United States — Union",pattern:"usUnion"},
  {from:1861,to:1865,id:"union",label:"United States / Union",pattern:"usUnion"},
  {from:1866,to:9999,id:"us",label:"United States",pattern:"emoji"}
 ],
 CSA:[{from:1861,to:1865,id:"confederate-battle",label:"Confederate battle flag (historical)",pattern:"confederate"}],
 GB:[
  {from:1600,to:1706,id:"england",label:"Kingdom of England",pattern:"stGeorge"},
  {from:1707,to:1800,id:"great-britain",label:"Kingdom of Great Britain",pattern:"union1707"},
  {from:1801,to:9999,id:"uk",label:"United Kingdom",pattern:"union1801"}
 ],
 FR:[
  {from:1600,to:1789,id:"bourbon",label:"Kingdom of France",pattern:"bourbon"},
  {from:1790,to:1814,id:"tricolor",label:"France — Tricolor",pattern:"france"},
  {from:1815,to:1829,id:"bourbon-restoration",label:"Bourbon Restoration",pattern:"bourbon"},
  {from:1830,to:9999,id:"france",label:"France",pattern:"france"}
 ],
 ES:[
  {from:1600,to:1784,id:"burgundy",label:"Spanish Monarchy — Cross of Burgundy",pattern:"burgundy"},
  {from:1785,to:1930,id:"spain-red-yellow",label:"Spain — red-yellow-red",pattern:"spain"},
  {from:1931,to:1938,id:"spanish-republic",label:"Spanish Republic",pattern:"spainRepublic"},
  {from:1939,to:9999,id:"spain",label:"Spain",pattern:"spain"}
 ],
 HT:[
  {from:1791,to:1802,id:"saint-domingue",label:"Saint-Domingue / French colonial era",pattern:"france"},
  {from:1803,to:1803,id:"haiti-revolution",label:"Haitian revolutionary bicolor",pattern:"haiti"},
  {from:1804,to:9999,id:"haiti",label:"Haiti",pattern:"haiti"}
 ],
 BR:[
  {from:1600,to:1815,id:"colonial-brazil",label:"Colonial Brazil / Portuguese monarchy",pattern:"portugalRoyal"},
  {from:1816,to:1821,id:"uk-portugal-brazil",label:"United Kingdom of Portugal, Brazil and the Algarves",pattern:"portugalRoyal"},
  {from:1822,to:1888,id:"empire-brazil",label:"Empire of Brazil",pattern:"brazilEmpire"},
  {from:1889,to:9999,id:"brazil",label:"Brazil",pattern:"brazil"}
 ],
 PT:[
  {from:1600,to:1815,id:"portugal-royal",label:"Kingdom of Portugal",pattern:"portugalRoyal"},
  {from:1816,to:1821,id:"uk-portugal-brazil",label:"United Kingdom of Portugal, Brazil and the Algarves",pattern:"portugalRoyal"},
  {from:1822,to:1910,id:"portugal-monarchy",label:"Kingdom of Portugal",pattern:"portugalRoyal"},
  {from:1911,to:9999,id:"portugal",label:"Portugal",pattern:"emoji"}
 ],
 NL:[
  {from:1600,to:1649,id:"princes-flag",label:"Dutch Republic — Prince’s Flag",pattern:"prince"},
  {from:1650,to:9999,id:"netherlands",label:"Netherlands",pattern:"netherlands"}
 ],
 RU:[
  {from:1696,to:1857,id:"russia-tricolor",label:"Russian Empire — tricolor",pattern:"russia"},
  {from:1858,to:1882,id:"russia-imperial",label:"Russian Empire — black/yellow/white",pattern:"russiaImperial"},
  {from:1883,to:1917,id:"russia-tricolor-empire",label:"Russian Empire — tricolor",pattern:"russia"},
  {from:1922,to:1991,id:"ussr",label:"Soviet Union",pattern:"ussr"},
  {from:1992,to:9999,id:"russia",label:"Russia",pattern:"russia"}
 ],
 DE:[
  {from:1871,to:1918,id:"german-empire",label:"German Empire",pattern:"germanEmpire"},
  {from:1919,to:1932,id:"weimar",label:"Weimar Germany",pattern:"germany"},
  {from:1933,to:1945,id:"germany-1933",label:"Germany (1933–1945; symbol simplified)",pattern:"germany1933"},
  {from:1949,to:9999,id:"germany",label:"Germany",pattern:"germany"}
 ],
 PRU:[{from:1701,to:1871,id:"prussia",label:"Kingdom of Prussia",pattern:"prussia"}],
 HRE:[{from:1600,to:1806,id:"hre",label:"Holy Roman Empire",pattern:"hre"}],
 AT:[
  {from:1700,to:1866,id:"habsburg",label:"Habsburg Monarchy / Austrian Empire",pattern:"habsburg"},
  {from:1867,to:1918,id:"austria-hungary",label:"Austria-Hungary",pattern:"habsburg"},
  {from:1919,to:9999,id:"austria",label:"Austria",pattern:"austria"}
 ],
 OTT:[{from:1600,to:1922,id:"ottoman",label:"Ottoman Empire",pattern:"ottoman"}],
 MX:[
  {from:1821,to:1863,id:"mexico-first",label:"Mexico",pattern:"mexico"},
  {from:1864,to:1867,id:"mexican-empire",label:"Second Mexican Empire",pattern:"mexicoEmpire"},
  {from:1868,to:9999,id:"mexico",label:"Mexico",pattern:"mexico"}
 ],
 GC:[{from:1819,to:1831,id:"gran-colombia",label:"Gran Colombia",pattern:"granColombia"}],
 JP:[
  {from:1600,to:1867,id:"tokugawa",label:"Tokugawa Japan (stylized mon)",pattern:"japanMon"},
  {from:1868,to:9999,id:"japan",label:"Japan",pattern:"japan"}
 ],
 CN:[
  {from:1644,to:1911,id:"qing",label:"Qing dynasty",pattern:"qing"},
  {from:1912,to:1948,id:"roc",label:"Republic of China",pattern:"roc"},
  {from:1949,to:9999,id:"china",label:"China",pattern:"china"}
 ],
 IR:[
  {from:1600,to:1735,id:"safavid",label:"Safavid Persia (stylized)",pattern:"persia"},
  {from:1736,to:1924,id:"persia",label:"Persia (stylized)",pattern:"persia"},
  {from:1925,to:1978,id:"iran-monarchy",label:"Iran — monarchy era",pattern:"iranMonarchy"},
  {from:1979,to:9999,id:"iran",label:"Iran",pattern:"emoji"}
 ],
 IN:[
  {from:1600,to:1857,id:"mughal",label:"Mughal Empire (stylized)",pattern:"mughal"},
  {from:1858,to:1946,id:"british-india",label:"British India (stylized)",pattern:"britishIndia"},
  {from:1947,to:9999,id:"india",label:"India",pattern:"india"}
 ]
};
const SPECIAL_NAMES={CSA:"Confederate States (historical)",PRU:"Prussia",HRE:"Holy Roman Empire",OTT:"Ottoman Empire",GC:"Gran Colombia"};
function emoji(code){if(!/^[A-Z]{2}$/.test(code))return "🏳️";return String.fromCodePoint(...code.split("").map(c=>127397+c.charCodeAt(0)))}
function name(code){return SPECIAL_NAMES[code]||NAMES[code]||code}
function resolve(code,year=2026,variant="auto"){
 const list=HISTORICAL[code]||[];
 if(variant&&variant!=="auto"){const exact=list.find(x=>x.id===variant);if(exact)return{...exact,code,name:name(code),emoji:emoji(code)}}
 const hit=list.find(x=>year>=x.from&&year<=x.to);
 if(hit)return{...hit,code,name:name(code),emoji:emoji(code)};
 return{from:-9999,to:9999,id:"modern",label:name(code)+" — modern fallback",pattern:"emoji",code,name:name(code),emoji:emoji(code)}
}
function options(year=2026){
 const activeSpecial=Object.keys(HISTORICAL).filter(code=>(HISTORICAL[code]||[]).some(x=>year>=x.from&&year<=x.to));
 const all=[...new Set([...activeSpecial,...ISO_CODES])];
 return all.map(code=>{const f=resolve(code,year);return{code,name:name(code),label:f.label,emoji:f.emoji,historical:activeSpecial.includes(code)}}).sort((a,b)=>(a.historical===b.historical?0:a.historical?-1:1)||a.name.localeCompare(b.name))
}
function stripe(ctx,x,y,w,h,colors){const hh=h/colors.length;colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(x,y+i*hh,w,hh+1)})}
function star(ctx,cx,cy,r,fill="#fff"){ctx.fillStyle=fill;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.42:r,px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill()}
function render(ctx,x,y,w,h,flag){
 const p=flag?.pattern||"emoji";ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle="#eee";ctx.fillRect(x,y,w,h);
 if(p==="emoji"){ctx.font=Math.floor(Math.min(w,h)*.72)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(flag?.emoji||"🏳️",x+w/2,y+h/2);ctx.restore();return}
 if(p==="france")stripe(ctx,x,y,w,h,["#0055A4","#fff","#EF4135"]);
 else if(p==="haiti"){ctx.fillStyle="#00209F";ctx.fillRect(x,y,w,h/2);ctx.fillStyle="#D21034";ctx.fillRect(x,y+h/2,w,h/2)}
 else if(p==="netherlands")stripe(ctx,x,y,w,h,["#AE1C28","#fff","#21468B"]);
 else if(p==="prince")stripe(ctx,x,y,w,h,["#F36C21","#fff","#21468B"]);
 else if(p==="russia")stripe(ctx,x,y,w,h,["#fff","#0039A6","#D52B1E"]);
 else if(p==="russiaImperial")stripe(ctx,x,y,w,h,["#000","#FFD700","#fff"]);
 else if(p==="germanEmpire")stripe(ctx,x,y,w,h,["#000","#fff","#D00"]);
 else if(p==="germany")stripe(ctx,x,y,w,h,["#000","#DD0000","#FFCE00"]);
 else if(p==="germany1933"){ctx.fillStyle="#b00000";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.23,0,Math.PI*2);ctx.fill();ctx.fillStyle="#222";ctx.font=Math.floor(Math.min(w,h)*.16)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("1933–45",x+w/2,y+h/2)}
 else if(p==="austria")stripe(ctx,x,y,w,h,["#ED2939","#fff","#ED2939"]);
 else if(p==="habsburg")stripe(ctx,x,y,w,h,["#000","#F6D32D"]);
 else if(p==="spain")stripe(ctx,x,y,w,h,["#AA151B","#F1BF00","#F1BF00","#AA151B"]);
 else if(p==="spainRepublic")stripe(ctx,x,y,w,h,["#D12421","#F1BF00","#6B2C91"]);
 else if(p==="burgundy"){ctx.fillStyle="#f6efd8";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#a5142d";ctx.lineWidth=Math.max(6,w*.08);ctx.beginPath();ctx.moveTo(x+w*.12,y+h*.08);ctx.lineTo(x+w*.88,y+h*.92);ctx.moveTo(x+w*.88,y+h*.08);ctx.lineTo(x+w*.12,y+h*.92);ctx.stroke()}
 else if(p==="stGeorge"){ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.fillStyle="#C8102E";ctx.fillRect(x,y+h*.42,w,h*.16);ctx.fillRect(x+w*.42,y,w*.16,h)}
 else if(p==="union1707"||p==="union1801"||p==="grandUnion"){ctx.fillStyle="#012169";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#fff";ctx.lineWidth=Math.max(9,w*.1);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y);ctx.lineTo(x,y+h);ctx.stroke();ctx.strokeStyle="#C8102E";ctx.lineWidth=Math.max(4,w*.045);ctx.stroke();ctx.fillStyle="#fff";ctx.fillRect(x,y+h*.4,w,h*.2);ctx.fillRect(x+w*.4,y,w*.2,h);ctx.fillStyle="#C8102E";ctx.fillRect(x,y+h*.445,w,h*.11);ctx.fillRect(x+w*.445,y,w*.11,h);if(p==="grandUnion"){ctx.fillStyle="#b22234";for(let i=0;i<7;i+=2)ctx.fillRect(x,y+i*h/7,w,h/7)}}
 else if(p==="us13"||p==="us15"||p==="usUnion"){for(let i=0;i<13;i++){ctx.fillStyle=i%2?"#fff":"#B22234";ctx.fillRect(x,y+i*h/13,w,h/13+1)}ctx.fillStyle="#3C3B6E";ctx.fillRect(x,y,w*.45,h*.54);const count=p==="us13"?13:p==="us15"?15:20;for(let i=0;i<count;i++)star(ctx,x+w*.045+(i%5)*w*.078,y+h*.06+Math.floor(i/5)*h*.1,Math.min(w,h)*.018)}
 else if(p==="confederate"){ctx.fillStyle="#b22234";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#fff";ctx.lineWidth=Math.max(10,w*.12);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y);ctx.lineTo(x,y+h);ctx.stroke();ctx.strokeStyle="#253b80";ctx.lineWidth=Math.max(6,w*.07);ctx.stroke();for(let i=0;i<6;i++){star(ctx,x+w*(.12+i*.15),y+h*(.13+i*.145),Math.min(w,h)*.025);star(ctx,x+w*(.88-i*.15),y+h*(.13+i*.145),Math.min(w,h)*.025)}}
 else if(p==="bourbon"){ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.fillStyle="#2c54a3";for(let yy=.2;yy<.9;yy+=.3)for(let xx=.18;xx<.9;xx+=.28){ctx.font=Math.floor(Math.min(w,h)*.12)+"px serif";ctx.fillText("⚜",x+w*xx,y+h*yy)}}
 else if(p==="portugalRoyal"){ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.fillStyle="#1f4b8f";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(x+w*.44,y+h*.35,w*.12,h*.3)}
 else if(p==="brazilEmpire"||p==="brazil"){ctx.fillStyle="#009B3A";ctx.fillRect(x,y,w,h);ctx.fillStyle="#FFDF00";ctx.beginPath();ctx.moveTo(x+w/2,y+h*.08);ctx.lineTo(x+w*.92,y+h/2);ctx.lineTo(x+w/2,y+h*.92);ctx.lineTo(x+w*.08,y+h/2);ctx.closePath();ctx.fill();ctx.fillStyle="#002776";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.2,0,Math.PI*2);ctx.fill()}
 else if(p==="ottoman"){ctx.fillStyle="#c8102e";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+w*.46,y+h*.5,Math.min(w,h)*.22,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c8102e";ctx.beginPath();ctx.arc(x+w*.51,y+h*.5,Math.min(w,h)*.18,0,Math.PI*2);ctx.fill();star(ctx,x+w*.66,y+h*.5,Math.min(w,h)*.07)}
 else if(p==="hre"){ctx.fillStyle="#f5d33b";ctx.fillRect(x,y,w,h);ctx.fillStyle="#111";ctx.beginPath();ctx.arc(x+w*.5,y+h*.5,Math.min(w,h)*.25,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f5d33b";ctx.font=Math.floor(Math.min(w,h)*.18)+"px serif";ctx.textAlign="center";ctx.fillText("II",x+w*.5,y+h*.55)}
 else if(p==="prussia"){ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.fillStyle="#111";ctx.beginPath();ctx.arc(x+w*.5,y+h*.5,Math.min(w,h)*.23,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font=Math.floor(Math.min(w,h)*.14)+"px serif";ctx.textAlign="center";ctx.fillText("P",x+w*.5,y+h*.55)}
 else if(p==="ussr"){ctx.fillStyle="#c8102e";ctx.fillRect(x,y,w,h);star(ctx,x+w*.22,y+h*.28,Math.min(w,h)*.09,"#ffd700")}
 else if(p==="mexico"||p==="mexicoEmpire"){ctx.fillStyle="#006847";ctx.fillRect(x,y,w/3,h);ctx.fillStyle="#fff";ctx.fillRect(x+w/3,y,w/3,h);ctx.fillStyle="#ce1126";ctx.fillRect(x+2*w/3,y,w/3,h);ctx.fillStyle="#8b6b2f";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.08,0,Math.PI*2);ctx.fill()}
 else if(p==="granColombia")stripe(ctx,x,y,w,h,["#FCD116","#FCD116","#003893","#CE1126"]);
 else if(p==="japan"||p==="japanMon"){ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.fillStyle=p==="japan"?"#BC002D":"#202020";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.22,0,Math.PI*2);ctx.fill()}
 else if(p==="qing"){ctx.fillStyle="#f4d03f";ctx.fillRect(x,y,w,h);ctx.fillStyle="#1b4d9b";ctx.beginPath();ctx.arc(x+w*.55,y+h*.52,Math.min(w,h)*.18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d13f32";star(ctx,x+w*.72,y+h*.3,Math.min(w,h)*.07)}
 else if(p==="roc"){ctx.fillStyle="#d32020";ctx.fillRect(x,y,w,h);ctx.fillStyle="#102f7c";ctx.fillRect(x,y,w*.45,h*.5);star(ctx,x+w*.22,y+h*.25,Math.min(w,h)*.11)}
 else if(p==="china"){ctx.fillStyle="#de2910";ctx.fillRect(x,y,w,h);star(ctx,x+w*.22,y+h*.28,Math.min(w,h)*.11,"#ffde00")}
 else if(p==="persia"||p==="iranMonarchy"){stripe(ctx,x,y,w,h,["#239f40","#fff","#da0000"]);ctx.fillStyle="#d6b33f";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.09,0,Math.PI*2);ctx.fill()}
 else if(p==="mughal"){ctx.fillStyle="#2c7a4b";ctx.fillRect(x,y,w,h);ctx.fillStyle="#f0d35a";ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.18,0,Math.PI*2);ctx.fill()}
 else if(p==="britishIndia"){ctx.fillStyle="#c94b45";ctx.fillRect(x,y,w,h);ctx.fillStyle="#1d4b7b";ctx.fillRect(x,y,w*.45,h*.5);ctx.fillStyle="#fff";ctx.font=Math.floor(Math.min(w,h)*.18)+"px serif";ctx.textAlign="center";ctx.fillText("IND",x+w*.68,y+h*.58)}
 else if(p==="india"){stripe(ctx,x,y,w,h,["#FF9933","#fff","#138808"]);ctx.strokeStyle="#000080";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.09,0,Math.PI*2);ctx.stroke()}
 else{ctx.fillStyle="#ddd";ctx.fillRect(x,y,w,h);ctx.font=Math.floor(Math.min(w,h)*.72)+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(flag?.emoji||"🏳️",x+w/2,y+h/2)}
 ctx.restore()
}
return{ISO_CODES,NAMES,HISTORICAL,name,emoji,resolve,options,render};
})();