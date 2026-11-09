(function signalField(){
"use strict";

const canvas=document.getElementById("hero-signal-canvas");
const button=document.getElementById("hero-motion");
const catalog=window.STELLAR_SOURCE?.catalog;
if(!canvas||!button||!Array.isArray(catalog))return;
const context=canvas.getContext("2d");
if(!context)return;

// The named emitters and distances come from the committed catalog. Their screen
// positions, colors, pulse periods and wavefronts are an explicitly schematic motif.
const emitters=[
 {id:"GJ 551",name:"PROXIMA",color:[119,226,210],x:.23,y:.38,offset:.02,rate:.000085},
 {id:"GJ 244",name:"SIRIUS",color:[137,189,245],x:.75,y:.26,offset:.38,rate:.000074},
 {id:"GJ 71",name:"TAU CETI",color:[246,189,131],x:.63,y:.73,offset:.66,rate:.000078},
 {id:"GJ 699",name:"BARNARD'S STAR",color:[210,156,224],x:.27,y:.76,offset:.74,rate:.000090}
].map(star=>{
 const row=catalog.find(item=>item.cns_name===star.id&&Number(item.distance_ly)>0);
 return row?{...star,distance:Number(row.distance_ly)}:null;
}).filter(Boolean);

const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)");
let running=!reduced?.matches,visible=true,frame=0,lastFrame=0,elapsed=0,width=0,height=0;
const rgba=(color,alpha)=>`rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
const particles=Array.from({length:110},(_,index)=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 return {x:hash(index+1),y:hash(index+117),r:.35+hash(index+307)*1.1,a:.09+hash(index+809)*.36};
});

function setMotion(active){
 running=active;
 button.setAttribute("aria-pressed",String(active));
 button.textContent=active?"Pause animation":"Play animation";
 if(active)start();else{cancelAnimationFrame(frame);frame=0;draw()}
}

function start(){if(frame||!running||!visible||document.hidden)return;frame=requestAnimationFrame(tick)}

function resize(){
 const box=canvas.getBoundingClientRect();
 if(!box.width||!box.height)return;
 const dpr=Math.min(devicePixelRatio||1,2);
 width=box.width;height=box.height;
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 context.setTransform(dpr,0,0,dpr,0,0);
 draw();
}

function drawBackground(){
 const ctx=context;
 ctx.clearRect(0,0,width,height);
 const haze=ctx.createRadialGradient(width*.50,height*.50,4,width*.50,height*.50,Math.max(width,height)*.55);
 haze.addColorStop(0,"rgba(18,54,62,.28)");
 haze.addColorStop(1,"rgba(7,16,20,0)");
 ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
 for(const point of particles){
  ctx.beginPath();ctx.arc(point.x*width,point.y*height,point.r,0,Math.PI*2);
  ctx.fillStyle=`rgba(221,241,235,${point.a})`;ctx.fill();
 }
 // A fine perspective lattice makes the overlapping shells read as spatial.
 ctx.strokeStyle="rgba(142,202,190,.065)";ctx.lineWidth=.8;
 for(let i=-2;i<=2;i++){
  ctx.beginPath();ctx.moveTo(width*(.5+i*.2),height*.03);
  ctx.lineTo(width*(.5+i*.36),height*.96);ctx.stroke();
 }
 for(let j=1;j<=3;j++){
  ctx.beginPath();ctx.ellipse(width*.5,height*(.22+j*.18),width*.52,height*.085,0,0,Math.PI*2);ctx.stroke();
 }
}

function drawShell(star,phase){
 const ctx=context,x=star.x*width,y=star.y*height;
 const unit=Math.min(width,height),radius=unit*(.035+phase*.47);
 const fade=Math.pow(1-phase,.68),color=star.color;
 const fill=ctx.createRadialGradient(x,y,radius*.15,x,y,radius);
 fill.addColorStop(0,rgba(color,0));
 fill.addColorStop(.69,rgba(color,.014*fade));
 fill.addColorStop(.91,rgba(color,.045*fade));
 fill.addColorStop(1,rgba(color,0));
 ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
 // A broad aura and a crisp limb form a translucent spherical wavefront.
 for(const [line,alpha] of [[13,.030],[5,.09],[1.15,.49]]){
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);
  ctx.lineWidth=line;ctx.strokeStyle=rgba(color,alpha*fade);ctx.stroke();
 }
 ctx.save();ctx.translate(x,y);ctx.rotate(-.35);
 ctx.beginPath();ctx.ellipse(0,0,radius,radius*.30,0,0,Math.PI*2);
 ctx.lineWidth=.8;ctx.strokeStyle=rgba(color,.22*fade);ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,0,radius*.27,radius,0,-Math.PI*.5,Math.PI*.5);
 ctx.lineWidth=.75;ctx.strokeStyle=rgba(color,.13*fade);ctx.stroke();
 ctx.restore();
}

function drawEmitter(star,time){
 const ctx=context,x=star.x*width,y=star.y*height,color=star.color;
 const flicker=1+Math.sin(time*.003+star.offset*20)*.09;
 const glow=ctx.createRadialGradient(x,y,0,x,y,35*flicker);
 glow.addColorStop(0,rgba(color,.68));glow.addColorStop(.18,rgba(color,.27));glow.addColorStop(1,rgba(color,0));
 ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,35*flicker,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(x,y,4.3,0,Math.PI*2);ctx.fillStyle="#f7fff6";ctx.fill();
 ctx.beginPath();ctx.arc(x,y,8.4,0,Math.PI*2);ctx.lineWidth=1;
 ctx.strokeStyle=rgba(color,.9);ctx.stroke();
 const compact=width<430,align=star.id==="GJ 699"||star.x>.6?"right":"left";
 ctx.textAlign=align;ctx.textBaseline="middle";
 const labelX=x+(align==="right"?-15:15),labelY=y+(star.y>.6?-21:19);
 ctx.font=`600 ${compact?8:10}px "DM Mono",monospace`;
 ctx.fillStyle=rgba(color,.96);ctx.fillText(star.name,labelX,labelY);
 ctx.font=`${compact?7:9}px "DM Mono",monospace`;
 ctx.fillStyle="rgba(195,216,208,.7)";
 ctx.fillText(`${star.distance.toFixed(2)} LY · CATALOG`,labelX,labelY+12);
}

function draw(){
 if(!width||!height)return;
 drawBackground();
 context.save();context.globalCompositeOperation="screen";
 for(const star of emitters){
  for(let index=0;index<3;index++){
   const phase=(elapsed*star.rate+star.offset+index/3)%1;
   drawShell(star,phase);
  }
 }
 context.restore();
 for(const star of emitters)drawEmitter(star,elapsed);
}

function tick(now){
 frame=0;
 if(!running||!visible||document.hidden)return;
 if(now-lastFrame>=30){elapsed+=Math.min(now-lastFrame||30,80);lastFrame=now;draw()}
 start();
}

button.addEventListener("click",()=>setMotion(!running));
reduced?.addEventListener?.("change",event=>{if(event.matches)setMotion(false)});
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});
if("IntersectionObserver" in window){
 const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(visible)start();else{cancelAnimationFrame(frame);frame=0}},{threshold:.02});
 observer.observe(canvas);
}
new ResizeObserver(resize).observe(canvas);
window.addEventListener("pagehide",()=>{cancelAnimationFrame(frame);frame=0});
button.setAttribute("aria-pressed",String(running));
button.textContent=running?"Pause animation":"Play animation";
resize();start();
})();
