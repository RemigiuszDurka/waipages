/* Madagascar, Measured: every observation comes from the dated local WDI
   snapshot. Derived counts and indices are calculated here from its rows. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const data = window.MDG_DATA;
  const status = $("status");
  const specs = [
    {code:"SP.DYN.LE00.IN",label:"Life expectancy",unit:"years",color:"#a8c99b",format:v=>v.toFixed(1)+" years"},
    {code:"SP.POP.TOTL",label:"Population",unit:"people",color:"#8cb4c4",format:v=>(v/1e6).toFixed(1)+"m"},
    {code:"AG.LND.FRST.ZS",label:"Forest area",unit:"% of land",color:"#b4d491",format:v=>v.toFixed(1)+"%"},
    {code:"EG.ELC.ACCS.ZS",label:"Electricity access",unit:"% of people",color:"#edaa83",format:v=>v.toFixed(1)+"%"},
    {code:"NY.GDP.PCAP.CD",label:"GDP per capita",unit:"current US$",color:"#ecc17a",format:v=>"$"+Math.round(v).toLocaleString("en-US")}
  ];
  if (!data?.snapshot?.indicators || data.snapshot.country !== "MDG" ||
      !data.island?.features?.[0]?.geometry?.coordinates) {
    status.textContent = "The local World Bank snapshot is unavailable. Inspect data/world-bank-mdg.json and rebuild with python tools/build_madagascar_data.py.";
    status.setAttribute("role","alert");
    return;
  }
  try {
  const series = code => data.snapshot.indicators[code].points;
  const exact = (code,year) => series(code).find(p=>p.year===year)?.value;
  const atOrBefore = (code,year) => [...series(code)].reverse().find(p=>p.year<=year);
  const fmt = n => new Intl.NumberFormat("en-US").format(n);
  const one = n => n.toFixed(1);
  const state = {year:2024,presentYear:2024,focus:specs[3].code,play:null};
  const years = Array.from({length:33},(_,i)=>1992+i);
  const access = years.map(year=>{
    const rate=exact("EG.ELC.ACCS.ZS",year),population=exact("SP.POP.TOTL",year);
    if(!Number.isFinite(rate)||!Number.isFinite(population))throw Error("Missing overlapping electricity/population year "+year);
    return {year,rate,population,without:population*(1-rate/100)};
  });
  const forest = Array.from({length:35},(_,i)=>1990+i).map(year=>{
    const share=exact("AG.LND.FRST.ZS",year),population=exact("SP.POP.TOTL",year);
    if(!Number.isFinite(share)||!Number.isFinite(population))throw Error("Missing overlapping forest/population year "+year);
    return {year,share,population};
  });
  const forestBase=forest[0];
  forest.forEach(row=>{
    row.populationIndex=row.population/forestBase.population*100;
    row.forestIndex=row.share/forestBase.share*100;
    row.proxyIndex=row.forestIndex/row.populationIndex*100;
  });

  // The GeoJSON outline is only a location cue. National values never color regions.
  const ring=data.island.features[0].geometry.coordinates[0];
  const path=ring.map(([lon,lat],i)=>`${i?"L":"M"}${(160+(lon-43)/7.6*270).toFixed(1)},${(39+(-11.8-lat)/13.9*555).toFixed(1)}`).join(" ")+" Z";
  for(const id of ["island-shadow","island-fill-path","island-outline","island-trace"])$(id).setAttribute("d",path);
  const traceLength=$("island-trace").getTotalLength();
  $("island-trace").style.strokeDasharray=`${Math.max(55,traceLength*.075)} ${traceLength}`;
  $("island-trace").style.setProperty("--island-length",-traceLength+"px");
  const motionPreference=matchMedia("(prefers-reduced-motion: reduce)");
  let heroMotion=!motionPreference.matches;
  function syncHeroMotion(){
    $("hero-motion").setAttribute("aria-pressed",String(heroMotion));
    $("hero-motion").setAttribute("aria-label",heroMotion?"Pause island animation":"Play island animation");
    $("hero-motion").textContent=heroMotion?"Ⅱ PAUSE MOTION":"▶ PLAY MOTION";
    $("hero-motion").parentElement.classList.toggle("is-paused",!heroMotion);
  }
  $("hero-motion").addEventListener("click",()=>{heroMotion=!heroMotion;syncHeroMotion();});
  motionPreference.addEventListener("change",e=>{heroMotion=!e.matches;syncHeroMotion();});
  syncHeroMotion();
  const heroValues=[
    ["hero-forest","hero-forest-year",specs[2]],
    ["hero-electricity","hero-electricity-year",specs[3]],
    ["hero-pop","hero-pop-year",specs[1]]
  ];
  heroValues.forEach(([valueId,yearId,spec])=>{
    const point=atOrBefore(spec.code,2024);
    $(valueId).textContent=spec.format(point.value);$(yearId).textContent="OBSERVED "+point.year;
  });

  // Discover: coverage and verbatim sample values.
  $("retrieved-date").textContent=data.snapshot.retrieved;
  $("observation-count").textContent=fmt(specs.reduce((n,s)=>n+series(s.code).length,0));
  specs.forEach(spec=>{
    const points=series(spec.code),first=points[0],last=points.at(-1);
    const row=document.createElement("div");row.className="coverage-row";
    const title=document.createElement("div"),strong=document.createElement("strong"),small=document.createElement("small");
    strong.textContent=spec.label;small.textContent=`${points.length} observations · ${first.year}–${last.year}`;
    title.append(strong,small);
    const bar=document.createElement("div");bar.className="coverage-bar";
    const line=document.createElement("i");line.style.left=((first.year-1960)/66*100).toFixed(2)+"%";
    line.style.width=((last.year-first.year+1)/66*100).toFixed(2)+"%";bar.append(line);
    const link=document.createElement("a");link.href=data.snapshot.indicators[spec.code].url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="API ↗";
    row.append(title,bar,link);$("coverage").append(row);
  });
  [[specs[0],1960],[specs[3],1992],[specs[2],2024]].forEach(([spec,year])=>{
    const tr=document.createElement("tr");
    [spec.label,year,String(exact(spec.code,year))].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});
    $("raw-samples").append(tr);
  });

  // Paths are drawn only through the actual observed annual points.
  const svg=(view,inner)=>`<svg viewBox="${view}" preserveAspectRatio="none" aria-hidden="true">${inner}</svg>`;
  const linePath=(rows,value,x,y)=>rows.map((row,i)=>`${i?"L":"M"}${x(row).toFixed(1)},${y(value(row)).toFixed(1)}`).join(" ");
  function pairedChart(container,rows,value,max,color,selectedYear,axis){
    const W=640,H=250,L=45,R=16,T=17,B=22;
    const x=row=>L+(row.year-1992)/32*(W-L-R),y=v=>H-B-v/max*(H-T-B);
    const path=linePath(rows,value,x,y),sel=rows.find(r=>r.year===selectedYear),sx=x(sel),sy=y(value(sel));
    const grid=[0,.25,.5,.75,1].map(t=>`<line x1="${L}" x2="${W-R}" y1="${y(t*max)}" y2="${y(t*max)}" stroke="#9ab1a64c" stroke-width="1"/><text x="3" y="${y(t*max)+4}" fill="#718c7a" font-size="10">${axis(t*max)}</text>`).join("");
    const area=path+` L${x(rows.at(-1)).toFixed(1)},${H-B} L${L},${H-B} Z`;
    container.innerHTML=svg(`0 0 ${W} ${H}`,`<defs><linearGradient id="${container.id}-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#${container.id}-fill)"/><path d="${path}" fill="none" stroke="${color}" stroke-width="3.2" vector-effect="non-scaling-stroke"/><line x1="${sx}" x2="${sx}" y1="${T}" y2="${H-B}" stroke="${color}" stroke-dasharray="4 5"/><circle cx="${sx}" cy="${sy}" r="7" fill="#fffef0" stroke="${color}" stroke-width="3"/>`);
  }
  const firstAccess=access[0],lastAccess=access.at(-1);
  $("access-headline").textContent=`${one(firstAccess.rate)}% → ${one(lastAccess.rate)}% with access. Yet ${one(firstAccess.without/1e6)}m → ${one(lastAccess.without/1e6)}m without.`;
  $("access-explain").textContent=`Between ${firstAccess.year} and ${lastAccess.year}, the access rate rose ${one(lastAccess.rate-firstAccess.rate)} percentage points while the estimated number without access rose ${one((lastAccess.without-firstAccess.without)/1e6)} million.`;
  $("forest-start").textContent=one(forestBase.share)+"%";
  $("forest-end").textContent=one(forest.at(-1).share)+"%";
  $("forest-proxy").textContent=one(forest.at(-1).proxyIndex);

  function forestChart(year){
    const W=760,H=390,L=49,R=22,T=25,B=33,max=285;
    const x=r=>L+(r.year-1990)/34*(W-L-R),y=v=>H-B-v/max*(H-T-B);
    const selected=forest.find(r=>r.year===year),sx=x(selected);
    const grid=[0,50,100,150,200,250].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="${v===100?"#d6e1bf80":"#a5c1ad36"}" stroke-width="1"/><text x="4" y="${y(v)+4}" fill="#a9c6ad" font-size="11">${v}</text>`).join("");
    const lines=[
      [r=>r.populationIndex,"#f5bc79"],
      [r=>r.forestIndex,"#9cce9e"],
      [r=>r.proxyIndex,"#f37c63"]
    ].map(([fn,color])=>`<path d="${linePath(forest,fn,x,y)}" fill="none" stroke="${color}" stroke-width="3" vector-effect="non-scaling-stroke"/>`+`<circle cx="${sx}" cy="${y(fn(selected))}" r="6" fill="#183c33" stroke="${color}" stroke-width="3"/>`).join("");
    $("forest-chart").innerHTML=svg(`0 0 ${W} ${H}`,`${grid}<line x1="${sx}" x2="${sx}" y1="${T}" y2="${H-B}" stroke="#f3e5b8" stroke-dasharray="4 5"/>${lines}<text x="${L}" y="${H-5}" fill="#a9c6ad" font-size="11">1990</text><text x="${W-R}" y="${H-5}" text-anchor="end" fill="#a9c6ad" font-size="11">2024</text>`);
    $("forest-selected-year").textContent=year;
    $("forest-readout").textContent=`${year}: population index ${one(selected.populationIndex)} · forest-share index ${one(selected.forestIndex)} · relative area-per-resident proxy ${one(selected.proxyIndex)} (1990 = 100).`;
    $("forest-chart").setAttribute("aria-label",$("forest-readout").textContent);
  }

  // Present: complete histories retain their physical units and observation years.
  specs.forEach(spec=>{
    const button=document.createElement("button");button.type="button";button.dataset.code=spec.code;
    const title=document.createElement("b"),meta=document.createElement("span");
    title.textContent=spec.label;meta.textContent=spec.unit+" · to "+series(spec.code).at(-1).year;
    button.append(title,meta);button.addEventListener("click",()=>{state.focus=spec.code;renderFocus();});
    $("metric-tabs").append(button);
  });
  function focusChart(spec,point){
    const rows=series(spec.code),W=1100,H=440,L=72,R=28,T=35,B=49;
    const minYear=rows[0].year,maxYear=rows.at(-1).year;
    const vals=rows.map(r=>r.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),pad=(rawMax-rawMin)*.12||1;
    const min=Math.max(0,rawMin-pad),max=rawMax+pad;
    const x=r=>L+(r.year-minYear)/(maxYear-minYear)*(W-L-R),y=v=>H-B-(v-min)/(max-min)*(H-T-B);
    const ticks=Array.from({length:5},(_,i)=>min+i*(max-min)/4);
    const grid=ticks.map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#b6cdb33d"/><text x="${L-10}" y="${y(v)+4}" text-anchor="end" fill="#a7c6ad" font-size="12">${spec.code==="SP.POP.TOTL"?(v/1e6).toFixed(0)+"m":spec.code==="NY.GDP.PCAP.CD"?"$"+v.toFixed(0):v.toFixed(0)}</text>`).join("");
    const path=linePath(rows,r=>r.value,x,y),sx=x(point),sy=y(point.value);
    const dots=rows.map(r=>`<circle cx="${x(r)}" cy="${y(r.value)}" r="2.2" fill="${spec.color}"/>`).join("");
    const stamps=[minYear,Math.round((minYear+maxYear)/2),maxYear].map(year=>`<text x="${x({year})}" y="${H-15}" text-anchor="middle" fill="#a7c6ad" font-size="12">${year}</text>`).join("");
    $("focus-chart").innerHTML=svg(`0 0 ${W} ${H}`,`${grid}<path d="${path}" fill="none" stroke="${spec.color}" stroke-width="3.4" vector-effect="non-scaling-stroke"/>${dots}<line x1="${sx}" x2="${sx}" y1="${T}" y2="${H-B}" stroke="#eddf9d" stroke-dasharray="6 6"/><circle cx="${sx}" cy="${sy}" r="8" fill="#10362e" stroke="#f6e7a5" stroke-width="3"/>${stamps}`);
    $("focus-chart").setAttribute("aria-label",`${spec.label}: ${rows.length} reported observations from ${minYear} to ${maxYear}. At ${point.year}: ${spec.format(point.value)}.`);
  }
  function renderFocus(){
    const spec=specs.find(s=>s.code===state.focus),point=atOrBefore(spec.code,state.presentYear),rows=series(spec.code);
    $("metric-tabs").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.code===state.focus));
    $("focus-title").textContent=spec.label;
    $("focus-value").textContent=spec.format(point.value);
    $("focus-year").textContent=`OBSERVED ${point.year} · ${spec.unit}`;
    $("focus-range").textContent=`${rows.length} VALUES / ${rows[0].year}–${rows.at(-1).year}`;
    $("focus-source").href=data.snapshot.indicators[spec.code].url;
    focusChart(spec,point);
  }
  function renderBoard(){
    $("observation-board").replaceChildren();
    specs.forEach(spec=>{
      const point=atOrBefore(spec.code,state.presentYear),card=document.createElement("div");card.className="observation-card";
      card.style.setProperty("--card-color",spec.color);
      const label=document.createElement("span"),value=document.createElement("strong"),date=document.createElement("small");
      label.textContent=spec.label;value.textContent=point?spec.format(point.value):"—";
      date.textContent=point?`Observed ${point.year}${point.year<state.presentYear?" · latest before selection":""}`:"No observation by "+state.presentYear;
      card.append(label,value,date);$("observation-board").append(card);
    });
  }
  function updateYear(year){
    state.year=year;
    state.presentYear=year;
    $("year-range").value=year;$("year-output").textContent=year;
    $("present-range").value=year;$("present-year").textContent=year;
    document.querySelectorAll("[data-year]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.year===year));
    const row=access.find(r=>r.year===year);
    $("access-rate").textContent=one(row.rate)+"%";
    $("access-rate-delta").textContent=`+${one(row.rate-firstAccess.rate)} pp from 1992`;
    $("without-count").textContent=one(row.without/1e6)+"m";
    $("without-delta").textContent=`${row.without>=firstAccess.without?"+":""}${one((row.without-firstAccess.without)/1e6)}m from 1992`;
    pairedChart($("access-chart"),access,r=>r.rate,50,"#3e8d68",year,v=>Math.round(v)+"%");
    pairedChart($("without-chart"),access,r=>r.without,22e6,"#da7856",year,v=>(v/1e6).toFixed(0)+"m");
    $("access-chart").setAttribute("aria-label",`Access rate in ${year}: ${one(row.rate)} percent; 1992: ${one(firstAccess.rate)} percent; 2024: ${one(lastAccess.rate)} percent.`);
    $("without-chart").setAttribute("aria-label",`Estimated people without access in ${year}: ${one(row.without/1e6)} million; 1992: ${one(firstAccess.without/1e6)} million; 2024: ${one(lastAccess.without/1e6)} million.`);
    forestChart(year);renderFocus();renderBoard();
  }
  function stopPlay(){if(state.play){clearInterval(state.play);state.play=null;}$("year-play").textContent="▶ Play years";$("year-play").setAttribute("aria-pressed","false");}
  $("year-range").addEventListener("input",e=>{stopPlay();updateYear(+e.target.value);});
  $("present-range").addEventListener("input",e=>{
    state.presentYear=+e.target.value;$("present-year").textContent=state.presentYear;
    renderFocus();renderBoard();
  });
  document.querySelectorAll("[data-year]").forEach(b=>b.addEventListener("click",()=>{stopPlay();updateYear(+b.dataset.year);}));
  $("year-play").addEventListener("click",()=>{
    if(state.play){stopPlay();return;}
    updateYear(1992);$("year-play").textContent="Ⅱ Pause";$("year-play").setAttribute("aria-pressed","true");
    state.play=setInterval(()=>{if(state.year>=2024){stopPlay();return;}updateYear(state.year+1);},motionPreference.matches?700:360);
  });
  updateYear(2024);
  status.textContent=`Archive ready: ${specs.length} indicators, ${specs.reduce((n,s)=>n+series(s.code).length,0)} reported observations; snapshot ${data.snapshot.retrieved}.`;
  status.classList.add("ready");
  } catch (error) {
    status.textContent="The Madagascar analysis could not be prepared from the local snapshot: "+error.message;
    status.setAttribute("role","alert");
  }
})();
