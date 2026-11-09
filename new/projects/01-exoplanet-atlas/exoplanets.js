(function exoplanetLaboratory(){
"use strict";
const $=id=>document.getElementById(id);
const archive=window.EXOPLANET_ARCHIVE;
const number=(value,digits=0)=>Number(value).toLocaleString("en-US",{maximumFractionDigits:digits});
const color={"Gas Giant":"#ff9b72","Neptune-like":"#89c2ff","Super Earth":"#a9e8c5","Terrestrial":"#e9c5f7","Unknown":"#a8b1b5"};
const format=n=>n>=1000?number(n,0):n>=10?number(n,1):number(n,2);
const element=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node};
let rows=[],plotted=[],canvas,context,drawn=[],selected=null,year=2023,method="all",type="all",animationFrame=0,viewWidth=0,viewHeight=0;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function countBy(records,key){const counts=new Map();for(const row of records)counts.set(row[key],(counts.get(row[key])||0)+1);return counts}
function parse(){
 if(!archive||!Array.isArray(archive.rows)||archive.rows.length!==5250)throw Error("The standalone 5,250-row archive bundle is missing or incomplete. Run python tools/build_exoplanet_data.py.");
 rows=archive.rows.map((v,index)=>({index,name:v[0],year:v[1],type:v[2],method:v[3],radius:v[4],mass:v[5],rawRadius:v[6],rawRadiusUnit:v[7]}));
 if(rows.some(v=>!v.name||!Number.isInteger(v.year)||v.year<1992||v.year>2023||!v.method))throw Error("The archived rows contain invalid discovery fields.");
 plotted=rows.filter(v=>Number.isFinite(v.radius)&&v.radius>0&&Number.isFinite(v.mass)&&v.mass>0);
 $("status").textContent="";
 $("source-count").textContent=number(rows.length);
 $("paired-count").textContent=number(plotted.length)+" paired values";
 $("missing-count").textContent=number(rows.length-plotted.length);
 $("spike-year").textContent=number(rows.filter(v=>v.year===2016).length);
 $("transit-share").textContent=number(100*rows.filter(v=>v.method==="Transit").length/rows.length,1)+"%";
}

function rawRows(){
 const ids=["51 Pegasi b","1RXS J160929.1-210524 b","TRAPPIST-1 e","Kepler-452 b","Proxima Centauri b"];
 const body=$("raw-rows");body.replaceChildren();
 for(const name of ids){const item=rows.find(v=>v.name===name);if(!item)continue;
  const tr=element("tr");for(const value of [item.name,item.year,item.method,item.type,item.rawRadius?item.rawRadius+" "+item.rawRadiusUnit:"—"])tr.append(element("td",null,value));body.append(tr)
 }
}

function artifactNote(){
 const pairs=new Map();for(const row of plotted){const key=row.radius+"|"+row.mass;pairs.set(key,(pairs.get(key)||0)+1)}
 const repeated=[...pairs.values()].filter(n=>n>1).reduce((sum,n)=>sum+n,0);
 const note=element("div","artifact-note"),metric=element("strong",null,number(repeated)),copy=element("div");
 copy.append(element("span",null,"QUALITY SIGNAL / REPEATED PAIRS"),element("h3",null,"A line of dots can be a property of the file."),element("p",null,`${number(repeated)} of ${number(plotted.length)} plotted records share an identical normalized mass–radius pair with at least one other row. Some source properties may be rounded or estimated. Do not read the narrow traces as independent measurements or a newly discovered physical law.`));
 note.append(metric,copy);document.querySelector(".atlas-foot").before(note);
}

function annualScene(){
 const root=$("year-bars"),totals=countBy(rows,"year"),peak=Math.max(...totals.values());
 for(let y=1992;y<=2023;y++){
  const n=totals.get(y)||0,bar=element("div","year-bar");
  bar.style.height=Math.max(2,100*n/peak)+"%";
  bar.title=`${y}: ${number(n)} source records`;
  if([2014,2016].includes(y)){bar.classList.add("is-highlight");bar.append(element("span",null,y))}
  root.append(bar);
 }
}

function methodScene(){
 const root=$("method-bars"),counts=[...countBy(rows,"method")].sort((a,b)=>b[1]-a[1]),top=counts.slice(0,4),other=counts.slice(4).reduce((n,x)=>n+x[1],0),max=top[0][1];
 for(const [name,n] of [...top,["Other methods",other]]){
  const row=element("div","method-row"),label=element("span",null,name),track=element("div","method-track"),fill=element("i"),value=element("strong",null,number(n));
  fill.style.width=100*n/max+"%";track.append(fill);row.append(label,track,value);root.append(row);
 }
}

function eraScene(){
 const root=$("era-bars"),eras=[{label:"1992–2009",rows:rows.filter(v=>v.year<=2009)},{label:"2010–2023",rows:rows.filter(v=>v.year>=2010)}];
 const types=["Gas Giant","Neptune-like","Super Earth","Terrestrial","Unknown"];
 for(const era of eras){
  const row=element("div","era-row"),head=element("div"),track=element("div","era-track");head.append(element("span",null,era.label),element("strong",null,number(era.rows.length)+" records"));
  const counts=countBy(era.rows,"type");for(const name of types){const n=counts.get(name)||0,seg=element("i");seg.style.width=100*n/era.rows.length+"%";seg.style.background=color[name];seg.title=`${name}: ${number(n)} records (${number(100*n/era.rows.length,1)}%)`;track.append(seg)}
  row.append(head,track);root.append(row);
 }
 const legend=element("div","era-legend");for(const name of types){const span=element("span",null,name);span.style.setProperty("--swatch",color[name]);legend.append(span)}root.append(legend);
}

function mobileScenes(){
 for(const name of ["years","methods","eras"]){
  const step=document.querySelector(`.story-step[data-scene="${name}"]`),copy=$("scene-"+name).cloneNode(true);
  copy.className="mobile-scene";copy.removeAttribute("id");copy.removeAttribute("aria-hidden");
  for(const node of copy.querySelectorAll("[id]"))node.removeAttribute("id");
  step.querySelector(".step-prompt").before(copy);
 }
}

function setScene(name){
 const names=["years","methods","eras"];
 names.forEach((value,index)=>{const scene=$("scene-"+value),active=value===name;scene.classList.toggle("scene-active",active);scene.setAttribute("aria-hidden",String(!active));scene.inert=!active;if(active)$("scene-number").textContent=`0${index+1} / 03`});
 document.querySelectorAll(".story-step").forEach(step=>step.classList.toggle("is-active",step.dataset.scene===name));
}

function scrollBehavior(){
 const steps=[...document.querySelectorAll(".story-step")],hero=document.querySelector(".hero-art");let queued=false;
 const update=()=>{queued=false;const center=innerHeight*.54;let nearest=steps[0],best=Infinity;for(const step of steps){const box=step.getBoundingClientRect(),distance=Math.abs((box.top+box.bottom)/2-center);if(distance<best){best=distance;nearest=step}}setScene(nearest.dataset.scene);
  if(!reduced()&&hero){const amount=Math.max(0,Math.min(1,scrollY/(innerHeight*.9)));hero.style.setProperty("--scroll",amount.toFixed(3))}
 };
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
 addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule);schedule();
}

