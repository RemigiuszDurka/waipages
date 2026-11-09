/* Tectonic Memory: every plotted event is a row in data/earthquakes.csv.
   data/quake-data.js is a generated, file://-compatible mirror. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const status = $("status");
  const source = window.QUAKE_DATA;
  if (!source || !Array.isArray(source.events) || source.events.length !== 23412) {
    status.textContent = "Archive unavailable. Open data/earthquakes.csv or rebuild with python tools/build_quake_data.py.";
    status.setAttribute("role", "alert");
    return;
  }
  const E = source.events, fmt = new Intl.NumberFormat("en-US"), dayMs = 86400000;
  const date = e => new Date(Date.UTC(e[0],e[1]-1,e[2]));
  const dateLabel = e => date(e).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
  const key = e => [e[0],String(e[1]).padStart(2,"0"),String(e[2]).padStart(2,"0")].join("-");
  const safe = value => String(value).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const state = {year:2016,window:52,mag:5.5,relayMag:6,pairIndex:0,selected:null,sequence:0,play:null,visible:[]};
  const maxima = [...E].sort((a,b)=>b[5]-a[5] || a[0]-b[0] || a[6]-b[6]);
  const anchors = maxima.slice(0,3);
  const m7 = E.filter(e=>e[5]>=7).length;
  const days = new Map();
  E.forEach(e=>days.set(key(e),(days.get(key(e))||0)+1));
  const peak = [...days].sort((a,b)=>b[1]-a[1])[0];
  $("m7-count").textContent=fmt.format(m7);
  $("peak-day-count").textContent=fmt.format(peak[1]);
  $("peak-day-date").textContent=new Date(peak[0]+"T00:00:00Z").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
  $("max-mag").textContent="M"+maxima[0][5].toFixed(1);
  $("max-mag-count").textContent=fmt.format(E.filter(e=>e[5]===maxima[0][5]).length);
  $("raw-rows").innerHTML=source.rawSamples.map(r=>"<tr>"+r.map(v=>"<td>"+safe(v)+"</td>").join("")+"</tr>").join("");

  // A: annual magnitude composition; every cell counts all matching source rows.
  const bands=[["M5.5–5.9",5.5,6],["M6–6.9",6,7],["M7–7.9",7,8],["M8+",8,Infinity]];
  const counts=bands.map(([,lo,hi])=>Array.from({length:52},(_,i)=>E.filter(e=>e[0]===1965+i&&e[5]>=lo&&e[5]<hi).length));
  const spectrum=$("spectrum"),bandColors=["#bc5a3d","#db8655","#567e76","#263f3d"];
  let spectrumYear=2011;
  bands.forEach(([label],bi)=>{
    const row=document.createElement("div");row.className="spectrum-row";
    const labelEl=document.createElement("div");labelEl.className="spectrum-row-label";labelEl.innerHTML="<strong>"+label+"</strong><small>"+fmt.format(counts[bi].reduce((a,b)=>a+b,0))+" total</small>";row.append(labelEl);
    const bars=document.createElement("div");bars.className="spectrum-bars";
    const max=Math.max(...counts[bi]),peakYear=1965+counts[bi].indexOf(max);
    counts[bi].forEach((count,i)=>{
      const year=1965+i,button=document.createElement("button");button.type="button";
      button.style.setProperty("--bar-color",bandColors[bi]);button.style.setProperty("--bar-height",count?Math.max(4,Math.sqrt(count/max)*100)+"%":"2px");
      button.dataset.year=year;button.setAttribute("aria-label",year+" "+label+": "+count+" catalog records. Open this year on the map.");
      button.title=year+" · "+label+" · "+fmt.format(count)+" records";
      button.addEventListener("click",()=>openSpectrumYear(year));
      bars.append(button);
    });
    row.append(bars);
    const note=document.createElement("div");note.className="spectrum-peak";note.innerHTML="PEAK <b>"+fmt.format(max)+"</b>"+peakYear;row.append(note);spectrum.append(row);
  });
  function renderSpectrumYear(){
    $("spectrum-year").textContent=spectrumYear;
    $("spectrum-year-select").value=spectrumYear;
    $("spectrum-mix").innerHTML=bands.map(([label],bi)=>'<div style="--mix-color:'+bandColors[bi]+'"><b>'+fmt.format(counts[bi][spectrumYear-1965])+'</b><small>'+label+'</small></div>').join("");
    spectrum.querySelectorAll("button[data-year]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.year===spectrumYear));
    $("spectrum-detail").textContent=spectrumYear+" has "+fmt.format(bands.reduce((sum,_,bi)=>sum+counts[bi][spectrumYear-1965],0))+" catalog records across all four bands. Select a bar to view that year on the map.";
  }
  function openSpectrumYear(year){
    spectrumYear=year;renderSpectrumYear();state.year=year;state.window=1;stopPlay();syncControls();renderMap();
    $("present").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }
  for(let year=1965;year<=2016;year++){const option=document.createElement("option");option.value=year;option.textContent=year;$("spectrum-year-select").append(option);}
  $("spectrum-year-select").addEventListener("change",e=>{spectrumYear=+e.target.value;renderSpectrumYear();});
  $("spectrum-open").addEventListener("click",()=>openSpectrumYear(spectrumYear));
  renderSpectrumYear();
  const lowPeak=Math.max(...counts[0]),highPeak=Math.max(...counts[2]);
  $("spectrum-insights").innerHTML='<div><b>'+fmt.format(lowPeak)+' / '+(1965+counts[0].indexOf(lowPeak))+'</b><span>peak annual M5.5–5.9 count</span></div><div><b>'+fmt.format(highPeak)+' / '+(1965+counts[2].indexOf(highPeak))+'</b><span>peak annual M7–7.9 count — a different year</span></div><div><b>'+fmt.format(counts[3].reduce((a,b)=>a+b,0))+' / 52 years</b><span>M8+ records across the full archive</span></div>';

  // B: cumulative exceedance; log vertical axis retains the rare tail.
  const thresholds=Array.from({length:37},(_,i)=>Math.round((5.5+i*.1)*10)/10);
  const exceed=thresholds.map(t=>E.filter(e=>e[5]>=t-1e-8).length);
  const W=560,H=220,L=46,R=12,T=12,B=27, iw=W-L-R,ih=H-T-B;
  const px=t=>L+(t-5.5)/3.6*iw, py=n=>T+(4.5-Math.log10(Math.max(1,n)))/4.5*ih;
  const path=thresholds.map((t,i)=>(i?"L":"M")+px(t).toFixed(1)+","+py(exceed[i]).toFixed(1)).join(" ");
  const area=path+" L"+px(9.1)+","+(H-B)+" L"+L+","+(H-B)+" Z";
  const grid=[1,10,100,1000,10000].map(n=>'<line x1="'+L+'" x2="'+(W-R)+'" y1="'+py(n)+'" y2="'+py(n)+'" stroke="#d8d4ca"/><text x="2" y="'+(py(n)+4)+'" fill="#667068" font-size="10">'+fmt.format(n)+'</text>').join("");
  const ticks=[5.5,6,7,8,9].map(n=>'<text x="'+px(n)+'" y="217" text-anchor="middle" fill="#667068" font-size="10">M'+n.toFixed(1)+'</text>').join("");
  $("exceedance").innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true">'+grid+'<path d="'+area+'" fill="#ef714e27"/><path d="'+path+'" fill="none" stroke="#bd5336" stroke-width="3" vector-effect="non-scaling-stroke"/>'+ticks+'</svg>';
  $("tail-readout").textContent="M7.0+ / "+fmt.format(m7);

  // C: geodesic 500 km neighbourhood, before/after counts on actual calendar days.
  function km(a,b){
    const rad=Math.PI/180,dLat=(b[3]-a[3])*rad,dLon=(b[4]-a[4])*rad;
    const h=Math.sin(dLat/2)**2+Math.cos(a[3]*rad)*Math.cos(b[3]*rad)*Math.sin(dLon/2)**2;
    return 6371*2*Math.asin(Math.min(1,Math.sqrt(h)));
  }
  const options=$("sequence-options");
  anchors.forEach((e,i)=>{
    const b=document.createElement("button");b.type="button";
    b.textContent="M"+e[5].toFixed(1)+" / "+dateLabel(e)+" / "+e[3].toFixed(1)+"°, "+e[4].toFixed(1)+"°";
    b.addEventListener("click",()=>{state.sequence=i;renderSequence();});options.append(b);
  });
  function renderSequence(){
    const anchor=anchors[state.sequence],d0=date(anchor).getTime(),bins=Array(45).fill(0);
    E.forEach(e=>{
      const delta=Math.round((date(e).getTime()-d0)/dayMs);
      if(delta>=-14&&delta<=30&&km(anchor,e)<=500)bins[delta+14]++;
    });
    [...options.children].forEach((b,i)=>b.setAttribute("aria-pressed",i===state.sequence));
    const top=Math.max(...bins,1);
    $("sequence-chart").innerHTML=bins.map((n,i)=>'<div class="bar '+(i===14?"zero":"")+'" style="height:'+Math.max(n?3:1,Math.round(n/top*100))+'%" title="Day '+(i-14)+': '+n+' nearby records"></div>').join("");
    const before=bins.slice(7,14).reduce((a,b)=>a+b,0),after=bins.slice(15,22).reduce((a,b)=>a+b,0);
    $("sequence-chart").setAttribute("aria-label","Around M"+anchor[5].toFixed(1)+" on "+dateLabel(anchor)+", "+before+" records in preceding seven days and "+after+" in following seven days within 500 kilometres. Day zero has "+bins[14]+" records.");
    $("sequence-stat").textContent="Within 500 km / seven days before: "+before+" · seven days after: "+after+". Day 0: "+bins[14]+".";
  }
  renderSequence();

  // D: a date-only catalogue has no defensible within-day event ordering. Keep the
  // strongest row per active day (first source row wins ties) at each threshold.
  const pairCanvas=$("pair-map"),pairCtx=pairCanvas.getContext("2d");
  function drawPairMap(a,b,distance){
    if(!pairCtx)return;
    const rect=pairCanvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
    if(!w||!h)return;
    pairCanvas.width=Math.round(w*dpr);pairCanvas.height=Math.round(h*dpr);pairCtx.setTransform(dpr,0,0,dpr,0,0);
    const project=(lon,lat)=>[(lon+180)/360*w,(90-lat)/180*h];
    pairCtx.fillStyle="#142828";pairCtx.fillRect(0,0,w,h);
    pairCtx.strokeStyle="#47635e";pairCtx.lineWidth=.6;pairCtx.beginPath();
    for(let lon=-180;lon<=180;lon+=30){const x=project(lon,0)[0];pairCtx.moveTo(x,0);pairCtx.lineTo(x,h);}
    for(let lat=-60;lat<=60;lat+=30){const y=project(0,lat)[1];pairCtx.moveTo(0,y);pairCtx.lineTo(w,y);}pairCtx.stroke();
    pairCtx.beginPath();source.land.features.forEach(f=>f.geometry.coordinates.forEach(ring=>{let last=null;ring.forEach(point=>{const [x,y]=project(point[0],point[1]);if(last===null||Math.abs(point[0]-last)>180)pairCtx.moveTo(x,y);else pairCtx.lineTo(x,y);last=point[0];});}));
    pairCtx.fillStyle="#3c514b";pairCtx.fill();
    const vector=e=>{const lat=e[3]*Math.PI/180,lon=e[4]*Math.PI/180;return [Math.cos(lat)*Math.cos(lon),Math.cos(lat)*Math.sin(lon),Math.sin(lat)];};
    const va=vector(a),vb=vector(b),angle=Math.acos(Math.max(-1,Math.min(1,va.reduce((sum,v,i)=>sum+v*vb[i],0)))),denom=Math.sin(angle);
    pairCtx.beginPath();let lastLon=null;
    for(let step=0;step<=100;step++){
      const t=step/100,k0=denom?Math.sin((1-t)*angle)/denom:1-t,k1=denom?Math.sin(t*angle)/denom:t;
      const v=va.map((n,i)=>n*k0+vb[i]*k1),lat=Math.asin(Math.max(-1,Math.min(1,v[2])))*180/Math.PI,lon=Math.atan2(v[1],v[0])*180/Math.PI;
      const [x,y]=project(lon,lat);if(lastLon===null||Math.abs(lon-lastLon)>180)pairCtx.moveTo(x,y);else pairCtx.lineTo(x,y);lastLon=lon;
    }
    pairCtx.strokeStyle="#ffb37a";pairCtx.lineWidth=2.3;pairCtx.shadowColor="#ff9d68";pairCtx.shadowBlur=8;pairCtx.stroke();pairCtx.shadowBlur=0;
    [[a,"A","#fff0d7"],[b,"B","#ff7f59"]].forEach(([e,label,color])=>{const [x,y]=project(e[4],e[3]);pairCtx.beginPath();pairCtx.arc(x,y,5,0,Math.PI*2);pairCtx.fillStyle=color;pairCtx.fill();pairCtx.fillStyle="#fff7e9";pairCtx.font="bold 11px monospace";pairCtx.fillText(label,Math.min(w-15,x+8),Math.max(12,y-8));});
    pairCanvas.setAttribute("aria-label","Geodesic from event A on "+dateLabel(a)+" to event B on "+dateLabel(b)+": "+fmt.format(Math.round(distance))+" kilometres. Arc is the shortest route on a sphere, not a causal connection.");
  }
  const relaySequences={};
  for(const threshold of [6,6.5,7]){
    const byDay=new Map();
    E.forEach(e=>{if(e[5]<threshold)return;const k=key(e),old=byDay.get(k);if(!old||e[5]>old[5])byDay.set(k,e);});
    const sequence=[...byDay.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([,e])=>e);
    relaySequences[threshold]={sequence,distances:sequence.slice(1).map((e,i)=>km(sequence[i],e))};
  }
  const relayLabels=["<500 km","500–2,000","2,000–5,000","5,000–10,000","10,000–15,000",">15,000 km"];
  function renderPair(){
    const {sequence,distances}=relaySequences[state.relayMag],i=Math.min(state.pairIndex,distances.length-1),a=sequence[i],b=sequence[i+1],distance=distances[i];
    state.pairIndex=i;$("pair-range").max=distances.length-1;$("pair-range").value=i;
    $("pair-index").textContent=fmt.format(i+1)+" / "+fmt.format(distances.length);
    $("pair-km").textContent=fmt.format(Math.round(distance));
    $("pair-fill").style.width=Math.min(100,distance/20015*100)+"%";
    $("pair-title").textContent=dateLabel(a)+" → "+dateLabel(b);
    const gap=Math.round((date(b)-date(a))/dayMs);
    $("pair-meta").textContent="M"+a[5].toFixed(1)+" at "+a[3].toFixed(1)+"°, "+a[4].toFixed(1)+"° → M"+b[5].toFixed(1)+" at "+b[3].toFixed(1)+"°, "+b[4].toFixed(1)+"° · "+gap+" day"+(gap===1?"":"s")+" apart. Geographic separation only.";
    drawPairMap(a,b,distance);
  }
  function renderRelay(){
    const data=source.relay[String(state.relayMag)+".0"]||source.relay[String(state.relayMag)];
    if(!data)throw Error("Missing precomputed relay analysis for M"+state.relayMag);
    const maxShare=Math.max(...data.observedCounts,...data.nullMeanCounts)/data.pairs*1.06;
    $("relay-bars").innerHTML=relayLabels.map((label,i)=>{
      const observed=data.observedCounts[i]/data.pairs,baseline=data.nullMeanCounts[i]/data.pairs;
      return '<div class="relay-bar-row" title="'+label+': observed '+(observed*100).toFixed(1)+'%, shuffled mean '+(baseline*100).toFixed(1)+'%; 5–95% shuffled count '+data.nullP05Counts[i]+'–'+data.nullP95Counts[i]+'"><span class="relay-bar-label">'+label+'</span><div class="relay-bar-track"><i class="relay-observed" style="width:'+(observed/maxShare*100).toFixed(1)+'%"></i><i class="relay-null" style="width:'+(baseline/maxShare*100).toFixed(1)+'%"></i></div><strong>'+(observed*100).toFixed(1)+'%</strong></div>';
    }).join("");
    const local=data.observedCounts[0]/data.nullMeanCounts[0],far=data.observedCounts[5]/data.pairs*100,farNull=data.nullMeanCounts[5]/data.pairs*100;
    $("relay-local-ratio").textContent=local.toFixed(1)+"× nearby";
    $("relay-local-copy").textContent=fmt.format(data.observedCounts[0])+" of "+fmt.format(data.pairs)+" consecutive active-day pairs are under 500 km, versus "+data.nullMeanCounts[0].toFixed(1)+" on average after shuffling (5–95%: "+data.nullP05Counts[0]+"–"+data.nullP95Counts[0]+").";
    $("relay-far-ratio").textContent=far.toFixed(1)+"% vs "+farNull.toFixed(1)+"%";
    $("relay-far-copy").textContent=fmt.format(data.observedCounts[5])+" pairs above 15,000 km versus "+data.nullMeanCounts[5].toFixed(1)+" after shuffling (5–95%: "+data.nullP05Counts[5]+"–"+data.nullP95Counts[5]+"). No alternating opposite-side pattern appears here.";
    $("relay-bars").setAttribute("aria-label",relayLabels.map((label,i)=>label+": "+(data.observedCounts[i]/data.pairs*100).toFixed(1)+" percent observed, "+(data.nullMeanCounts[i]/data.pairs*100).toFixed(1)+" percent shuffled").join(". "));
    $("pair-method").textContent=fmt.format(data.records)+" qualifying records cover "+fmt.format(data.days)+" active days; "+fmt.format(data.sameDayExtra)+" other same-day rows have no trustworthy order. One strongest record per day is used.";
    document.querySelectorAll("[data-relay-mag]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.relayMag===state.relayMag));
    renderPair();
  }
  document.querySelectorAll("[data-relay-mag]").forEach(b=>b.addEventListener("click",()=>{state.relayMag=+b.dataset.relayMag;state.pairIndex=0;renderRelay();}));
  $("pair-range").addEventListener("input",e=>{state.pairIndex=+e.target.value;renderPair();});
  $("pair-near").addEventListener("click",()=>{state.pairIndex=relaySequences[state.relayMag].distances.findIndex(d=>d<500);renderPair();});
  $("pair-far").addEventListener("click",()=>{state.pairIndex=relaySequences[state.relayMag].distances.findIndex(d=>d>15000);renderPair();});
  renderRelay();
  new ResizeObserver(()=>{const data=relaySequences[state.relayMag],i=state.pairIndex;drawPairMap(data.sequence[i],data.sequence[i+1],data.distances[i]);}).observe(pairCanvas);

  // E: each longitude sector spans 30°, each latitude band an equal increment
  // of sin(latitude), yielding 72 equal-area sectors on a sphere.
  const tileOf=e=>[Math.min(5,Math.max(0,Math.floor((Math.sin(e[3]*Math.PI/180)+1)*3))),Math.min(11,Math.max(0,Math.floor((e[4]+180)/30)))];
  const tiles=Array(72).fill(0);
  E.forEach(e=>{const [row,col]=tileOf(e);tiles[row*12+col]++;});
  const busiest=[...tiles.keys()].sort((a,b)=>tiles[b]-tiles[a]).slice(0,10);
  const topSet=new Set(busiest),tileShare=busiest.reduce((sum,i)=>sum+tiles[i],0)/E.length;
  $("tile-share").textContent=(tileShare*100).toFixed(1)+"%";
  const tileGrid=$("earth-tiles"),tileMax=Math.max(...tiles);
  const tileCanvas=$("tile-map"),tileCtx=tileCanvas.getContext("2d");
  let selectedTile=busiest[0];
  function tileLabel(row,col){
    const low=Math.asin(-1+row/3)*180/Math.PI,high=Math.asin(-1+(row+1)/3)*180/Math.PI,west=-180+col*30,east=west+30;
    return west+"° to "+east+"° longitude; "+low.toFixed(1)+"° to "+high.toFixed(1)+"° latitude";
  }
  for(let row=5;row>=0;row--)for(let col=0;col<12;col++){
    const id=row*12+col,count=tiles[id],b=document.createElement("button");b.type="button";b.className=topSet.has(id)?"top-tile":"";
    const t=Math.sqrt(count/tileMax);b.style.setProperty("--tile-color","rgb("+[206,225,208].map((v,i)=>Math.round(v+([106,55,44][i]-v)*t)).join(",")+")");
    b.setAttribute("aria-label",tileLabel(row,col)+": "+fmt.format(count)+" catalog records. Locate on linked map.");
    b.title=tileLabel(row,col)+" · "+fmt.format(count)+" records";b.dataset.row=row;b.dataset.col=col;
    b.addEventListener("click",()=>selectTile(selectedTile===id?null:id));
    tileGrid.append(b);
  }
  function selectTile(id){
    selectedTile=id;
    tileGrid.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",id!==null&&+b.dataset.row*12+(+b.dataset.col)===id));
    if(id===null){
      $("tile-map-count").textContent="ALL "+fmt.format(E.length)+" RECORDS";
      $("tile-detail").textContent="All 72 sectors shown. Select a sector in the grid or on the map to locate its catalog epicentres.";
    }else{
      const row=Math.floor(id/12),col=id%12,count=tiles[id],share=count/E.length*100,density=count/(E.length/72);
      $("tile-map-count").textContent=fmt.format(count)+" RECORDS / "+share.toFixed(2)+"% OF ARCHIVE";
      $("tile-detail").textContent=tileLabel(row,col)+": "+fmt.format(count)+" catalog records ("+share.toFixed(2)+"% of the archive; "+density.toFixed(1)+"× the mean sector count). This describes this catalog, not seismic hazard.";
    }
    drawTileMap();
  }
  function drawTileMap(){
    if(!tileCtx)return;
    const rect=tileCanvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(devicePixelRatio||1,2);
    if(!w||!h)return;
    tileCanvas.width=Math.round(w*dpr);tileCanvas.height=Math.round(h*dpr);tileCtx.setTransform(dpr,0,0,dpr,0,0);
    const project=(lon,lat)=>[(lon+180)/360*w,(90-lat)/180*h];
    tileCtx.fillStyle="#102528";tileCtx.fillRect(0,0,w,h);
    if(selectedTile!==null){
      const row=Math.floor(selectedTile/12),col=selectedTile%12;
      const south=Math.asin(-1+row/3)*180/Math.PI,north=Math.asin(-1+(row+1)/3)*180/Math.PI;
      const [x0,y0]=project(-180+col*30,north),[x1,y1]=project(-150+col*30,south);
      tileCtx.fillStyle="#ff9c6240";tileCtx.fillRect(x0,y0,x1-x0,y1-y0);
    }
    tileCtx.beginPath();
    source.land.features.forEach(f=>{
      const polygons=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
      polygons.forEach(p=>p.forEach(ring=>{
        let last=null;ring.forEach(pt=>{
          const [x,y]=project(pt[0],pt[1]);
          if(last===null||Math.abs(pt[0]-last)>180)tileCtx.moveTo(x,y);else tileCtx.lineTo(x,y);
          last=pt[0];
        });
      }));
    });
    tileCtx.fillStyle="#284641";tileCtx.strokeStyle="#6c84766a";tileCtx.lineWidth=.65;tileCtx.fill();tileCtx.stroke();
    tileCtx.strokeStyle="#a7c2ae79";tileCtx.lineWidth=.9;tileCtx.beginPath();
    for(let col=0;col<=12;col++){const x=col/12*w;tileCtx.moveTo(x,0);tileCtx.lineTo(x,h);}
    for(let row=0;row<=6;row++){
      const lat=Math.asin(-1+row/3)*180/Math.PI,y=project(0,lat)[1];
      tileCtx.moveTo(0,y);tileCtx.lineTo(w,y);
    }
    tileCtx.stroke();
    // Draw the entire catalog in muted ink, then the chosen sector on top.
    tileCtx.fillStyle="#b6c8a87a";
    E.forEach(e=>{const [x,y]=project(e[4],e[3]);tileCtx.fillRect(x,y,1.2,1.2);});
    if(selectedTile!==null){
      const row=Math.floor(selectedTile/12),col=selectedTile%12;
      tileCtx.fillStyle="#ffb576";
      E.forEach(e=>{const [r,c]=tileOf(e);if(r!==row||c!==col)return;const [x,y]=project(e[4],e[3]);tileCtx.beginPath();tileCtx.arc(x,y,Math.max(1.4,(e[5]-5.5)*.8),0,Math.PI*2);tileCtx.fill();});
      const south=Math.asin(-1+row/3)*180/Math.PI,north=Math.asin(-1+(row+1)/3)*180/Math.PI;
      const [x0,y0]=project(-180+col*30,north),[x1,y1]=project(-150+col*30,south);
      tileCtx.strokeStyle="#ffe0ac";tileCtx.lineWidth=2.4;tileCtx.strokeRect(x0+1,y0+1,x1-x0-2,y1-y0-2);
    }
    tileCanvas.setAttribute("aria-label",selectedTile===null?
      "World map with 72 equal-area sectors and all "+fmt.format(E.length)+" catalog epicentres.":
      "World map highlighting "+tileLabel(Math.floor(selectedTile/12),selectedTile%12)+" with "+fmt.format(tiles[selectedTile])+" catalog epicentres. Other records remain visible in muted color.");
  }
  tileCanvas.addEventListener("click",e=>{
    const r=tileCanvas.getBoundingClientRect(),lon=(e.clientX-r.left)/r.width*360-180,lat=90-(e.clientY-r.top)/r.height*180;
    if(lon<-180||lon>180||lat<-90||lat>90)return;
    const row=Math.min(5,Math.max(0,Math.floor((Math.sin(lat*Math.PI/180)+1)*3)));
    const col=Math.min(11,Math.max(0,Math.floor((lon+180)/30)));
    const id=row*12+col;selectTile(id===selectedTile?null:id);
  });
  new ResizeObserver(drawTileMap).observe(tileCanvas);
  selectTile(selectedTile);

  const canvas=$("map"),ctx=canvas.getContext("2d");
  if(!ctx){status.textContent="The map cannot initialize in this browser. The source data and analyses above remain available.";return;}
  const xy=(lon,lat,w,h)=>[(lon+180)/360*w,(90-lat)/180*h];
  function inTime(e){
    const start=Math.max(1965,state.year-state.window+1);
    return e[0]>=start&&e[0]<=state.year;
  }
  function filtered(){
    return E.filter(e=>inTime(e)&&e[5]>=state.mag-1e-8);
  }
  function landPath(coordinates,w,h){
    coordinates.forEach(ring=>{
      let last=null;
      ring.forEach(pt=>{
        const [x,y]=xy(pt[0],pt[1],w,h);
        if(!last||Math.abs(pt[0]-last)>180)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        last=pt[0];
      });
    });
  }
  function drawLand(w,h){
    ctx.fillStyle="#142627";ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#294343";ctx.lineWidth=1;ctx.beginPath();
    for(let lon=-180;lon<=180;lon+=30){const x=xy(lon,0,w,h)[0];ctx.moveTo(x,0);ctx.lineTo(x,h);}
    for(let lat=-60;lat<=60;lat+=30){const y=xy(0,lat,w,h)[1];ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();ctx.beginPath();
    source.land.features.forEach(f=>{
      const g=f.geometry;
      if(g.type==="Polygon")landPath(g.coordinates,w,h);
      else if(g.type==="MultiPolygon")g.coordinates.forEach(p=>landPath(p,w,h));
    });
    ctx.fillStyle="#344442";ctx.strokeStyle="#67716a";ctx.lineWidth=.65;ctx.fill();ctx.stroke();
    ctx.strokeStyle="#63736b";ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
  }
  function drawMap(){
    const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;
    if(!w||!h)return;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);drawLand(w,h);
    state.visible=filtered();
    const ordered=[...state.visible].sort((a,b)=>a[5]-b[5]);
    ordered.forEach(e=>{
      const [x,y]=xy(e[4],e[3],w,h),radius=Math.max(1.2,(e[5]-5)*1.3);
      ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);
      ctx.fillStyle=e[5]>=8?"#fff3d7":e[5]>=7?"#ffb67e":e[5]>=6?"#fa8057":"#da6850";
      ctx.globalAlpha=e[5]>=7?.95:e[5]>=6?.64:.39;ctx.fill();
    });
    ctx.globalAlpha=1;
    if(state.selected&&state.visible.includes(state.selected)){
      const [x,y]=xy(state.selected[4],state.selected[3],w,h);
      ctx.strokeStyle="#f9e5bc";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-19,y);ctx.lineTo(x-13,y);ctx.moveTo(x+13,y);ctx.lineTo(x+19,y);ctx.moveTo(x,y-19);ctx.lineTo(x,y-13);ctx.moveTo(x,y+13);ctx.lineTo(x,y+19);ctx.stroke();
    }
    $("map-count").textContent=fmt.format(state.visible.length)+(state.visible.length===1?" record":" records");
    $("magnitude-count").textContent=fmt.format(state.visible.length)+" / "+fmt.format(E.filter(inTime).length)+" in current view";
    renderLargest();
  }
  function renderLargest(){
    const list=$("largest-list");list.replaceChildren();
    [...state.visible].sort((a,b)=>b[5]-a[5]||a[6]-b[6]).slice(0,5).forEach(e=>{
      const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",state.selected===e);
      b.innerHTML="<b>M"+e[5].toFixed(1)+"</b><small>"+dateLabel(e)+"<br>"+e[3].toFixed(2)+"°, "+e[4].toFixed(2)+"°</small>";
      b.addEventListener("click",()=>select(e));list.append(b);
    });
  }
  function select(e){
    state.selected=e;
    $("event-detail").innerHTML="<span>SELECTED EPICENTRE / CSV ROW "+e[6]+"</span><h3>M"+e[5].toFixed(1)+" · "+dateLabel(e)+"</h3><p>"+Math.abs(e[3]).toFixed(3)+"° "+(e[3]>=0?"N":"S")+" / "+Math.abs(e[4]).toFixed(3)+"° "+(e[4]>=0?"E":"W")+"<br>Coordinates are the reported epicentre, not the impacted area.</p>";
    drawMap();
  }
  function renderMap(){
    $("year-output").textContent=state.year;
    $("mag-output").textContent="M"+state.mag.toFixed(1);
    document.querySelectorAll("[data-mag]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.mag===state.mag));
    if(state.selected&&!filtered().includes(state.selected))state.selected=null;
    if(!state.selected)$("event-detail").innerHTML="<span>SELECTED EPICENTRE</span><h3>Choose a record</h3><p>Its date, coordinates, magnitude and source row will appear here.</p>";
    drawMap();
  }
  function syncControls(){$("year-range").value=state.year;$("window-select").value=state.window;$("mag-range").value=state.mag;}
  function stopPlay(){if(state.play){clearInterval(state.play);state.play=null;}$("play").textContent="▶ Play years";$("play").setAttribute("aria-pressed","false");}
  $("year-range").addEventListener("input",e=>{state.year=+e.target.value;stopPlay();renderMap();});
  $("window-select").addEventListener("change",e=>{state.window=+e.target.value;renderMap();});
  $("mag-range").addEventListener("input",e=>{state.mag=+e.target.value;renderMap();});
  document.querySelectorAll("[data-mag]").forEach(b=>b.addEventListener("click",()=>{state.mag=+b.dataset.mag;syncControls();renderMap();}));
  $("reset").addEventListener("click",()=>{stopPlay();state.year=2016;state.window=52;state.mag=5.5;state.selected=null;syncControls();renderMap();});
  $("play").addEventListener("click",()=>{
    if(state.play){stopPlay();return;}
    state.year=1965;state.window=52;state.selected=null;syncControls();renderMap();
    $("play").textContent="Ⅱ Pause";$("play").setAttribute("aria-pressed","true");
    state.play=setInterval(()=>{if(state.year>=2016){stopPlay();return;}state.year++;syncControls();renderMap();},matchMedia("(prefers-reduced-motion: reduce)").matches?550:240);
  });
  function nearest(clientX,clientY){
    const r=canvas.getBoundingClientRect(),x=clientX-r.left,y=clientY-r.top;
    let best=null,dist=14*14;
    state.visible.forEach(e=>{
      const p=xy(e[4],e[3],r.width,r.height),d=(p[0]-x)**2+(p[1]-y)**2;
      if(d<dist||(d===dist&&best&&e[5]>best[5])){dist=d;best=e;}
    });
    return best;
  }
  canvas.addEventListener("click",e=>{const hit=nearest(e.clientX,e.clientY);if(hit)select(hit);});
  canvas.addEventListener("pointermove",e=>{canvas.style.cursor=nearest(e.clientX,e.clientY)?"pointer":"crosshair";});
  canvas.addEventListener("keydown",e=>{
    if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;
    e.preventDefault();
    const top=[...state.visible].sort((a,b)=>b[5]-a[5]||a[6]-b[6]).slice(0,20);
    if(!top.length)return;
    let i=top.indexOf(state.selected);i=(i+(e.key==="ArrowRight"?1:-1)+top.length)%top.length;select(top[i]);
  });
  new ResizeObserver(()=>drawMap()).observe(canvas);
  renderMap();
  status.textContent="Archive ready: "+fmt.format(E.length)+" records; "+source.normalizedIsoDates+" ISO dates normalized.";
  status.classList.add("ready");
})();
