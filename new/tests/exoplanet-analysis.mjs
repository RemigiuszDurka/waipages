import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../projects/01-exoplanet-atlas/data/exoplanets-data.js',import.meta.url),'utf8');
const sandbox={window:{}};
runInNewContext(source,sandbox);
const {columns,rows}=sandbox.window.EXOPLANET_ARCHIVE;
assert.equal(rows.length,5250);
assert.deepEqual(Array.from(columns),['name','year','type','method','radius_earth','mass_earth','source_radius','source_radius_unit']);
assert.equal(rows.filter(row=>row[1]===2016).length,1517);
assert.equal(rows.filter(row=>row[3]==='Transit').length,3945);
const paired=rows.filter(row=>row[4]>0&&row[5]>0);
assert.equal(paired.length,5215);
const counts=new Map();
for(const row of paired){const key=`${row[4]}|${row[5]}`;counts.set(key,(counts.get(key)||0)+1)}
assert.equal([...counts.values()].filter(n=>n>1).reduce((sum,n)=>sum+n,0),2889);
assert.equal(rows.find(row=>row[0]==='51 Pegasi b')?.[1],1995);
console.log('PASS: 5,250 source-derived exoplanets, 5,215 plotted pairs and documented analysis counts.');
