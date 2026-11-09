import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root='projects/12-madagascar-observatory/data/';
const snapshot=JSON.parse(fs.readFileSync(root+'world-bank-mdg.json','utf8'));
const island=JSON.parse(fs.readFileSync(root+'madagascar.geo.json','utf8'));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(root+'madagascar-data.js','utf8'),context);
assert.deepEqual(JSON.parse(JSON.stringify(context.window.MDG_DATA)),{snapshot,island});

const points=code=>snapshot.indicators[code].points;
const value=(code,year)=>points(code).find(row=>row.year===year)?.value;
assert.equal(Object.values(snapshot.indicators).reduce((n,s)=>n+s.points.length,0),265);
assert.equal(points('EG.ELC.ACCS.ZS')[0].year,1992);
assert.equal(points('AG.LND.FRST.ZS')[0].year,1990);
const without=year=>value('SP.POP.TOTL',year)*(1-value('EG.ELC.ACCS.ZS',year)/100);
assert.equal(value('EG.ELC.ACCS.ZS',1992),9.2);
assert.equal(value('EG.ELC.ACCS.ZS',2024),42.5);
assert(without(2024)>without(1992));
assert(Math.abs((without(2024)-without(1992))/1e6-6.75665974)<.001);
const forestIndex=value('AG.LND.FRST.ZS',2024)/value('AG.LND.FRST.ZS',1990)*100;
const populationIndex=value('SP.POP.TOTL',2024)/value('SP.POP.TOTL',1990)*100;
const proxy=forestIndex/populationIndex*100;
assert(proxy>27&&proxy<28);
assert.equal(island.features[0].id,'MDG');
console.log('PASS: Madagascar browser mirror, 265 observations and two derived comparisons.');
