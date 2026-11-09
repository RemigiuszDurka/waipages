import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import vm from "node:vm";
const root=path.resolve(import.meta.dirname,"..");
const projects=JSON.parse(fs.readFileSync(path.join(root,"assets/projects.js"),"utf8").replace(/^window.PROJECTS\s*=\s*/,"").replace(/;\s*$/,""));
assert.deepEqual(projects.map(p=>p.id),[1,2,4,6,11,12]);
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
for(const p of projects){
 assert(fs.existsSync(path.join(root,"projects",p.slug,"index.html")),"Missing page for "+p.slug);
 assert(fs.existsSync(path.join(root,"projects",p.slug,"README.md")),"Missing README for "+p.slug);
 for(const data of p.data){
  const rel=path.join("projects",p.slug,data);
  const src=read(rel);
  assert(src.length>10,"Empty data file: "+rel);
  if(rel.endsWith(".json"))JSON.parse(src);
  else assert(src.includes("\n"),"CSV with no records: "+rel);
 }
}
const localContext={window:{}};
vm.runInNewContext(read("assets/local-data.js"),localContext);
assert.deepEqual(Object.keys(localContext.window.LOCAL_DATA).sort(),projects.flatMap(p=>p.data.map(data=>`${p.slug}/${data}`)).sort());
for(const p of projects)for(const data of p.data){
 const rel=path.join("projects",p.slug,data);
 assert(localContext.window.LOCAL_DATA[`${p.slug}/${data}`]===read(rel).replace(/^\uFEFF/,""),`Stale local data bundle: ${rel}`);
}
const starCSV=read("projects/11-stellar-neighborhood/data/recons_top100_nearest_stars.csv");
const quakeContext={window:{}};
vm.runInNewContext(read("projects/02-earthquake-atlas/data/quake-data.js"),quakeContext);
const quake=quakeContext.window.QUAKE_DATA;
const quakeRows=read("projects/02-earthquake-atlas/data/earthquakes.csv").trim().split(/\r?\n/);
assert.equal(quake.events.length,quakeRows.length-1);
assert.equal(quake.events.length,23412);
assert.equal(quake.normalizedIsoDates,3);
assert.equal(quake.events.filter(row=>row[5]>=7).length,738);
assert.equal(quake.events.filter(row=>row[5]>=8).length,40);
assert(quake.events.every(row=>row[3]>=-90&&row[3]<=90&&row[4]>=-180&&row[4]<=180&&row[5]>=5.5));
assert.equal(quake.relay["6.0"].records,7354);
assert.equal(quake.relay["6.0"].days,5561);
assert.equal(quake.relay["6.0"].pairs,5560);
assert.equal(quake.relay["6.0"].observedCounts.reduce((a,b)=>a+b,0),5560);
assert.equal(quake.relay["6.0"].observedCounts[0],370);
assert.equal(quake.relay["6.0"].observedCounts[5],645);
for(const threshold of ["6.0","6.5","7.0"]){
 const relay=quake.relay[threshold];
 assert.equal(relay.records-relay.days,relay.sameDayExtra);
 assert.equal(relay.pairs,relay.days-1);
 assert.equal(relay.permutations,200);
}
const equalAreaTiles=Array(72).fill(0);
for(const row of quake.events){
 const latBand=Math.min(5,Math.max(0,Math.floor((Math.sin(row[3]*Math.PI/180)+1)*3)));
 const lonBand=Math.min(11,Math.max(0,Math.floor((row[4]+180)/30)));
 equalAreaTiles[latBand*12+lonBand]++;
}
assert.equal(equalAreaTiles.reduce((a,b)=>a+b,0),23412);
assert.equal(equalAreaTiles.sort((a,b)=>b-a).slice(0,10).reduce((a,b)=>a+b,0),14375);
assert.equal(quake.land.features.length,JSON.parse(read("projects/02-earthquake-atlas/data/ne_110m_land.geojson")).features.length);
for(const asset of ["projects/02-earthquake-atlas/tectonic.js","projects/02-earthquake-atlas/tectonic.css"])assert(read(asset).length>100);
assert(starCSV.split(/\r?\n/).length>=101);
const media=JSON.parse(read("projects/11-stellar-neighborhood/data/works.json"));
assert(media.works.length>=15);
assert.match(media.curated,/^\d{4}-\d{2}-\d{2}$/);
for(const work of media.works){
 assert(Number.isInteger(work.year)&&work.year>1900);
 assert(["book","film","television"].includes(work.medium));
 assert(work.url.startsWith("https://"));
 if(work.publication_url)assert(work.publication_url.startsWith("https://"));
 assert(work.note.length>30);
 for(const system of work.systems)assert(starCSV.includes(system),"Missing catalog system for "+work.title);
}
for(const asset of ["projects/11-stellar-neighborhood/stellar.js","projects/11-stellar-neighborhood/stellar.css","projects/11-stellar-neighborhood/data/stellar-data.js"])assert(read(asset).length>100);
for(const asset of ["assets/lab.js","assets/renderers-a.js","assets/renderers-b.js","assets/renderers-priority.js","assets/ambient.js"])assert(read(asset).length>100);
const wdi=JSON.parse(read("projects/12-madagascar-observatory/data/world-bank-mdg.json"));
assert.equal(wdi.country,"MDG");
assert.match(wdi.retrieved,/^\d{4}-\d{2}-\d{2}$/);
for(const code of ["SP.DYN.LE00.IN","SP.POP.TOTL","AG.LND.FRST.ZS","EG.ELC.ACCS.ZS","NY.GDP.PCAP.CD"]){
 const indicator=wdi.indicators[code];
 assert(indicator.url.startsWith(`https://api.worldbank.org/v2/country/MDG/indicator/${code}?`));
 const points=indicator.points;
 assert(points.length>=20,`Sparse World Bank indicator ${code}`);
 assert(points.every(p=>Number.isInteger(p.year)&&Number.isFinite(p.value)));
 assert(points.every((p,i)=>i===0||points[i-1].year<p.year),`Years not strictly increasing for ${code}`);
}
const stars=starCSV.trim().split(/\r?\n/);
assert(stars[0].includes("ra_2000")&&stars[0].includes("dec_2000")&&stars[0].includes("distance_ly"));
assert(read("assets/renderers-priority.js").includes("R.madagascar"));
console.log("PASS: "+projects.length+" labs, "+media.works.length+" documented media works, five World Bank indicator series.");
