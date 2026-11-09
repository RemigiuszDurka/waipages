(function ambient(){
const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||false;
const root=document.querySelector(".container");if(!root)return;
root.style.position="relative";root.style.zIndex="1";
const cvs=document.createElement("canvas");cvs.setAttribute("aria-hidden","true");
Object.assign(cvs.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",pointerEvents:"none",zIndex:"0",opacity:".54"});
document.body.prepend(cvs);const ctx=cvs.getContext("2d");if(!ctx)return;
let seed=1947;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
const hex=getComputedStyle(document.body).getPropertyValue("--accent").trim()||"#73bcff";
const col=/^#[\da-f]{6}$/i.test(hex)?[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]:[113,188,255];
const pts=Array.from({length:window.innerWidth<650?40:78},()=>({x:rand(),y:rand(),v:(rand()-.5)*.000018,w:(rand()-.5)*.000017,size:rand()*.9+.45}));
let width=0,height=0,last=0;
function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);width=innerWidth;height=innerHeight;cvs.width=Math.floor(width*dpr);cvs.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
function render(t){
if(!reduce&&t-last<48){requestAnimationFrame(render);return}last=t;ctx.clearRect(0,0,width,height);
const k=pts.map(p=>{if(!reduce){p.x=(p.x+p.v+1)%1;p.y=(p.y+p.w+1)%1}return{x:p.x*width,y:p.y*height,size:p.size}});
for(let i=0;i<k.length;i++){
for(let j=i+1;j<k.length;j++){const d=Math.hypot(k[i].x-k[j].x,k[i].y-k[j].y);if(d<110){const op=(1-d/110)*.075;ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${op})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(k[i].x,k[i].y);ctx.lineTo(k[j].x,k[j].y);ctx.stroke();}}
ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},.42)`;ctx.beginPath();ctx.arc(k[i].x,k[i].y,k[i].size,0,Math.PI*2);ctx.fill();}
if(!reduce)requestAnimationFrame(render);
}
resize();addEventListener("resize",resize,{passive:true});render(0);
})();