function matrix(){
 const types=["Gas Giant","Neptune-like","Super Earth","Terrestrial"],methods=["Transit","Radial Velocity","Gravitational Microlensing","Direct Imaging"];
 const legend=$("matrix-legend");for(const name of types){const span=element("span",null,name);span.style.setProperty("--swatch",color[name]);legend.append(span)}
 const root=$("method-matrix"),detail=$("matrix-detail");
 function explain(name){const subset=rows.filter(v=>v.method===name),counts=countBy(subset,"type"),lead=[...counts].sort((a,b)=>b[1]-a[1])[0];detail.textContent=`${name}: ${number(subset.length)} source records. The largest source-labeled group is ${lead[0]} (${number(100*lead[1]/subset.length,1)}% within this method). This is a selected detection sample, not an occurrence estimate.`;document.querySelectorAll(".matrix-row").forEach(row=>row.classList.toggle("is-active",row.dataset.method===name))}
 function focus(name,kind){method=name;type=kind||"all";year=2023;$("method-select").value=method;$("type-select").value=type;$("year-range").value="2023";$("year-output").textContent="2023";updateAtlas();explain(name);$("present").scrollIntoView({behavior:reduced()?"instant":"smooth"})}
 for(const name of methods){const subset=rows.filter(v=>v.method===name),row=element("div","matrix-row");row.dataset.method=name;
  const heading=element("button","matrix-name");heading.type="button";heading.append(element("strong",null,name),element("span",null,number(subset.length)+" records"));heading.addEventListener("click",()=>focus(name));row.append(heading);
  for(const kind of types){const n=subset.filter(v=>v.type===kind).length,cell=element("button","matrix-cell");cell.type="button";cell.style.setProperty("--share",100*n/subset.length+"%");cell.style.setProperty("--cell",color[kind]);cell.setAttribute("aria-label",`${name}, ${kind}: ${number(n)} records, ${number(100*n/subset.length,1)} percent of method`);cell.append(element("strong",null,number(n)),element("span",null,number(100*n/subset.length,1)+"% of method"));cell.addEventListener("click",()=>focus(name,kind));row.append(cell)}root.append(row)
 }
 explain("Transit");
}

