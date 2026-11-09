import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'assets','projects.js'),'utf8').replace(/^window.PROJECTS\s*=\s*/,'').replace(/;\s*$/,''));
const expected=[1,2,4,6,11,12];
if(JSON.stringify(d.map(p=>p.id))!==JSON.stringify(expected))throw Error('Expected projects '+expected.join(', '));
for(const slug of ['03-climate-signals','05-energy-transition','07-air-traffic-network','08-seattle-weather','09-penguin-biology','10-market-time-machine'])if(fs.existsSync(path.join(root,'projects',slug)))throw Error('Removed project still present: '+slug);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const p of d){
 const dir=path.join(root,'projects',p.slug);
 for(const fn of ['index.html','README.md',...p.data])if(!fs.existsSync(path.join(dir,fn)))throw Error('Missing '+p.slug+'/'+fn);
 if(!home.includes('href="projects/'+p.slug+'/index.html"'))throw Error('Missing direct home page link to '+p.slug);
}
console.log('OK — 6 projects, direct home page links, HTML and source data files present.');
