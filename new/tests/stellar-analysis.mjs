import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root=path.resolve(import.meta.dirname,"..");
const dir=path.join(root,"projects","11-stellar-neighborhood");
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(dir,"data","stellar-data.js"),"utf8"),context);
const {catalog,media}=context.window.STELLAR_SOURCE;
assert.equal(catalog.length,143);
const ra=s=>{const [h,m,t]=s.split(/\s+/).map(Number);return 15*(h+m/60+t/3600)*Math.PI/180};
const dec=s=>{const sign=s.startsWith("-")?-1:1;const [d,m,t]=s.replace(/^[+-]/,"").split(/\s+/).map(Number);return sign*(d+m/60+t/3600)*Math.PI/180};
const mapped=catalog.map((v,index)=>({...v,index,r:Number(v.distance_ly)}))
 .filter(v=>v.r>0)
 .filter(v=>Number.isFinite(ra(v.ra_2000))&&Number.isFinite(dec(v.dec_2000)))
 .sort((a,b)=>a.r-b.r||a.index-b.index);
assert.equal(mapped.length,142);
assert.equal(new Set(mapped.map(v=>v.cns_name)).size,103);
assert.equal(mapped.filter(v=>["L","T","Y"].includes(v.spectral_type[0])).length,9);
assert.equal(mapped.filter(v=>!["L","T","Y"].includes(v.spectral_type[0])).length,133);
assert.equal(mapped.filter(v=>v.spectral_type.startsWith("M")).length,98);
assert.equal(mapped.at(-1).r,21.38);
for(const v of mapped){
 const a=ra(v.ra_2000),d=dec(v.dec_2000);
 const x=v.r*Math.cos(d)*Math.cos(a),y=v.r*Math.cos(d)*Math.sin(a),z=v.r*Math.sin(d);
 assert(Math.abs(Math.hypot(x,y,z)-v.r)<1e-10,"Coordinate transform changes radius for "+v.cns_name);
}
assert.equal(media.works.length,15);
assert.deepEqual([...new Set(media.works.map(w=>w.medium))].sort(),["book","film","television"]);
assert.equal(media.works.reduce((n,w)=>n+w.systems.length,0),17);
const linked=new Set(media.works.flatMap(w=>w.systems));
assert.equal(linked.size,9);
const ids=new Set(mapped.map(v=>v.cns_name));
for(const id of linked)assert(ids.has(id),"Media-linked catalog ID absent: "+id);
for(const work of media.works)assert(work.url.startsWith("https://")&&work.note.length>30);
const proxima=mapped.find(v=>v.cns_name==="GJ 551").r;
const voyagerYears=proxima*299792.458/17;
assert(voyagerYears>70000&&voyagerYears<80000,"Voyager 1 comparison should be about 75,000 years to Proxima");
console.log("PASS: 143 catalog rows, 142 mapped objects, 15 documented works and light/Voyager comparison.");