function controls(){
 for(const name of [...countBy(rows,"method")].sort((a,b)=>b[1]-a[1]).map(x=>x[0])){const opt=element("option",null,name);opt.value=name;$("method-select").append(opt)}
 for(const name of ["Gas Giant","Neptune-like","Super Earth","Terrestrial","Unknown"]){const opt=element("option",null,name);opt.value=name;$("type-select").append(opt)}
 $("year-range").addEventListener("input",event=>{year=Number(event.target.value);$("year-output").textContent=year;updateAtlas()});
 $("method-select").addEventListener("change",event=>{method=event.target.value;updateAtlas()});
 $("type-select").addEventListener("change",event=>{type=event.target.value;updateAtlas()});
 $("reset-filters").addEventListener("click",()=>{year=2023;method="all";type="all";$("year-range").value="2023";$("year-output").textContent="2023";$("method-select").value="all";$("type-select").value="all";updateAtlas()});
 const key=$("plot-key");for(const name of ["Gas Giant","Neptune-like","Super Earth","Terrestrial"]){const item=element("span",null,name);item.style.setProperty("--swatch",color[name]);key.append(item)}
 const names=["51 Pegasi b","TRAPPIST-1 e","1RXS J160929.1-210524 b","Proxima Centauri b"];
 for(const name of names){const row=plotted.find(v=>v.name===name);if(!row)continue;const button=element("button",null,name);button.type="button";button.addEventListener("click",()=>{year=2023;method="all";type="all";$("year-range").value="2023";$("year-output").textContent="2023";$("method-select").value="all";$("type-select").value="all";selected=row;updateAtlas();showSelected(row);$("planet-field").focus({preventScroll:true})});$("featured-planets").append(button)}
}

