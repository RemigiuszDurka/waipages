(function core(){
"use strict";
const P=(window.PROJECTS||[]).find(x=>x.id===window.PROJECT_ID);
const $=id=>document.getElementById(id);
const N=x=>x===null||x===undefined||String(x).trim()===""?NaN:Number(x);
const F=Number.isFinite;
const fmt=(v,n=1)=>F(v)?Number(v).toLocaleString("en-US",{maximumFractionDigits:n}):"n/a";
const sum=a=>a.reduce((s,x)=>s+(F(x)?x:0),0);
const mean=a=>a.length?sum(a)/a.length:NaN;
const median=a=>{const v=a.filter(F).sort((x,y)=>x-y),m=Math.floor(v.length/2);return v.length?(v.length%2?v[m]:(v[m-1]+v[m])/2):NaN};
const corr=(x,y)=>{const d=x.map((a,i)=>[a,y[i]]).filter(t=>t.every(F));if(d.length<3)return NaN;const mx=mean(d.map(a=>a[0])),my=mean(d.map(a=>a[1])),xx=sum(d.map(a=>(a[0]-mx)**2)),yy=sum(d.map(a=>(a[1]-my)**2));return xx&&yy?sum(d.map(a=>(a[0]-mx)*(a[1]-my)))/Math.sqrt(xx*yy):NaN};
const group=(a,key)=>a.reduce((b,x)=>{const k=String(key(x));(b[k]||=[]).push(x);return b},{});
const ranking=(a,key)=>Object.entries(group(a,key)).map(([k,v])=>({key:k,n:v.length})).sort((x,y)=>y.n-x.n);
function csv(s){
s=s.replace(/^\uFEFF/,"");const table=[];let row=[],val="",q=false;
for(let i=0;i<s.length;i++){const c=s[i];
 if(c==='"'){if(q&&s[i+1]==='"'){val+='"';i++}else if(q)q=false;else if(val==="")q=true;else val+='"';}
 else if(c===","&&!q){row.push(val);val="";}
 else if((c==="\n"||c==="\r")&&!q){if(c==="\r"&&s[i+1]==="\n")i++;row.push(val);if(row.some(x=>x!==""))table.push(row);row=[];val="";}
 else val+=c;
}
if(val!==""||row.length){row.push(val);table.push(row)}
const headers=table.shift()||[];
return table.map(r=>Object.fromEntries(headers.map((k,i)=>[k,r[i]??""])));
}
function chart(id,traces,over={}){
 const base={paper_bgcolor:"rgba(0,0,0,0)",plot_bgcolor:"rgba(0,0,0,0)",font:{family:"DM Sans, system-ui, sans-serif",size:12,color:"#adbfdb"},margin:{l:53,r:18,t:25,b:45},xaxis:{gridcolor:"#283c54",zerolinecolor:"#283c54"},yaxis:{gridcolor:"#283c54",zerolinecolor:"#283c54"},legend:{orientation:"h",y:1.14,font:{size:11}},hoverlabel:{bgcolor:"#142a41",font:{color:"#f6fbff"}},...over};
 return Plotly.react($(id),traces,base,{responsive:true,displaylogo:false,scrollZoom:true,toImageButtonOptions:{format:"png",scale:2,filename:P.slug}});
}
const geo=(v={})=>({bgcolor:"rgba(0,0,0,0)",showland:true,landcolor:"#183045",showocean:true,oceancolor:"#09182b",showcoastlines:true,coastlinecolor:"#415a74",showcountries:true,countrycolor:"#283b52",projection:{type:"natural earth"},...v});
function metrics(v){
const root=$("metrics");root.replaceChildren();
v.slice(0,4).forEach(([label,value])=>{const d=document.createElement("div");d.className="metric";const a=document.createElement("div");a.className="value";a.textContent=String(value);const b=document.createElement("div");b.className="label";b.textContent=String(label);d.append(a,b);root.append(d);});
}
function insights(arr){const root=$("insights");root.replaceChildren();
 arr.filter(Boolean).forEach(x=>{const d=document.createElement("div"),dot=document.createElement("span"),t=document.createElement("span");d.className="insight";dot.className="dot";t.textContent=String(x);d.append(dot,t);root.append(d)});
}
function titles(a,b,c,d){$("main-title").textContent=a;$("main-subtitle").textContent=b;$("secondary-title").textContent=c;$("secondary-subtitle").textContent=d;}
function select(label,opts,callback){
const wrap=document.createElement("label");wrap.textContent=label+" ";const s=document.createElement("select");
opts.forEach(x=>{const o=document.createElement("option");o.value=String(Array.isArray(x)?x[0]:x);o.textContent=String(Array.isArray(x)?x[1]:x);s.append(o)});
s.addEventListener("change",()=>callback(s.value));wrap.append(s);$("controls").append(wrap);return s;
}
function slider(label,min,max,start,callback,step=1){
const wrap=document.createElement("label"),t=document.createElement("span"),v=document.createElement("strong"),s=document.createElement("input");
t.textContent=label+": ";v.textContent=start;s.type="range";s.min=min;s.max=max;s.step=step;s.value=start;
s.addEventListener("input",()=>{v.textContent=s.value;callback(+s.value)});
wrap.append(t,s,v);$("controls").append(wrap);return s;
}
function checkbox(label,callback,checked=false){
const wrap=document.createElement("label"),x=document.createElement("input");x.type="checkbox";x.checked=checked;wrap.append(x,document.createTextNode(label));x.addEventListener("change",()=>callback(x.checked));$("controls").append(wrap);return x;
}
function extra(html){$("extra").innerHTML=html;}
const C={project:P,$,N,F,fmt,sum,mean,median,corr,group,ranking,chart,geo,metrics,insights,titles,select,slider,checkbox,extra};
async function script(file){
return new Promise((resolve,reject)=>{const x=document.createElement("script");x.src=new URL("../../assets/"+file,location.href).href;x.onload=resolve;x.onerror=()=>reject(new Error("Could not load "+file));document.head.append(x);});
}
async function boot(){
if(!P)throw Error("Project configuration not found");
if(typeof Plotly==="undefined")throw Error("Plotly CDN unavailable. Connect to the Internet or vendor Plotly locally.");
$("method").textContent="Full data provenance, analytical restrictions and source methodology are provided in the accompanying README. Charts recalculate from the archived data rather than using generated numerical examples.";
const sources={4:"https://github.com/vega/vega-datasets/blob/main/data/gapminder.json",6:"https://github.com/vega/vega-datasets/blob/main/data/bird-migration.csv"};
const source=document.createElement("a");source.href=sources[P.id];source.rel="noopener noreferrer";source.target="_blank";source.textContent="Original data source ↗";
const repo=document.createElement("a");repo.href="./README.md";repo.textContent="Research methods & limitations ↗";
$("provenance").replaceChildren(source,document.createElement("br"),repo);
const which=[1,2,11,12].includes(P.id)?"renderers-priority.js":P.id<=5?"renderers-a.js":"renderers-b.js";
if(location.protocol==="file:")await script("local-data.js");
const [_,data]=await Promise.all([script(which),Promise.all(P.data.map(async filename=>{
 let t;
 if(location.protocol==="file:"){
  t=window.LOCAL_DATA?.[`${P.slug}/${filename}`];
  if(typeof t!=="string")throw Error(`${filename}: local data bundle is missing; run python tools/build_local_data.py`);
 }else{
  const r=await fetch(new URL(filename,location.href));if(!r.ok)throw Error(`${filename}: HTTP ${r.status}`);
  t=await r.text();
 }
 return filename.endsWith(".json")?JSON.parse(t):csv(t);
}))]);
$("loading").classList.add("hidden");$("lab").classList.remove("hidden");
const renderer=window.LAB_RENDERERS?.[P.mode];if(!renderer)throw Error("Missing visual renderer for "+P.mode);
await renderer(data,C);
}
boot().catch(e=>{console.error(e);$("loading").className="error";$("loading").textContent="Laboratory error: "+e.message;});
})();

(function(){const s=document.createElement('script');s.src=new URL('../../assets/ambient.js',location.href).href;s.defer=true;document.head.append(s);})();
