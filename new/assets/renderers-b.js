(function rendererB(){
"use strict";
const w=window.LAB_RENDERERS=window.LAB_RENDERERS||{};
w.migration=async function([data],c){
const {N,F,fmt,chart,geo,metrics,insights,titles,select}=c;
const rows=data.map(x=>({...x,day:N(x.day),lon:N(x.lon),lat:N(x.lat)})).filter(x=>[x.day,x.lon,x.lat].every(F));
const species=[...new Set(rows.map(x=>x.species))].sort();let chosen="All";
select("Species",["All",...species],s=>{chosen=s;render()});
titles("Routes across continents","Observations joined in tracking order; path between fixes is an approximation.","Latitude versus observation day","Seasonal north–south movement over time.");
const pal=["#84c5fb","#f5a0b1","#89deb3","#c5a6fb","#ffc987","#7ee2e2"];
function render(){
const kinds=chosen==="All"?species:[chosen],series=kinds.map((s,i)=>({s,d:rows.filter(x=>x.species===s).sort((a,b)=>a.day-b.day),color:pal[i%pal.length]}));
chart("primary",series.map(x=>({type:"scattergeo",mode:"lines+markers",name:x.s,lon:x.d.map(y=>y.lon),lat:x.d.map(y=>y.lat),text:x.d.map(y=>y.date),marker:{size:3,color:x.color},line:{color:x.color,width:1.6},hovertemplate:"%{text}<br>Lat %{lat:.2f}, Lon %{lon:.2f}<extra>%{fullData.name}</extra>"})),{geo:geo(),margin:{l:5,r:5,t:5,b:5}});
chart("secondary",series.map(x=>({type:"scatter",mode:"lines",name:x.s,x:x.d.map(v=>v.day),y:x.d.map(v=>v.lat),line:{color:x.color,width:2}})),{xaxis:{title:"Observation day"},yaxis:{title:"Latitude (°)"}});
const subset=series.flatMap(x=>x.d);
metrics([["GPS positions",fmt(subset.length,0)],["Species",kinds.length],["Observation days",new Set(subset.map(x=>x.day)).size],["Maximum latitude",fmt(Math.max(...subset.map(x=>x.lat)),1)+"°"]]);
insights([`${kinds.length} species are represented by ${fmt(subset.length,0)} positional fixes.`,`Plotting latitude against tracking day separates northbound from southbound movement.`,`Straight segments between sampled positions are not precise paths; no continuous flight speeds are inferred.`]);
}render();
};
})();
