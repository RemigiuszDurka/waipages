import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const chrome=process.env.CHROME_PATH||[
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome","/usr/bin/chromium","/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].find(candidate=>fs.existsSync(candidate));
if(!chrome)throw Error("Set CHROME_PATH to a Chrome or Edge executable");
const pages=["",...["01-exoplanet-atlas","02-earthquake-atlas","04-human-futures","06-bird-migration","11-stellar-neighborhood","12-madagascar-observatory"].map(slug=>`projects/${slug}/index.html`)];
const sizes=[375,768,1440];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".csv":"text/csv; charset=utf-8",".svg":"image/svg+xml"};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,"http://localhost");
  const target=path.resolve(root,"."+decodeURIComponent(url.pathname),url.pathname.endsWith("/")?"index.html":"");
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.readFile(target,(error,data)=>{
    if(error){res.writeHead(error.code==="ENOENT"?404:500).end();return}
    res.writeHead(200,{"content-type":mime[path.extname(target)]||"application/octet-stream"}).end(data);
  });
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"dashboard-chrome-"));
const browser=spawn(chrome,["--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check","--remote-debugging-port=0",`--user-data-dir=${profile}`,"about:blank"],{stdio:"ignore",windowsHide:true});
let ws;
try{
  const active=path.join(profile,"DevToolsActivePort");
  for(let i=0;i<100&&!fs.existsSync(active);i++)await sleep(100);
  if(!fs.existsSync(active))throw Error("Chrome did not start");
  const [debugPort,debugPath]=fs.readFileSync(active,"utf8").trim().split(/\r?\n/);
  ws=new WebSocket(`ws://127.0.0.1:${debugPort}${debugPath}`);
  await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true})});
  let id=0;
  const pending=new Map();
  const errors=[];
  ws.addEventListener("message",event=>{
    const message=JSON.parse(event.data);
    if(message.id){
      const item=pending.get(message.id);if(!item)return;
      pending.delete(message.id);
      message.error?item.reject(Error(message.error.message)):item.resolve(message.result||{});
    }else if(message.method==="Runtime.exceptionThrown")errors.push(message.params.exceptionDetails.text);
    else if(message.method==="Runtime.consoleAPICalled"&&message.params.type==="error")errors.push(message.params.args.map(x=>x.value||x.description||"error").join(" "));
    else if(message.method==="Log.entryAdded"&&message.params.entry.level==="error")errors.push(message.params.entry.text);
  });
  function send(method,params={},sessionId){
    return new Promise((resolve,reject)=>{
      const n=++id;pending.set(n,{resolve,reject});
      ws.send(JSON.stringify({id:n,method,params,...(sessionId?{sessionId}:{})}));
      setTimeout(()=>{if(pending.delete(n))reject(Error(`CDP timeout: ${method}`))},15000).unref();
    });
  }
  const {targetId}=await send("Target.createTarget",{url:"about:blank"});
  const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
  await send("Page.enable",{},sessionId);
  await send("Runtime.enable",{},sessionId);
  await send("Log.enable",{},sessionId);
  async function evaluate(expression){
    const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true},sessionId);
    if(result.exceptionDetails)throw Error(result.exceptionDetails.text);
    return result.result.value;
  }
  for(const width of sizes){
    await send("Emulation.setDeviceMetricsOverride",{width,height:900,deviceScaleFactor:1,mobile:false},sessionId);
    for(const page of pages){
      errors.length=0;
      await send("Page.navigate",{url:`http://127.0.0.1:${port}/${page}`},sessionId);
      let state;
      for(let i=0;i<100;i++){
        await sleep(150);
        state=await evaluate(`(()=>({
          ready:document.readyState,
          title:document.title,
          width:document.documentElement.clientWidth,
          scrollWidth:document.documentElement.scrollWidth,
          links:[...document.querySelectorAll('main a[href^="projects/"]')].map(a=>a.getAttribute("href")),
          labReady:!document.querySelector("#lab")||(
            !document.querySelector("#lab").classList.contains("hidden")&&
            document.querySelector("#metrics")?.childElementCount>0&&
            !!document.querySelector("#primary.js-plotly-plot")
          ),
          error:document.querySelector("#loading.error")?.textContent||""
        }))()`);
        if(state.ready==="complete"&&state.labReady)break;
      }
      if(state.ready!=="complete")throw Error(`${width}px ${page||"home"}: page did not load`);
      if(state.error)throw Error(`${width}px ${page}: ${state.error}`);
      if(!state.labReady)throw Error(`${width}px ${page}: lab did not initialize`);
      await sleep(250);
      if(state.scrollWidth>state.width+1)throw Error(`${width}px ${page||"home"}: horizontal overflow ${state.scrollWidth} > ${state.width}`);
      if(!page&&state.links.length!==6)throw Error(`${width}px home: expected six direct links, got ${state.links.length}`);
      if(errors.length)throw Error(`${width}px ${page||"home"}: console errors: ${errors.join(" | ")}`);
      console.log(`OK ${width}px ${page||"home"}`);
      if(!page){
        const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true},sessionId);
        fs.writeFileSync(path.join(os.tmpdir(),`dashboard-home-${width}.png`),Buffer.from(shot.data,"base64"));
      }
    }
  }
  console.log("PASS: all six studies and home page at 375, 768 and 1440 px.");
}finally{
  ws?.close();
  browser.kill();
  server.close();
  await sleep(500);
  const profilePath=fs.realpathSync(profile);
  const tempRoot=fs.realpathSync(os.tmpdir());
  if(!profilePath.startsWith(tempRoot+path.sep)||!path.basename(profilePath).startsWith("dashboard-chrome-"))throw Error("Refusing to remove unexpected Chrome profile path");
  try{fs.rmSync(profilePath,{recursive:true,force:true,maxRetries:10,retryDelay:100})}
  catch(error){console.warn("Could not remove temporary Chrome profile:",error.message)}
}
