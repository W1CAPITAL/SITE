import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const source=readFileSync(new URL("./brief.js",import.meta.url),"utf8");

function setup({valid=true,consent="on",clipboard=false}={}){
 const handlers={};
 const buttons={};
 for(const id of ["site-whatsapp","site-email","site-copy"]){
  buttons[id]={addEventListener:(kind,callback)=>{handlers[id+":"+kind]=callback;}};
 }
 const fields={contactName:"Ana Silva",business:"Empresa Ana",sector:"serviços",siteType:"institucional",goal:"Gostaria de receber um orçamento.",consent};
 const form={reportValidity:()=>valid,addEventListener:(kind,callback)=>{handlers["form:"+kind]=callback;}};
 const status={textContent:""};
 const preview={hidden:true,value:"",focus(){this.focused=true;},select(){this.selected=true;}};
 const elements={"site-briefing":form,"site-status":status,"site-prepared":preview,...buttons};
 const opened=[];
 const location={href:"https://example.com/sites/"};
 const context={
  document:{getElementById:id=>elements[id]},
  FormData:class{constructor(formInput){assert.equal(formInput,form);}get(key){return fields[key]??null;}},
  window:{location,open:(...args)=>{opened.push(args);return {};}},
  navigator:clipboard?{clipboard:{writeText:async()=>{}}}:{}
 };
 runInNewContext(source,context);
 return {handlers,status,preview,opened,location,fields};
}

test("pressing Enter in website briefing never submits personal data in a GET query",()=>{
 const app=setup();
 assert.equal(typeof app.handlers["form:submit"],"function");
 let prevented=false;
 app.handlers["form:submit"]({preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
 assert.match(app.location.href,/^mailto:corporacaow1capital@gmail\.com\?/);
 assert.equal(app.opened.length,0);
 assert.equal(app.preview.hidden,false);
 assert.match(app.preview.value,/Ana Silva/);
});

test("email button uses the email app without a popup blocker",()=>{
 const app=setup();
 app.handlers["site-email:click"]();
 assert.equal(app.opened.length,0);
 assert.match(app.location.href,/^mailto:corporacaow1capital@gmail\.com\?/);
 assert.match(app.status.textContent,/e-mail|rascunho/i);
 assert.equal(app.preview.hidden,false);
});

test("copy fallback shows selectable prepared text if clipboard is unavailable",()=>{
 const app=setup();
 app.handlers["site-copy:click"]();
 assert.equal(app.preview.hidden,false);
 assert.equal(app.preview.selected,true);
 assert.match(app.preview.value,/Empresa Ana/);
 assert.match(app.status.textContent,/copie|selecionad/i);
});

test("invalid fields or missing consent must not open contact channels",()=>{
 const invalid=setup({valid:false});
 invalid.handlers["site-email:click"]();
 assert.equal(invalid.opened.length,0);
 assert.equal(invalid.location.href,"https://example.com/sites/");
 const withoutConsent=setup({consent:""});
 withoutConsent.handlers["site-email:click"]();
 assert.equal(withoutConsent.location.href,"https://example.com/sites/");
});
