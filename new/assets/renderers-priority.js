(function priorityLabs(){
"use strict";
const R=window.LAB_RENDERERS=window.LAB_RENDERERS||{};
const motion=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
function action(root,label,callback){const b=document.createElement("button");b.type="button";b.textContent=label;b.addEventListener("click",callback);root.append(b);return b;}
function changeRange(input,value){input.value=String(value);const output=input.parentElement.querySelector("strong");if(output)output.textContent=String(value);input.dispatchEvent(new Event("input",{bubbles:true}));}
function deepViews(c,heading,items){
 const section=document.createElement("section");section.className="deep-section";section.setAttribute("aria-label",heading);
 const label=document.createElement("div");label.className="deep-heading";label.innerHTML=`<span class="eyebrow">ANALYZE / GO DEEPER</span><h2></h2>`;label.querySelector("h2").textContent=heading;section.append(label);
 const grid=document.createElement("div");grid.className="deep-grid";
 for(const item of items){const panel=document.createElement("div");panel.className="panel deep-panel";const h=document.createElement("h3");h.textContent=item.title;const p=document.createElement("p");p.textContent=item.subtitle;const body=document.createElement("div");body.id=item.id;body.className=item.custom?"deep-custom":"plot deep-plot";if(!item.custom){body.setAttribute("role","img");body.setAttribute("aria-label",item.title+". "+item.subtitle)}panel.append(h,p,body);grid.append(panel);}
 section.append(grid);c.$("lab").querySelector(".charts").after(section);return section;
}

R.exoplanets=async function([raw],c){
 const {N,F,fmt,ranking,chart,metrics,insights,titles,select,slider}=c;
 const data=raw.map(v=>({...v,year:N(v.discovery_year),radius:N(v.radius_multiplier)*(String(v.radius_wrt).toLowerCase()==="jupiter"?11.21:String(v.radius_wrt).toLowerCase()==="earth"?1:NaN),mass:N(v.mass_multiplier)*(String(v.mass_wrt).toLowerCase()==="jupiter"?317.83:String(v.mass_wrt).toLowerCase()==="earth"?1:NaN)})).filter(v=>F(v.year));
 const years=[...new Set(data.map(v=>v.year))].sort((a,b)=>a-b),methods=ranking(data,v=>v.detection_method||"Unknown").map(v=>v.key);
 const types=ranking(data,v=>v.planet_type||"Unclassified").map(v=>v.key);
 let year=years.at(-1),method="All",type="All",playing=false,timer=null;
 select("Discovery method",["All",...methods],value=>{method=value;render()});
 select("Planet type",["All",...types],value=>{type=value;render()});
 const scrub=slider("Through year",years[0],years.at(-1),year,value=>{year=value;render()});
 const play=action(c.$("controls"),"▶ Play discoveries",()=>{playing=!playing;play.textContent=playing?"❚❚ Pause":"▶ Play discoveries";play.setAttribute("aria-pressed",String(playing));if(timer)clearInterval(timer);if(playing)timer=setInterval(()=>{changeRange(scrub,year>=years.at(-1)?years[0]:year+1);},motion()?650:260);});play.setAttribute("aria-pressed","false");window.addEventListener("pagehide",()=>clearInterval(timer));
 titles("Discovery field","Each point is a catalog record with a reported radius; play the archive forward to see how detection methods change the observed sample.","Cumulative discovery record","The stacked bands count archived detections by method through the selected year.");
 const colors=["#80c9ff","#ffb47e","#c5a5ff","#79d8ab","#f8d27e","#f38db3","#8ddde2","#a5b4c5"];
 deepViews(c,"Read the catalog beneath the dots",[
  {id:"exo-mass-radius",title:"Mass × radius",subtitle:"Both reported quantities, converted to Earth units; log scales expose orders of magnitude."},
  {id:"exo-method-type",title:"Method × planet type",subtitle:"Record counts reveal how observed categories depend on detection method."},
  {id:"exo-coverage",title:"Measurement coverage",subtitle:"The share of active records with a usable reported radius, mass, or both."}
 ]);
 function render(){const subset=data.filter(v=>v.year<=year&&(method==="All"||v.detection_method===method)&&(type==="All"||v.planet_type===type));const valid=subset.filter(v=>F(v.radius)&&v.radius>0);
  const kinds=ranking(valid,v=>v.planet_type||"Unclassified").slice(0,8).map(v=>v.key);
  chart("primary",kinds.map(kind=>{const group=valid.filter(v=>(v.planet_type||"Unclassified")===kind);return {type:"scattergl",mode:"markers",name:kind,x:group.map(v=>v.year),y:group.map(v=>v.radius),text:group.map(v=>v.name),marker:{size:6,color:colors[types.indexOf(kind)%colors.length],opacity:.73},hovertemplate:"%{text}<br>Discovered %{x}<br>Radius %{y:.2f} Earth radii<extra>%{fullData.name}</extra>"};}),{xaxis:{title:"Discovery year",range:[years[0]-1,years.at(-1)+1]},yaxis:{title:"Planet radius · Earth radii (log)",type:"log"},shapes:[{type:"line",x0:year,x1:year,yref:"paper",y0:0,y1:1,line:{color:"#ffffff",width:1,dash:"dot"}}]});
  const selectedMethods=method==="All"?methods.slice(0,7):[method];const traces=selectedMethods.map((name,i)=>({type:"scatter",mode:"lines",stackgroup:"one",name,x:years.filter(y=>y<=year),y:years.filter(y=>y<=year).map(y=>data.filter(v=>v.year<=y&&v.detection_method===name&&(type==="All"||v.planet_type===type)).length),line:{color:colors[i%colors.length],width:1.4},hovertemplate:"Through %{x}: %{y:,} records<extra>%{fullData.name}</extra>"}));
  chart("secondary",traces.map(t=>({...t,mode:"lines+markers",marker:{size:3}})),{xaxis:{title:"Discovery year",range:[years[0]-1,years.at(-1)+1]},yaxis:{title:"Cumulative records",rangemode:"tozero"},legend:{orientation:"h",y:1.25,font:{size:10}}});
  const paired=subset.filter(v=>v.radius>0&&v.mass>0&&F(v.radius)&&F(v.mass));
  chart("exo-mass-radius",types.filter(t=>paired.some(v=>v.planet_type===t)).map(t=>{const rows=paired.filter(v=>v.planet_type===t);return {type:"scattergl",mode:"markers",name:t,x:rows.map(v=>v.radius),y:rows.map(v=>v.mass),text:rows.map(v=>v.name),marker:{size:5,color:colors[types.indexOf(t)%colors.length],opacity:.65},hovertemplate:"%{text}<br>Radius %{x:.2f} Earth radii<br>Mass %{y:.2f} Earth masses<extra>%{fullData.name}</extra>"}}),{xaxis:{title:"Reported radius · Earth radii",type:"log"},yaxis:{title:"Reported mass · Earth masses",type:"log"},legend:{orientation:"h",y:1.22,font:{size:10}}});
  const methodNames=method==="All"?methods.slice(0,7):[method],kindNames=type==="All"?types:[type];
  chart("exo-method-type",[{type:"heatmap",x:methodNames,y:kindNames,z:kindNames.map(k=>methodNames.map(m=>subset.filter(v=>v.planet_type===k&&v.detection_method===m).length)),colorscale:[[0,"#11283c"],[.3,"#357caa"],[1,"#8be4ed"]],colorbar:{title:"Records",thickness:9},hovertemplate:"%{y} · %{x}<br>%{z:,} records<extra></extra>"}],{margin:{l:110,r:20,t:20,b:112},xaxis:{tickangle:-35},yaxis:{automargin:true}});
  const covered=[subset.filter(v=>v.radius>0&&F(v.radius)).length,subset.filter(v=>v.mass>0&&F(v.mass)).length,paired.length],coverageNames=["Radius","Mass","Both"];
  chart("exo-coverage",[{type:"bar",orientation:"h",x:covered.map(n=>subset.length?100*n/subset.length:0),y:coverageNames,text:covered.map(n=>`${fmt(n,0)} / ${fmt(subset.length,0)}`),textposition:"inside",marker:{color:["#80c9ff","#c5a5ff","#79d8ab"]},hovertemplate:"%{y}: %{text} records<extra></extra>"}],{margin:{l:68,r:20,t:20,b:50},xaxis:{title:"Share of active records · %",range:[0,100]},showlegend:false});
  const lead=ranking(subset,v=>v.detection_method||"Unknown")[0];metrics([["Archived planets",fmt(data.length,0)],["Visible through year",fmt(subset.length,0)],["Reported radii",fmt(valid.length,0)],["Leading method",lead?.key||"n/a"]]);
  insights([`${fmt(subset.length,0)} archived records meet the active filters; ${fmt(valid.length,0)} have usable radii and ${fmt(paired.length,0)} have both positive mass and radius.`,lead?`${lead.key} accounts for ${fmt(lead.n,0)} records in the selected slice.`:"No records in this slice.","Method and planet-type counts describe this discovered sample, not the underlying planet population. Reported masses may be method-dependent estimates."]);}
 render();c.$("method").textContent="Third-party NASA Exoplanet Archive snapshot, discovery years 1992–2023. Reported Jupiter radii and masses are multiplied by 11.21 and 317.83 respectively to express Earth units; nonpositive and missing values are excluded only from plots requiring them. The mass–radius plot requires both quantities. Method counts include all records in the active year and planet-type slice. This is a historical, detection-biased sample, not a current planet census.";
};

R.earthquakes=async function([raw],c){
 const {N,F,fmt,chart,geo,metrics,insights,titles,slider}=c;
 const data=raw.map(v=>({...v,lat:N(v.Latitude),lon:N(v.Longitude),mag:N(v.Magnitude),year:Number(String(v.Date).split("/").at(-1))})).filter(v=>[v.lat,v.lon,v.mag,v.year].every(F)&&Math.abs(v.lat)<=90&&Math.abs(v.lon)<=180);
 const years=[...new Set(data.map(v=>v.year))].sort((a,b)=>a-b);let year=years.at(-1),threshold=6,region="World",playing=false,timer=null;
 const scrub=slider("Through year",years[0],year,year,value=>{year=value;render()});
 slider("Magnitude ≥",5,8,threshold,value=>{threshold=value;render()},.2);
 c.select("Latitude band",["World","Northern extratropics","Tropics","Southern extratropics"],value=>{region=value;render()});
 const play=action(c.$("controls"),"▶ Animate archive",()=>{playing=!playing;play.textContent=playing?"❚❚ Pause":"▶ Animate archive";play.setAttribute("aria-pressed",String(playing));if(timer)clearInterval(timer);if(playing)timer=setInterval(()=>changeRange(scrub,year>=years.at(-1)?years[0]:year+1),motion()?900:230);});play.setAttribute("aria-pressed","false");window.addEventListener("pagehide",()=>clearInterval(timer));
 titles("Tectonic pulse","Recorded epicentres accumulate through the archive. Set a magnitude threshold, then play the record through time.","Magnitude by year","Each heatmap cell counts source records in a year and half-magnitude band.");
 deepViews(c,"Interrogate the seismic archive",[
  {id:"quake-exceedance",title:"Magnitude exceedance",subtitle:"Number of active catalog events at or above each threshold; logarithmic count axis."},
  {id:"quake-annual",title:"Annual record counts",subtitle:"All qualifying source records by year, grouped into magnitude ranges."},
  {id:"quake-latitude",title:"Where the records sit",subtitle:"Latitude distribution of active epicentres in ten-degree bands."}
 ]);
 const inRegion=v=>region==="World"||region==="Northern extratropics"&&v.lat>23.5||region==="Tropics"&&Math.abs(v.lat)<=23.5||region==="Southern extratropics"&&v.lat< -23.5;
 function render(){const subset=data.filter(v=>v.year<=year&&v.mag>=threshold&&inRegion(v));const ratio=Math.max(1,Math.ceil(subset.length/6500)),mapped=subset.filter((_,i)=>i%ratio===0);
  chart("primary",[{type:"scattergeo",mode:"markers",lat:mapped.map(v=>v.lat),lon:mapped.map(v=>v.lon),text:mapped.map(v=>`${v.Date} · M${v.mag.toFixed(1)}`),marker:{size:mapped.map(v=>Math.max(3,(v.mag-4)*2.8)),color:mapped.map(v=>v.year),colorscale:[[0,"#6db8ff"],[.5,"#f3c17e"],[1,"#ff806e"]],cmin:years[0],cmax:years.at(-1),opacity:.72,colorbar:{title:"Year",thickness:8}},hovertemplate:"%{text}<extra></extra>"}],{geo:geo(),margin:{l:0,r:0,t:0,b:0},showlegend:false});
  const bands=Array.from({length:9},(_,i)=>5+i*.5),period=years.filter(y=>y<=year),annual=new Map(period.map(y=>[y,Array(bands.length).fill(0)]));for(const v of subset){const bin=Math.floor((v.mag-5)/.5);if(bin>=0&&bin<bands.length)annual.get(v.year)[bin]++;}const z=bands.map((_,i)=>period.map(y=>annual.get(y)[i]));
  chart("secondary",[{type:"heatmap",x:period,y:bands,z,colorscale:[[0,"#10263d"],[.25,"#3f789e"],[.65,"#edac7c"],[1,"#ff735f"]],colorbar:{title:"Events",thickness:8},hovertemplate:"%{x} · M%{y:.1f}–%{customdata:.1f}<br>%{z:,} records<extra></extra>",customdata:bands.map(m=>period.map(()=>m+.5))}],{xaxis:{title:"Year",range:[years[0]-.5,years.at(-1)+.5]},yaxis:{title:"Magnitude band"},margin:{l:49,r:20,t:12,b:43}});
  const cuts=Array.from({length:Math.round((9-threshold)/.2)+1},(_,i)=>+(threshold+i*.2).toFixed(1));
  chart("quake-exceedance",[{type:"scatter",mode:"lines+markers",x:cuts,y:cuts.map(m=>subset.filter(v=>v.mag>=m).length),line:{color:"#ffa87c",width:3},marker:{size:4},hovertemplate:"M ≥ %{x:.1f}<br>%{y:,} catalog records<extra></extra>"}],{xaxis:{title:"Magnitude threshold"},yaxis:{title:"Events at or above threshold",type:"log"},showlegend:false});
  const groups=[{name:"M5–5.9",min:5,max:6,color:"#7dbfe7"},{name:"M6–6.9",min:6,max:7,color:"#e9b47e"},{name:"M7+",min:7,max:Infinity,color:"#ff746a"}];
  chart("quake-annual",groups.map(g=>({type:"bar",name:g.name,x:period,y:period.map(y=>subset.filter(v=>v.year===y&&v.mag>=g.min&&v.mag<g.max).length),marker:{color:g.color},hovertemplate:"%{x}: %{y:,} records<extra>%{fullData.name}</extra>"})),{barmode:"stack",xaxis:{title:"Year"},yaxis:{title:"Catalog records"},legend:{orientation:"h",y:1.2}});
  const latBins=Array.from({length:18},(_,i)=>-85+i*10),latCounts=latBins.map(center=>subset.filter(v=>v.lat>=center-5&&v.lat<center+5).length);
  chart("quake-latitude",[{type:"bar",x:latBins,y:latCounts,marker:{color:latBins.map(v=>v< -23.5?"#8eb6fa":v>23.5?"#ffb47e":"#e6a2cf")},hovertemplate:"%{x}° band: %{y:,} records<extra></extra>"}],{xaxis:{title:"Epicentre latitude · 10° bands"},yaxis:{title:"Catalog records"},showlegend:false});
  const strongest=subset.reduce((a,b)=>!a||b.mag>a.mag?b:a,null);metrics([["Catalog records",fmt(data.length,0)],["Active records",fmt(subset.length,0)],["Mapped epicentres",fmt(mapped.length,0)],["Largest active magnitude",strongest?`M${fmt(strongest.mag,1)}`:"n/a"]]);
  insights([`${fmt(subset.length,0)} records pass the filters; the map draws ${fmt(mapped.length,0)} deterministic samples, while every statistical panel counts all active records.`,strongest?`The largest active event is M${fmt(strongest.mag,1)} on ${strongest.Date}.`:"No records pass these filters.","Raw earthquake counts depend on detection and catalog completeness. They do not measure a change in underlying geological hazard."]);}
 render();c.$("method").textContent="Plotly historical earthquake catalog, 1965–2016. Magnitudes, dates, and epicentres are read from the committed CSV. Heatmap, annual bars, exceedance curve, and latitude histogram count every active record; the map deterministically samples at most about 6,500 markers for performance. Exceedance cutoffs step by 0.2 magnitude; latitude bins span 10 degrees. Magnitude is logarithmic, so bins are not energy-equivalent. Sensor coverage and catalog completeness changed across decades.";
};

R.madagascar=async function([shape,snapshot],c){
 const {N,F,fmt,chart,geo,metrics,insights,titles,select,slider}=c;
 const indicators=[
  {code:"SP.DYN.LE00.IN",name:"Life expectancy",unit:"years",color:"#9ce2b9"},
  {code:"SP.POP.TOTL",name:"Population",unit:"people",color:"#83c8f6"},
  {code:"AG.LND.FRST.ZS",name:"Forest area",unit:"% of land area",color:"#89d5a3"},
  {code:"EG.ELC.ACCS.ZS",name:"Electricity access",unit:"% of people",color:"#f3cb86"},
  {code:"NY.GDP.PCAP.CD",name:"GDP per capita",unit:"current US$",color:"#c5a7f1"}
 ];
 const series=code=>snapshot.indicators[code]?.points||[];
 if(!indicators.every(i=>series(i.code).length))throw Error("World Bank snapshot is missing an indicator series.");
 let focus=indicators[0],comparison="None",year=Math.max(...indicators.flatMap(i=>series(i.code).map(p=>p.year))),start=1990,sourceLink;
 const focusInput=select("Indicator",indicators.map(i=>[i.code,i.name]),code=>{focus=indicators.find(i=>i.code===code);render()});
 select("Compare against",[["None","No comparison"],...indicators.map(i=>[i.code,i.name])],code=>{comparison=code;render()});
 const yearSlider=slider("Inspect year",1960,year,year,value=>{year=value;render()});
 slider("Window starts",1960,2024,start,value=>{start=value;render()});
 const jump=action(c.$("controls"),"Latest data",()=>changeRange(yearSlider,+yearSlider.max));
 titles("Madagascar, measured","Five official national World Bank indicator histories from a dated local snapshot. Inspect a year or compare changes on a common index.","Island outline","Geographic context only. The measurements are national averages, not regional estimates.");
 deepViews(c,"Five signals, one country",[
  {id:"mdg-sparklines",title:"Indicator trajectories",subtitle:"Each series keeps its own units. Select a card to inspect the full record.",custom:true},
  {id:"mdg-change",title:"Change within the selected window",subtitle:"Percent change between each indicator’s first and last actual observation inside the window."}
 ]);
 const coords=shape.features?.[0]?.geometry?.coordinates?.[0]||[];
 chart("secondary",[{type:"scattergeo",mode:"lines",lon:coords.map(p=>p[0]),lat:coords.map(p=>p[1]),fill:"toself",fillcolor:"rgba(91,220,165,.32)",line:{color:"#9ef2bc",width:3},hovertemplate:"Madagascar · national indicators<extra></extra>"}],{geo:geo({projection:{type:"mercator"},landcolor:"#11283b",oceancolor:"#091a2c",lataxis:{range:[-28,-10]},lonaxis:{range:[42,52]},showcountries:false}),margin:{l:0,r:0,t:0,b:0},showlegend:false});
 const extra=document.createElement("div");extra.className="indicator-board";c.$("extra").replaceChildren(extra);
 function nearest(points,y){return [...points].reverse().find(p=>p.year<=y);}
 function render(){const points=series(focus.code),other=indicators.find(i=>i.code===comparison&&i.code!==focus.code),secondary=other?series(other.code):[];
  if(sourceLink)sourceLink.href=snapshot.indicators[focus.code].url;
  let traces=[],axisTitle=focus.name+" ("+focus.unit+")";if(other){const overlap=Math.max(points[0].year,secondary[0].year),baseA=points.find(p=>p.year>=overlap),baseB=secondary.find(p=>p.year>=overlap);axisTitle=`Index (${overlap} = 100)`;
   traces=[{i:focus,p:points,b:baseA},{i:other,p:secondary,b:baseB}].map(({i,p,b})=>({type:"scatter",mode:"lines+markers",name:i.name,x:p.filter(v=>v.year>=overlap).map(v=>v.year),y:p.filter(v=>v.year>=overlap).map(v=>100*v.value/b.value),line:{color:i.color,width:3},marker:{size:4},hovertemplate:"%{x}: %{y:.1f} index<extra>%{fullData.name}</extra>"}));
  }else traces=[{type:"scatter",mode:"lines+markers",name:focus.name,x:points.map(p=>p.year),y:points.map(p=>p.value),line:{color:focus.color,width:3},marker:{size:5},fill:"tozeroy",fillcolor:"rgba(120,220,170,.12)",hovertemplate:`%{x}: %{y:,.2f} ${focus.unit}<extra></extra>`}];
  chart("primary",traces,{xaxis:{title:"Year"},yaxis:{title:axisTitle},shapes:[{type:"line",x0:year,x1:year,yref:"paper",y0:0,y1:1,line:{color:"#ffffff",width:1,dash:"dot"}}],showlegend:!!other});
  const cards=document.getElementById("mdg-sparklines");cards.replaceChildren();const changes=[];
  for(const i of indicators){const active=series(i.code).filter(p=>p.year>=start&&p.year<=year),firstPoint=active[0],lastPoint=active.at(-1),card=document.createElement("button");card.type="button";card.className="spark-card"+(focus.code===i.code?" is-active":"");card.setAttribute("aria-label",`Inspect ${i.name}`);card.addEventListener("click",()=>{focus=i;focusInput.value=i.code;render()});
   const title=document.createElement("span");title.className="spark-title";title.textContent=i.name;const value=document.createElement("strong");value.textContent=lastPoint?`${fmt(lastPoint.value,i.unit==="people"?0:1)} ${i.unit}`:"No observation";const dates=document.createElement("small");dates.textContent=firstPoint&&lastPoint?`${firstPoint.year} → ${lastPoint.year}`:"No data in window";card.append(title,value,dates);
   if(active.length>1){const min=Math.min(...active.map(p=>p.value)),max=Math.max(...active.map(p=>p.value)),span=max-min||1,width=240,height=54,lo=active[0].year,hi=active.at(-1).year;const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("aria-hidden","true");const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d",active.map((p,n)=>`${n?"L":"M"}${((p.year-lo)/(hi-lo||1)*width).toFixed(1)},${(height-5-(p.value-min)/span*(height-10)).toFixed(1)}`).join(" "));path.setAttribute("fill","none");path.setAttribute("stroke",i.color);path.setAttribute("stroke-width","2.5");path.setAttribute("vector-effect","non-scaling-stroke");svg.append(path);card.append(svg);changes.push({i,firstPoint,lastPoint,pct:100*(lastPoint.value-firstPoint.value)/firstPoint.value});}cards.append(card);}
  chart("mdg-change",[{type:"bar",orientation:"h",y:changes.map(x=>x.i.name),x:changes.map(x=>x.pct),customdata:changes.map(x=>`${x.firstPoint.year}–${x.lastPoint.year}`),marker:{color:changes.map(x=>x.pct<0?"#ef947e":x.i.color)},hovertemplate:"%{y}: %{x:+.1f}%<br>Observed %{customdata}<extra></extra>"}],{margin:{l:125,r:23,t:18,b:58},xaxis:{title:"Change between observed endpoints · %",zeroline:true,zerolinecolor:"#cbddeb"},yaxis:{automargin:true},showlegend:false});
  const current=nearest(points,year),first=points[0],latest=points.at(-1),display=current?`${fmt(current.value,focus.unit==="people"?0:2)} ${focus.unit}`:"No observation yet";
  metrics([["Indicator",focus.name],["At or before selected year",current?current.year:"n/a"],["Measured value",display],["Latest archive year",latest.year]]);
  extra.replaceChildren();const kicker=document.createElement("span");kicker.className="feature-eyebrow";kicker.textContent="NATIONAL INDICATOR / ARCHIVE";const heading=document.createElement("h3");heading.textContent=String(year);extra.append(kicker,heading);
  for(const i of indicators){const value=nearest(series(i.code),year);const row=document.createElement("div");row.className="indicator-row";const name=document.createElement("span");name.textContent=i.name;const amount=document.createElement("strong");amount.textContent=value?`${fmt(value.value,i.unit==="people"?0:1)} ${i.unit} · ${value.year}`:"No earlier value";row.append(name,amount);extra.append(row);}
  insights([`${focus.name} changes from ${fmt(first.value,2)} ${focus.unit} in ${first.year} to ${fmt(latest.value,2)} ${focus.unit} in ${latest.year}.`,other?`The comparison indexes both series to 100 in their first overlapping year; it does not equate their units.`:`Select a comparison to view relative change against another national indicator.`,`Window comparisons use each series’ actual endpoint years, which may differ. Forest area is a FAO/WDI land-use measure; Global Forest Watch tree-cover loss is different and its pre-2015 Madagascar values have a method break.`]);
 }
 render();c.$("method").textContent=`World Bank Open Data API snapshot retrieved ${snapshot.retrieved}; the five national series are committed locally for reproducibility. Null years were omitted, and the selected-year board shows the latest available observation at or before that year. Window cards and percent changes use each series' first and last actual observations inside the selected period, so endpoint years may differ. The comparison indexes each series to 100 at its first overlapping year. GDP per capita is in current US dollars, so inflation affects it. The island outline conveys location only. GFW tree-cover loss differs from FAO/WDI forest area; GFW warns that pre-2015 loss in Madagascar is underreported because of a methodology change.`;
 sourceLink=document.createElement("a");sourceLink.href=snapshot.indicators[focus.code].url;sourceLink.textContent="World Bank API record ↗";sourceLink.target="_blank";sourceLink.rel="noopener noreferrer";c.$("provenance").append(document.createElement("br"),sourceLink);
};
})();
