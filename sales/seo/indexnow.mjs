import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";

export const KEY="04419ef1947dc3671fc73417dced60f5";
export const BASE_URL="https://w1-capital-sales.pages.dev";
const paths=new Map([
 ["index.html","/"],
 ["lexispredict/index.html","/lexispredict/"],
 ["operacao/index.html","/operacao/"],
 ["guia/index.html","/guia/"],
 ["diagnostico/index.html","/diagnostico/"],
 ["parcerias/index.html","/parcerias/"],
 ["explorar/index.html","/explorar/"],
 ["exemplo-relatorio/index.html","/exemplo-relatorio/"]
]);
const root=join(dirname(fileURLToPath(import.meta.url)),"../..");

const isPublic=url=>{
 try{
  const u=new URL(url);
  return u.origin===BASE_URL && [...paths.values()].includes(u.pathname) && !u.search && !u.hash;
 }catch{return false;}
};

export function selectChangedUrls(changed,publicSitemapUrls){
 const allowed=new Set(publicSitemapUrls.filter(isPublic));
 const all=new Set();
 if(changed.includes(KEY+".txt")||changed.includes("sitemap.xml")){
  for(const value of publicSitemapUrls){if(allowed.has(value))all.add(value);}
 }else{
  for(const f of changed){const path=paths.get(String(f).replaceAll("\\","/"));const url=path?BASE_URL+path:null;if(url&&allowed.has(url))all.add(url);}
 }
 return [...all];
}

export function createIndexNowPayload(urlList){
 if(!Array.isArray(urlList)||urlList.length===0||urlList.some(x=>!isPublic(x)))throw new Error("Only known, public same-host pages may be submitted.");
 return {host:new URL(BASE_URL).hostname,key:KEY,keyLocation:BASE_URL+"/"+KEY+".txt",urlList:[...new Set(urlList)]};
}
const parseSitemap=text=>[...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const [cmd,file]=process.argv.slice(2);
 if(cmd!=="--submit"||!file)throw new Error("Usage: node sales/seo/indexnow.mjs --submit <changed-file-path>");
 const changed=readFileSync(file,"utf8").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const urls=selectChangedUrls(changed,parseSitemap(readFileSync(join(root,"sitemap.xml"),"utf8")));
 if(urls.length===0){console.log("No public page changed. No IndexNow notification needed.");process.exit(0);}
 const keyFile=await fetch(BASE_URL+"/"+KEY+".txt",{signal:AbortSignal.timeout(15000)});
 const contents=await keyFile.text();
 if(!keyFile.ok||contents.trim()!==KEY)throw new Error("Public IndexNow ownership key is not live or does not match.");
 const response=await fetch("https://api.indexnow.org/indexnow",{
  method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},
  body:JSON.stringify(createIndexNowPayload(urls)),
  signal:AbortSignal.timeout(20000)
 });
 const responseBody=await response.text();
 if(![200,202].includes(response.status))throw new Error("IndexNow rejected URL notification with HTTP "+response.status+": "+responseBody.slice(0,450));
 console.log("IndexNow accepted notification for "+urls.length+" changed W1 public URL(s), HTTP "+response.status+". This does not guarantee indexing.");
}