const domain={x0:Math.log10(.25),x1:Math.log10(80),y0:Math.log10(.02),y1:Math.log10(250000)};
function filtered(){return plotted.filter(v=>v.year<=year&&(method==="all"||v.method===method)&&(type==="all"||v.type===type))}
function position(v){const left=viewWidth<500?54:67,right=22,top=viewWidth<500?101:67,bottom=55,w=viewWidth-left-right,h=viewHeight-top-bottom;return{x:left+w*(Math.log10(v.radius)-domain.x0)/(domain.x1-domain.x0),y:top+h*(1-(Math.log10(v.mass)-domain.y0)/(domain.y1-domain.y0))}}
function draw(progress=1){
 if(!context||!viewWidth)return;const ctx=context;ctx.clearRect(0,0,viewWidth,viewHeight);
 const left=viewWidth<500?54:67,right=22,top=viewWidth<500?101:67,bottom=55;
 ctx.fillStyle="#101e27";ctx.fillRect(0,0,viewWidth,viewHeight);
 ctx.font="10px DM Mono, monospace";ctx.textAlign="right";ctx.textBaseline="middle";
 for(const tick of [.1,1,10,100,1000,10000,100000]){const y=top+(viewHeight-top-bottom)*(1-(Math.log10(tick)-domain.y0)/(domain.y1-domain.y0));if(y<top||y>viewHeight-bottom)continue;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(viewWidth-right,y);ctx.strokeStyle="#8cb2b323";ctx.stroke();ctx.fillStyle="#9bb4b2";ctx.fillText(tick>=1000?number(tick):String(tick),left-9,y)}
 ctx.textAlign="center";ctx.textBaseline="top";for(const tick of [.3,1,3,10,30]){const x=left+(viewWidth-left-right)*(Math.log10(tick)-domain.x0)/(domain.x1-domain.x0);ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,viewHeight-bottom);ctx.strokeStyle="#8cb2b323";ctx.stroke();ctx.fillStyle="#9bb4b2";ctx.fillText(String(tick),x,viewHeight-bottom+10)}
 drawn=[];ctx.globalCompositeOperation="screen";
 for(const item of filtered()){const p=position(item);if(p.x<left||p.x>viewWidth-right||p.y<top||p.y>viewHeight-bottom)continue;drawn.push({item,x:p.x,y:p.y});ctx.beginPath();ctx.arc(p.x,p.y,viewWidth<500?1.8:2.1,0,Math.PI*2);ctx.globalAlpha=.55*progress;ctx.fillStyle=color[item.type]||color.Unknown;ctx.fill()}
 ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;
 if(selected&&drawn.some(v=>v.item===selected)){const p=position(selected);ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.lineWidth=2;ctx.strokeStyle="#fff8da";ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,3.7,0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill()}
}
function showSelected(item){selected=item;const root=$("selected-card");root.replaceChildren();root.append(element("span",null,"CATALOG RECORD / "+item.year),element("h3",null,item.name),element("p",null,item.method+" · "+item.type));const list=element("dl");for(const [label,value] of [["RADIUS",format(item.radius)+" Earth radii"],["MASS",format(item.mass)+" Earth masses"]]){const block=element("div");block.append(element("dt",null,label),element("dd",null,value));list.append(block)}root.append(list);draw()}
function nearest(x,y){let best=null,distance=13;for(const point of drawn){const d=Math.hypot(point.x-x,point.y-y);if(d<distance){best=point;distance=d}}return best}
function atlasCanvas(){
 canvas=$("planet-field");context=canvas.getContext("2d");if(!context)throw Error("Canvas 2D is unavailable.");
 const resize=()=>{const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);viewWidth=box.width;viewHeight=box.height;canvas.width=Math.round(viewWidth*dpr);canvas.height=Math.round(viewHeight*dpr);context.setTransform(dpr,0,0,dpr,0,0);draw()};new ResizeObserver(resize).observe(canvas);resize();
 canvas.addEventListener("pointermove",event=>{const box=canvas.getBoundingClientRect(),point=nearest(event.clientX-box.left,event.clientY-box.top),tip=$("field-tooltip");if(!point){tip.hidden=true;return}tip.hidden=false;tip.textContent=point.item.name+" · "+point.item.year;tip.style.left=Math.min(viewWidth-150,point.x+12)+"px";tip.style.top=Math.max(12,point.y-35)+"px"});
 canvas.addEventListener("pointerleave",()=>{$("field-tooltip").hidden=true});
 canvas.addEventListener("click",event=>{const box=canvas.getBoundingClientRect(),point=nearest(event.clientX-box.left,event.clientY-box.top);if(point)showSelected(point.item)});
 canvas.addEventListener("keydown",event=>{if(!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(event.key))return;event.preventDefault();const available=drawn.map(v=>v.item).sort((a,b)=>a.name.localeCompare(b.name)),index=available.indexOf(selected),direction=["ArrowRight","ArrowDown"].includes(event.key)?1:-1;if(available.length)showSelected(available[(index+direction+available.length)%available.length])});
}
function updateAtlas(){
 const active=filtered();$("atlas-count").textContent=number(active.length)+" PLOTTED";
 if(!active.length){selected=null;$("selected-card").replaceChildren(element("span",null,"NO PAIR IN THIS SLICE"),element("h3",null,"Widen the lens"),element("p",null,"This filter combination has no record with both positive reported mass and radius. Change a filter or reset the view."))}
 else if(selected&&!active.includes(selected)){selected=null;$("selected-card").replaceChildren(element("span",null,"SELECT A POINT"),element("h3",null,"Explore the field"),element("p",null,"Hover or click a point. Use arrow keys while the plot is focused."))}
 cancelAnimationFrame(animationFrame);
 if(reduced()){draw();return}
 const start=performance.now();function step(now){const t=Math.min(1,(now-start)/450);draw(t);if(t<1)animationFrame=requestAnimationFrame(step)}animationFrame=requestAnimationFrame(step);
}

try{parse();rawRows();artifactNote();annualScene();methodScene();eraScene();mobileScenes();scrollBehavior();matrix();controls();atlasCanvas();updateAtlas()}catch(error){console.error(error);$("status").textContent="Archive error: "+error.message;$("status").classList.add("error")}
})();
