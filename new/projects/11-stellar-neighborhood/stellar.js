(function stellarAtlas(){
"use strict";
const source=window.STELLAR_SOURCE;
const $=id=>document.getElementById(id);
const number=(value,digits=1)=>Number(value).toLocaleString("en-US",{maximumFractionDigits:digits});
const svgNS="http://www.w3.org/2000/svg";
const aliases={"GJ 551":"Proxima Centauri","GJ 699":"Barnard's Star","GJ 71":"Tau Ceti","GJ 820":"61 Cygni","GJ 166":"40 Eridani","GJ 559":"Alpha Centauri","GJ 406":"Wolf 359","GJ 144":"Epsilon Eridani","GJ 244":"Sirius","GJ 845":"Epsilon Indi"};
const colors={M:"#ffad85",K:"#ffd69b",G:"#f4e6b4",F:"#d3edff",A:"#91c9ef",D:"#b4d9e3",L:"#b696e8",T:"#9279d0",Y:"#7b65bc"};
const VOYAGER_KM_S=17, LIGHT_KM_S=299792.458;
const state={yaw:-.55,pitch:.24,zoom:1,radius:22,stellarClass:"all",mode:"all",selected:"GJ 551",work:null,auto:false,drag:null,points:[]};
let rows=[],works=[],systems=new Map(),worksBySystem=new Map(),canvas,ctx,viewWidth=0,viewHeight=0,frame=0;

function parseRA(value){const parts=String(value||"").trim().split(/\s+/).map(Number);return parts.length===3&&parts.every(Number.isFinite)?15*(parts[0]+parts[1]/60+parts[2]/3600):NaN}
function parseDec(value){const raw=String(value||"").trim(),parts=raw.replace(/^[+-]/,"").split(/\s+/).map(Number);return parts.length===3&&parts.every(Number.isFinite)?(raw.startsWith("-")?-1:1)*(parts[0]+parts[1]/60+parts[2]/3600):NaN}
function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el}
function svg(tag,attrs){const el=document.createElementNS(svgNS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el}
function label(id,text){$(id).textContent=String(text)}
function systemName(id){return aliases[id]||systems.get(id)?.[0]?.display||id}
function representative(id){return systems.get(id)?.[0]}
function visible(){
 return rows.filter(v=>v.distance<=state.radius&&(state.stellarClass==="all"||v.type===state.stellarClass)&&(state.mode!=="literature"||worksBySystem.has(v.cns_name)));
}
function keyCount(arr){return new Set(arr.map(v=>v.cns_name)).size}
function atDistance(id){return representative(id)?.distance||0}
function sourceRow(v,index){
 const d=Number(v.distance_ly),ra=parseRA(v.ra_2000),dec=parseDec(v.dec_2000),a=ra*Math.PI/180,b=dec*Math.PI/180;
 const type=String(v.spectral_type||"").trim()[0]?.toUpperCase()||"?";
 return {...v,index,distance:d,ra,dec,type,isBrown:["L","T","Y"].includes(type),display:v.common_name||[v.cns_name,v.component].filter(Boolean).join(" "),x:d*Math.cos(b)*Math.cos(a),y:d*Math.cos(b)*Math.sin(a),z:d*Math.sin(b)};
}
function prepare(){
 if(!source||!Array.isArray(source.catalog)||!Array.isArray(source.media?.works))throw Error("The standalone data module is missing. Run python tools/build_stellar_data.py.");
 const raw=source.catalog,nonSun=raw.filter(v=>Number(v.distance_ly)>0);
 const usable=nonSun.map(sourceRow).filter(v=>Number.isFinite(v.distance)&&Number.isFinite(v.ra)&&Number.isFinite(v.dec)&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z)).sort((a,b)=>a.distance-b.distance||a.index-b.index);
 rows=usable;if(rows.length!==raw.length-1)throw Error("A catalog coordinate is invalid; inspect the source before displaying the whole catalog.");
 for(const v of rows){if(!systems.has(v.cns_name))systems.set(v.cns_name,[]);systems.get(v.cns_name).push(v)}
 works=source.media.works;
 for(const work of works){
  if(!work.id||!work.title||!Number.isInteger(work.year)||!work.url?.startsWith("https://")||!["book","film","television"].includes(work.medium)||!Array.isArray(work.systems))throw Error("Invalid media evidence record.");
  for(const id of work.systems){if(!systems.has(id))throw Error("Work system "+id+" is absent from the catalog.");if(!worksBySystem.has(id))worksBySystem.set(id,[]);worksBySystem.get(id).push(work)}
 }
 state.radius=Math.ceil(rows.at(-1).distance);
 return {raw:raw.length,nonSun:nonSun.length,stellar:rows.filter(v=>!v.isBrown).length,usable:usable.length,brown:rows.filter(v=>v.isBrown).length};
}
function populateDiscovery(counts){
 label("hero-radius",number(rows.at(-1).distance,2));
 label("source-count",counts.raw);
 const steps=[
  ["Raw source rows",counts.raw],
  ["Sun at the origin (central marker)",counts.raw-counts.nonSun],
  ["Mapped non-Sun objects with valid coordinates",counts.usable],
  ["Stellar objects, including white dwarfs",counts.stellar],
  ["L / T / Y brown dwarfs, shown separately",counts.brown]
 ];
 const funnel=$("selection-funnel");funnel.replaceChildren();
 steps.forEach(([title,n],index)=>{const line=make("div","funnel-row"),seq=make("span","funnel-n",String(index+1).padStart(2,"0")),middle=make("div"),name=make("span","funnel-title",title),bar=make("div","funnel-bar"),fill=make("i"),count=make("strong",null,n);fill.style.width=(100*n/counts.raw)+"%";bar.append(fill);middle.append(name,bar);line.append(seq,middle,count);funnel.append(line)});
 const body=$("raw-rows");body.replaceChildren();for(const v of rows.slice(0,5)){const tr=make("tr");for(const cell of [v.cns_name,v.display,v.spectral_type,v.ra_2000+" / "+v.dec_2000,number(v.distance,2)+" ly"])tr.append(make("td",null,cell));body.append(tr)}
}
function appendText(root,x,y,text,attrs={}){
 const el=svg("text",{x,y,"font-family":"DM Mono, monospace","font-size":11,fill:"#55715e",...attrs});el.textContent=text;root.append(el);return el
}
function drawShellChart(){
 const root=$("shell-chart"),width=620,height=292,left=36,right=18,top=21,bottom=37,maxR=Math.ceil(rows.at(-1).distance),plotW=width-left-right,plotH=height-top-bottom;
 const shell=Array.from({length:maxR+1},(_,r)=>({r,objects:rows.filter(v=>v.distance<=r).length,systems:keyCount(rows.filter(v=>v.distance<=r))}));
 const ceiling=Math.ceil(rows.length/25)*25,image=svg("svg",{viewBox:"0 0 "+width+" "+height,"aria-hidden":"true"}),x=r=>left+plotW*r/maxR,y=n=>top+plotH*(1-n/ceiling);
 for(let n=0;n<=ceiling;n+=25){image.append(svg("line",{x1:left,y1:y(n),x2:width-right,y2:y(n),stroke:"#cbdbc9","stroke-width":1}));appendText(image,0,y(n)+4,String(n))}
 for(const r of [...new Set([0,5,10,15,20,maxR])]){image.append(svg("line",{x1:x(r),y1:top,x2:x(r),y2:height-bottom,stroke:"#dbe4d8","stroke-width":1}));appendText(image,x(r),height-8,r+" ly",{"text-anchor":"middle"})}
 const path=key=>shell.map((p,i)=>(i?"L":"M")+x(p.r).toFixed(1)+","+y(p[key]).toFixed(1)).join(" ");
 image.append(svg("path",{d:path("objects"),fill:"none",stroke:"#244a37","stroke-width":3,"stroke-linejoin":"round"}));
 image.append(svg("path",{d:path("systems"),fill:"none",stroke:"#df936f","stroke-width":3,"stroke-linejoin":"round"}));
 const last=shell.at(-1);for(const [key,color] of [["objects","#244a37"],["systems","#df936f"]]){image.append(svg("circle",{cx:x(maxR),cy:y(last[key]),r:5,fill:color}));appendText(image,x(maxR)-7,y(last[key])-10,String(last[key]),{"text-anchor":"end",fill:color,"font-size":13})}
 root.replaceChildren(image);
}
function drawSpectralChart(){
 const root=$("spectral-chart"),width=500,left=65,right=35,top=10,rowH=37;
 const types=[...new Set(rows.map(v=>v.type))].sort((a,b)=>rows.filter(v=>v.type===b).length-rows.filter(v=>v.type===a).length);
 const image=svg("svg",{viewBox:"0 0 "+width+" "+(top+types.length*rowH),"aria-hidden":"true"}),maxCount=Math.max(...types.map(type=>rows.filter(v=>v.type===type).length));
 types.forEach((type,index)=>{const n=rows.filter(v=>v.type===type).length,y=top+index*rowH;appendText(image,11,y+18,type,{fill:"#1b3e2e","font-size":16});image.append(svg("rect",{x:left,y:y+4,width:width-left-right,height:22,fill:"#dfe8de"}));image.append(svg("rect",{x:left,y:y+4,width:(width-left-right-30)*n/maxCount,height:22,fill:colors[type]||"#aacbbc"}));appendText(image,left+(width-left-right-30)*n/maxCount+7,y+19,String(n),{fill:"#254432","font-size":13})});
 root.replaceChildren(image);
}
function populateAnalysis(){
 label("finding-systems",systems.size);label("finding-red",rows.filter(v=>v.type==="M").length+" / "+rows.filter(v=>!v.isBrown).length);label("finding-books",works.length);label("finding-literary-systems",worksBySystem.size);
 const edges=works.reduce((n,w)=>n+w.systems.length,0),distances=[...worksBySystem.keys()].map(atDistance);label("edge-count",edges);label("distance-span",number(Math.min(...distances),2)+"–"+number(Math.max(...distances),2));
 drawShellChart();drawSpectralChart();
 const cross=$("book-crosswalk");cross.replaceChildren();
 for(const work of [...works].sort((a,b)=>a.year-b.year))for(const id of work.systems){
  const row=make("a","cross-row");row.href="#present";row.addEventListener("click",()=>focusWork(work.id,id));
  const title=make("span","cross-title",work.title),year=make("small","cross-year",work.year+" · "+work.medium+" · "+work.creator),star=make("span","cross-star",systemName(id)+" ↗"),dist=make("span","cross-distance",number(atDistance(id),2)+" ly");title.append(year);row.append(title,star,dist);cross.append(row)
 }
 const closest=[...worksBySystem.keys()].sort((a,b)=>atDistance(a)-atDistance(b))[0],featured=[...worksBySystem.entries()].sort((a,b)=>b[1].length-a[1].length||atDistance(a[0])-atDistance(b[0]))[0];
 label("chronology-insight","In this curated index, "+systemName(featured[0])+" appears in "+featured[1].length+" works; the nearest linked system, "+systemName(closest)+", appears in "+worksBySystem.get(closest).length+". These counts describe the index, not all science fiction.");
 const chronology=$("chronology-chart");chronology.replaceChildren();const minYear=Math.min(...works.map(w=>w.year)),maxYear=Math.max(...works.map(w=>w.year));chronology.style.setProperty("--tick-1980",(100*(1980-minYear)/(maxYear-minYear))+"%");chronology.style.setProperty("--tick-2000",(100*(2000-minYear)/(maxYear-minYear))+"%");
 const axis=make("div","chron-axis");for(const year of [minYear,1980,2000,maxYear]){const tick=make("span",null,year);tick.style.left=(100*(year-minYear)/(maxYear-minYear))+"%";axis.append(tick)}chronology.append(axis);
 for(const id of [...worksBySystem.keys()].sort((a,b)=>atDistance(a)-atDistance(b))){
  const line=make("div","chron-row"),name=make("div","chron-name"),track=make("div","chron-track");name.append(make("strong",null,systemName(id)),make("small",null,number(atDistance(id),2)+" ly"));
  const matches=[...worksBySystem.get(id)].sort((a,b)=>a.year-b.year);matches.forEach((work,index)=>{const pin=make("button","chron-pin "+work.medium,String(work.year));pin.type="button";pin.style.left=(100*(work.year-minYear)/(maxYear-minYear))+"%";pin.style.top=(index&&work.year-matches[index-1].year<4?"42px":"10px");pin.title=work.title+" · "+work.year+" · "+systemName(id);pin.setAttribute("aria-label","Locate "+work.title+" at "+systemName(id));pin.addEventListener("click",()=>{focusWork(work.id,id);$("present").scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})});track.append(pin)});
  line.append(name,track);chronology.append(line)
 }
}
function populateControls(){
 const select=$("system-select");select.replaceChildren();
 const sorted=[...systems.keys()].sort((a,b)=>atDistance(a)-atDistance(b));for(const id of sorted){const option=make("option",null,systemName(id)+" · "+number(atDistance(id),2)+" ly");option.value=id;select.append(option)}select.value=state.selected;
 const classes=[...new Set(rows.map(v=>v.type))].sort();for(const c of classes){const opt=make("option",null,c+(["L","T","Y"].includes(c)?" · brown dwarf":" · stellar class"));opt.value=c;$("class-select").append(opt)}
 const slider=$("radius-range");slider.max=String(state.radius);slider.value=String(state.radius);label("radius-output",state.radius+" ly");
 select.addEventListener("change",()=>selectSystem(select.value));
 slider.addEventListener("input",()=>{state.radius=Number(slider.value);label("radius-output",state.radius+" ly");if(atDistance(state.selected)>state.radius)state.selected=visible()[0]?.cns_name||null;refresh()});
 $("class-select").addEventListener("change",event=>{state.stellarClass=event.target.value;if(!visible().some(v=>v.cns_name===state.selected))state.selected=visible()[0]?.cns_name||null;refresh()});
 $("mode-select").addEventListener("change",event=>{state.mode=event.target.value;if(!visible().some(v=>v.cns_name===state.selected))state.selected=visible()[0]?.cns_name||null;refresh()});
 $("reset-view").addEventListener("click",()=>{state.yaw=-.55;state.pitch=.24;state.zoom=1;draw()});
 $("toggle-motion").addEventListener("click",toggleMotion);
 const query=window.matchMedia?.("(prefers-reduced-motion: reduce)");query?.addEventListener?.("change",()=>{if(query.matches&&state.auto)toggleMotion()});
}
function populateWorks(){
 const shelf=$("book-shelf");shelf.replaceChildren();
 for(const work of [...works].sort((a,b)=>a.year-b.year)){
  const card=make("article","book-card");card.dataset.work=work.id;card.dataset.medium=work.medium;
  const meta=make("span","book-meta",work.year+" / "+work.medium.toUpperCase()+" / "+work.role.toUpperCase()),title=make("h4",null,work.title),author=make("p","book-author",work.creator),note=make("p","book-note",work.note),star=make("span","book-star",work.systems.map(systemName).join(" + ")),actions=make("div","book-actions"),button=make("button",null,"Locate star ↗"),sourceLink=make("a",null,"Evidence ↗");
  button.type="button";button.addEventListener("click",()=>{focusWork(work.id,work.systems[0]);$("present").scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})});
  sourceLink.href=work.url;sourceLink.target="_blank";sourceLink.rel="noopener noreferrer";sourceLink.title=work.source+" — "+work.note;
  actions.append(button,sourceLink);if(work.publication_url){const edition=make("a",null,"Edition ↗");edition.href=work.publication_url;edition.target="_blank";edition.rel="noopener noreferrer";actions.append(edition)}card.append(meta,title,author,note,star,actions);shelf.append(card)
 }
 $("work-filter").addEventListener("change",event=>{const medium=event.target.value;for(const card of shelf.children)card.hidden=medium!=="all"&&card.dataset.medium!==medium;label("work-filter-count",[...shelf.children].filter(card=>!card.hidden).length+" works")});
}
function selectSystem(id){
 if(!systems.has(id))return;
 const first=representative(id);
 if(first.distance>state.radius){state.radius=Math.ceil(first.distance);$("radius-range").value=String(state.radius);label("radius-output",state.radius+" ly")}
 if(state.stellarClass!=="all"&&!systems.get(id).some(v=>v.type===state.stellarClass)){state.stellarClass="all";$("class-select").value="all"}
 if(state.mode==="literature"&&!worksBySystem.has(id)){state.mode="all";$("mode-select").value="all"}
 state.selected=id;$("system-select").value=id;refresh();
}
function focusWork(workId,id){state.work=workId;if(state.mode==="astronomy"){state.mode="all";$("mode-select").value="all"}selectSystem(id||works.find(w=>w.id===workId)?.systems[0]);document.querySelectorAll(".book-card").forEach(card=>card.classList.toggle("active",card.dataset.work===workId))}
function renderDetail(){
 const root=$("selected-detail");root.replaceChildren();const id=state.selected;if(!id){root.append(make("p",null,"No objects match the current filters. Widen the radius or change the layer."));return}
 const group=systems.get(id),first=group[0],linked=worksBySystem.get(id)||[],voyagerYears=first.distance*LIGHT_KM_S/VOYAGER_KM_S;
 root.append(make("span","detail-label","SELECTED CATALOG SYSTEM"),make("h3",null,systemName(id)),make("p",null,id+" · "+group.length+" catalog "+(group.length===1?"object":"objects")+(group.some(v=>v.isBrown)?" · includes brown dwarf":"")));
 const stats=make("div","detail-stats");for(const [name,value] of [["Distance",number(first.distance,2)+" ly"],["Light · one way",number(first.distance,2)+" yr"],["Voyager 1 speed",number(voyagerYears,0)+" yr"],["Spectral types",[...new Set(group.map(v=>v.spectral_type))].join(" / ")],["Media links",linked.length]]){const box=make("div");box.append(make("span",null,name),make("strong",null,value));stats.append(box)}root.append(stats);
 root.append(make("p","travel-note","Idealized straight-line time at a constant 17 km/s relative to the Sun; Voyager 1 is not headed here. Source: NASA, Voyager 1 mission page."));
 root.append(make("p",null,"J2000 RA "+number(first.ra,3)+"° · Dec "+number(first.dec,3)+"°; XYZ "+[first.x,first.y,first.z].map(n=>number(n,2)).join(", ")+" ly."));
 const bib=make("div","detail-books");bib.append(make("span","detail-label",linked.length?"DOCUMENTED MEDIA CONNECTIONS":"NO WORK IN THIS CURATED INDEX"));for(const work of linked){const link=make("a",null,work.title+" · "+work.year+" · "+work.medium+" ↗");link.href=work.url;link.target="_blank";link.rel="noopener noreferrer";bib.append(link,make("p",null,work.note))}root.append(bib);
}
function refresh(){
 if(state.work&&!works.find(w=>w.id===state.work)?.systems.includes(state.selected)){state.work=null;document.querySelectorAll(".book-card").forEach(card=>card.classList.remove("active"))}
 const selected=visible(),ids=new Set(selected.map(v=>v.cns_name));label("visible-count",selected.length);label("visible-systems",ids.size);label("visible-books",[...ids].filter(id=>worksBySystem.has(id)).length);
 $("system-select").value=state.selected||"";renderDetail();draw();
}
function resize(){
 if(!canvas)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);viewWidth=rect.width;viewHeight=rect.height;canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);draw()
}
function project(x,y,z){
 const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch),rx=x*cy-z*sy,rz=x*sy+z*cy,ry=y*cp-rz*sp,depth=y*sp+rz*cp;
 const perspective=55/(55-depth),scale=Math.min(viewWidth,viewHeight)*.0185*state.zoom;
 return {x:viewWidth*.5+rx*scale*perspective,y:viewHeight*.51-ry*scale*perspective,depth,perspective};
}
function line3D(points,stroke,width=1){
 ctx.beginPath();points.forEach(([x,y,z],i)=>{const p=project(x,y,z);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y)});ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();
}
function drawRadiusSphere(){
 const r=state.radius,center=project(0,0,0),scale=Math.min(viewWidth,viewHeight)*.0185*state.zoom,screenR=scale*r*55/Math.sqrt(55*55-r*r);
 const glow=ctx.createRadialGradient(center.x,center.y,screenR*.55,center.x,center.y,screenR);
 glow.addColorStop(0,"#5fb89400");glow.addColorStop(.76,"#6dcfa908");glow.addColorStop(1,"#87ebc524");
 ctx.beginPath();ctx.arc(center.x,center.y,screenR,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();ctx.strokeStyle="#a8eac66a";ctx.lineWidth=1.2;ctx.stroke();
 const ring=(point)=>{const projected=Array.from({length:121},(_,i)=>project(...point(i*2*Math.PI/120)));ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle="#8bd7b029";ctx.lineWidth=1;ctx.stroke();ctx.beginPath();for(let i=1;i<projected.length;i++){const a=projected[i-1],b=projected[i];if(a.depth+b.depth>0){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}}ctx.strokeStyle="#a5eec658";ctx.stroke()};
 for(const latitude of [-Math.PI/6,0,Math.PI/6])ring(a=>[r*Math.cos(latitude)*Math.cos(a),r*Math.cos(latitude)*Math.sin(a),r*Math.sin(latitude)]);
 for(const longitude of [0,Math.PI/3,2*Math.PI/3])ring(a=>[r*Math.cos(a)*Math.cos(longitude),r*Math.cos(a)*Math.sin(longitude),r*Math.sin(a)]);
 ctx.fillStyle="#b7ecd1";ctx.font="10px DM Mono, monospace";ctx.fillText(r+" LY RADIUS",center.x+screenR*.48,center.y-screenR*.82);
}
function drawGrid(){
 const radius=state.radius;
 drawRadiusSphere();
 for(const r of [5,10,15,20].filter(r=>r<radius)){const path=[];for(let i=0;i<=96;i++){const a=2*Math.PI*i/96;path.push([r*Math.cos(a),r*Math.sin(a),0])}line3D(path,"#8dd7aa24",1)}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;line3D([[0,0,0],[radius*Math.cos(a),radius*Math.sin(a),0]],"#9ac9ad19")}
 line3D([[-radius,0,0],[radius,0,0]],"#b1d8c543",1);line3D([[0,-radius,0],[0,radius,0]],"#b1d8c543",1);line3D([[0,0,-radius],[0,0,radius]],"#dfb18647",1);
 const center=project(0,0,0);ctx.beginPath();ctx.arc(center.x,center.y,5,0,Math.PI*2);ctx.fillStyle="#fff0bc";ctx.shadowColor="#ffe7a8";ctx.shadowBlur=22;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#d4e5d4";ctx.font="10px DM Mono, monospace";ctx.fillText("SOL",center.x+10,center.y-10);
}
function draw(){
 if(!ctx||!viewWidth)return;ctx.clearRect(0,0,viewWidth,viewHeight);
 const gradient=ctx.createRadialGradient(viewWidth*.5,viewHeight*.5,10,viewWidth*.5,viewHeight*.5,viewWidth*.58);gradient.addColorStop(0,"#163036");gradient.addColorStop(1,"#071014");ctx.fillStyle=gradient;ctx.fillRect(0,0,viewWidth,viewHeight);
 drawGrid();
 const visibleRows=visible(),objects=visibleRows.map(v=>({v,p:project(v.x,v.y,v.z)})).sort((a,b)=>a.p.depth-b.p.depth);state.points=objects;
 const selected=state.selected,linkedVisible=state.mode!=="astronomy";
 for(const {v,p} of objects){const linked=worksBySystem.has(v.cns_name),isSelected=v.cns_name===selected,r=Math.max(2,3.1*p.perspective)*(isSelected?2:linked&&linkedVisible?1.5:1);
  if(linked&&linkedVisible){ctx.beginPath();ctx.arc(p.x,p.y,r+5,0,Math.PI*2);ctx.strokeStyle=isSelected?"#d6ffdb":"#92dfb797";ctx.lineWidth=isSelected?1.8:1;ctx.stroke()}
   const color=colors[v.type]||"#bed7c9";
   if(isSelected||linked&&linkedVisible){ctx.beginPath();ctx.arc(p.x,p.y,r*2.5,0,Math.PI*2);ctx.fillStyle=color+"30";ctx.fill()}
   ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
 }
 const group=objects.filter(o=>o.v.cns_name===selected);if(group.length){const p=group[0].p;ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.strokeStyle="#e8f6d1";ctx.lineWidth=1;ctx.stroke();const name=systemName(selected);ctx.font="12px DM Sans, sans-serif";const badgeWidth=Math.min(viewWidth-34,ctx.measureText(name).width+28);ctx.fillStyle="#0a1d1ce6";ctx.fillRect(18,viewHeight-70,badgeWidth,27);ctx.strokeStyle="#75bf97";ctx.strokeRect(18.5,viewHeight-69.5,badgeWidth-1,26);ctx.fillStyle="#f3f4dc";ctx.fillText(name,31,viewHeight-52)}
 if(linkedVisible&&viewWidth>540){for(const id of worksBySystem.keys()){if(id===selected)continue;const target=objects.find(o=>o.v.cns_name===id);if(target){ctx.fillStyle="#bcecd1";ctx.font="10px DM Mono, monospace";ctx.fillText(systemName(id),target.p.x+11,target.p.y-10)}}}
}
function toggleMotion(){
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){state.auto=false;$("toggle-motion").textContent="Reduced motion on";$("toggle-motion").setAttribute("aria-pressed","false");return}
 state.auto=!state.auto;$("toggle-motion").textContent=state.auto?"Auto-rotate on":"Auto-rotate off";$("toggle-motion").setAttribute("aria-pressed",String(state.auto));if(state.auto)animate()
}
function animate(){if(!state.auto)return;state.yaw+=.002;draw();frame=requestAnimationFrame(animate)}
function setupCanvas(){
 canvas=$("starfield");ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas 2D is unavailable.");resize();new ResizeObserver(resize).observe(canvas);
 let scheduled=false;const queueDraw=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;draw()})};
 const updateDrag=(event,drag)=>{const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;drag.distance=Math.hypot(dx,dy);state.yaw=drag.startYaw+dx*.006;state.pitch=Math.max(-1.35,Math.min(1.35,drag.startPitch+dy*.006))};
 canvas.addEventListener("pointerdown",event=>{if(event.button!==0||!event.isPrimary||state.drag)return;event.preventDefault();if(state.auto)toggleMotion();canvas.setPointerCapture(event.pointerId);state.drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,startYaw:state.yaw,startPitch:state.pitch,distance:0}});
 canvas.addEventListener("pointermove",event=>{const drag=state.drag;if(!drag||event.pointerId!==drag.id)return;updateDrag(event,drag);queueDraw()});
 canvas.addEventListener("pointerup",event=>{const drag=state.drag;if(!drag||event.pointerId!==drag.id)return;updateDrag(event,drag);state.drag=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);if(drag.distance>5){queueDraw();return}const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;let closest=null,best=18;for(const item of state.points){const d=Math.hypot(item.p.x-x,item.p.y-y);if(d<best){closest=item.v;best=d}}if(closest){state.work=null;document.querySelectorAll(".book-card").forEach(card=>card.classList.remove("active"));selectSystem(closest.cns_name)}});
 canvas.addEventListener("pointercancel",()=>{state.drag=null});canvas.addEventListener("lostpointercapture",()=>{state.drag=null});
 canvas.addEventListener("contextmenu",event=>event.preventDefault());
 canvas.addEventListener("wheel",event=>{event.preventDefault();state.zoom=Math.max(.58,Math.min(2.6,state.zoom*(event.deltaY>0?.92:1.08)));queueDraw()},{passive:false});
 canvas.addEventListener("keydown",event=>{const step=.11;if(event.key==="ArrowLeft")state.yaw-=step;else if(event.key==="ArrowRight")state.yaw+=step;else if(event.key==="ArrowUp")state.pitch=Math.min(1.35,state.pitch+step);else if(event.key==="ArrowDown")state.pitch=Math.max(-1.35,state.pitch-step);else if(event.key==="+"||event.key==="=")state.zoom=Math.min(2.6,state.zoom*1.1);else if(event.key==="-")state.zoom=Math.max(.58,state.zoom/1.1);else return;event.preventDefault();draw()});
 window.addEventListener("pagehide",()=>{state.auto=false;cancelAnimationFrame(frame)});
}
try{
  const counts=prepare();populateDiscovery(counts);populateAnalysis();populateControls();populateWorks();setupCanvas();refresh();$("status").textContent="";
}catch(error){console.error(error);$("status").textContent="Atlas error: "+error.message;$("status").classList.add("error")}
})();
