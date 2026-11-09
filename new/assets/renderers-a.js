(function rendererA(){
"use strict";
const w=window.LAB_RENDERERS=window.LAB_RENDERERS||{};
w.gapminder=async function([rows],c){
const {N,F,fmt,chart,ranking,corr,median,metrics,insights,titles,select}=c;
const years=[...new Set(rows.map(x=>N(x.year)).filter(F))].sort((a,b)=>a-b);let year=years.at(-1);
select("Year",years.map(String),x=>{year=+x;render()});
titles("Fertility versus life expectancy","Bubble area represents population. Cluster code is defined by the historical source.","Countries with longest lifespans","Highest observed life expectancy for the selected year.");
const pal=["#73baff","#e9af84","#b4a0fa","#6cdca6","#f5cb75","#fa87a6"];
function render(){
const data=rows.filter(x=>N(x.year)===year&&F(N(x.life_expect))&&F(N(x.fertility)));
const cls=[...new Set(data.map(x=>String(x.cluster)))].sort();
const traces=cls.map((k,i)=>{const d=data.filter(x=>String(x.cluster)===k);return {type:"scatter",mode:"markers",name:"Cluster "+k,x:d.map(x=>N(x.fertility)),y:d.map(x=>N(x.life_expect)),text:d.map(x=>x.country),marker:{color:pal[i%pal.length],size:d.map(x=>Math.max(6,Math.sqrt(N(x.pop))/480)),opacity:.7,line:{color:"#182b43",width:1}},hovertemplate:"%{text}<br>Children/woman: %{x:.2f}<br>Life expectancy: %{y:.1f}<extra></extra>"};});
chart("primary",traces,{xaxis:{title:"Fertility (children/woman)"},yaxis:{title:"Life expectancy (years)"}});
const top=[...data].sort((a,b)=>N(b.life_expect)-N(a.life_expect)).slice(0,10).reverse();
chart("secondary",[{type:"bar",orientation:"h",x:top.map(x=>N(x.life_expect)),y:top.map(x=>x.country),marker:{color:"#b5a1fb"}}],{margin:{l:113,r:10,t:12,b:40},xaxis:{title:"Years"},showlegend:false});
const rr=corr(data.map(x=>N(x.fertility)),data.map(x=>N(x.life_expect)));
metrics([["Snapshot",year],["Countries",data.length],["Median lifespan",fmt(median(data.map(x=>N(x.life_expect))),1)+" y"],["Pearson r",fmt(rr,2)]]);
insights([`Median observed life expectancy across the ${data.length} countries is ${fmt(median(data.map(x=>N(x.life_expect))),1)} years.`,`Fertility and life expectancy have cross-country Pearson correlation r=${fmt(rr,2)} within the selected snapshot.`,`Observational association is not causal; the dataset includes historical estimates and some missing-country coverage.`]);
}render();
};
})();
