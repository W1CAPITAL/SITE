import {TABS,createDemoState,updateDemoState,selectProcesses,demoMetrics} from "./interactive-demo-model.mjs";
/* Client-only sandbox: not connected to the real LexisPredict app or database. */
const NAMES={overview:"Visão geral",processes:"Processos",tasks:"Tarefas",calendar:"Agenda",reports:"Relatórios",team:"Equipe",settings:"Configurações"};
const ICONS={overview:"▦",processes:"▤",tasks:"☑",calendar:"▣",reports:"▥",team:"♧",settings:"⚙"};
const escMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
export function escapeHtml(input){return String(input??"").replace(/[&<>"']/g,ch=>escMap[ch]);}
const e=escapeHtml;
const countText=n=>String(n).padStart(2,"0");
const statusClass=s=>s==="Concluído"?"done":s==="Em andamento"?"progress":"pending";
const btn=(label,action,value,active)=>'<button type="button" data-demo-action="'+action+'" data-value="'+e(value)+'" class="demo-chip'+(active?' is-active':'')+'" aria-pressed="'+String(active)+'">'+e(label)+'</button>';
const pct=(n,total)=>total?Math.round(n/total*100):0;
const sectionTitle=(title,description,actions="")=>'<div class="demo-section-heading"><div><h3>'+e(title)+'</h3><p>'+e(description)+'</p></div>'+actions+'</div>';
function overview(state){
 const m=demoMetrics(state);
 const cards=[["Processos",m.processes,"Registros fictícios"],["Em acompanhamento",m.openProcesses,"Carteira demonstrativa"],["Tarefas em aberto",m.pendingTasks,"Pendências da equipe"],["Equipe",m.team,"Núcleos fictícios"]];
 const stats=state.showMetrics?'<div class="demo-stats">'+cards.map(x=>'<article class="demo-stat"><small>'+e(x[0])+'</small><strong>'+x[1]+'</strong><span>'+e(x[2])+'</span></article>').join("")+'</div>':'<p class="demo-empty">Indicadores ocultos nas configurações.</p>';
 const bars=[31,42,38,61,53,71,64,84].map((height,i)=>'<span style="height:'+height+'%" title="Semana '+(i+1)+' · valor ilustrativo"></span>').join("");
 const activity=state.tasks.slice(0,4).map(t=>'<li><span class="demo-status-dot '+(t.completed?'done':'pending')+'"></span><div><strong>'+e(t.title)+'</strong><small>'+e(t.assignee)+(t.completed?' · Concluída':' · Em aberto')+'</small></div></li>').join("");
 return sectionTitle("Seu painel de demonstração","Resumo atualizado conforme você interage com os dados fictícios.")
 +stats+'<div class="demo-overview-grid"><section class="demo-card"><div class="demo-card-title">Atividades da operação <small>Exemplo visual</small></div><div class="demo-bar-chart" aria-label="Gráfico de atividade ilustrativo">'+bars+'</div><div class="demo-chart-labels"><span>SEM 1</span><span>SEM 4</span><span>SEM 8</span></div></section><section class="demo-card"><div class="demo-card-title">Atividades recentes</div><ul class="demo-activity-list">'+activity+'</ul></section></div>';
}
function processRows(state){
 const records=selectProcesses(state,{status:state.statusFilter,query:state.search});
 if(!records.length)return '<div class="demo-empty">Nenhum registro fictício corresponde à pesquisa.</div>';
 return '<div class="demo-table-wrap"><table><thead><tr><th>Referência</th><th>Organização</th><th>Assunto</th><th>Situação</th></tr></thead><tbody>'+records.map(p=>'<tr><td class="demo-mono">'+e(p.id)+'</td><td>'+e(p.client)+'</td><td>'+e(p.subject)+'</td><td><span class="demo-state '+statusClass(p.status)+'">'+e(p.status)+'</span></td></tr>').join("")+'</tbody></table></div>';
}
function processes(state){
 const categories=["Todos","Em andamento","Pendente","Concluído"].map(s=>btn(s,"filterStatus",s,state.statusFilter===s)).join("");
 const matched=selectProcesses(state,{status:state.statusFilter,query:state.search}).length;
 return sectionTitle("Carteira processual","Filtre e cadastre registros de exemplo, sem acessar processos reais.")
 +'<div class="demo-filters" role="group" aria-label="Filtrar processos">'+categories+'</div>'
 +'<label class="demo-search-label" for="demo-search-processes">Buscar processos fictícios</label><input id="demo-search-processes" data-demo-process-search type="search" value="'+e(state.search)+'" maxlength="90" placeholder="Empresa, assunto ou referência">'
 +'<small class="demo-result-count" data-demo-result-count>'+matched+' registro(s) encontrados</small><div data-demo-process-list>'+processRows(state)+'</div>'
 +'<form class="demo-inline-form" data-demo-form="process"><h4>Adicionar processo de exemplo</h4><div class="demo-form-fields"><label>Organização fictícia<input name="client" required maxlength="74" placeholder="Empresa Exemplo F"></label><label>Assunto de teste<input name="subject" required maxlength="74" placeholder="Revisão documental"></label><button type="submit">Adicionar registro</button></div></form>';
}
function taskRows(state){
 const items=state.tasks.filter(t=>state.taskAssignee==="Todas"||t.assignee===state.taskAssignee);
 return items.length?'<div class="demo-task-list">'+items.map(t=>'<article class="demo-task '+(t.completed?'is-complete':'')+'"><button type="button" data-demo-action="toggleTask" data-id="'+e(t.id)+'" aria-label="'+(t.completed?'Reabrir':'Concluir')+' tarefa '+e(t.title)+'" aria-pressed="'+t.completed+'" class="demo-checkbox">'+(t.completed?'✓':'')+'</button><div><strong>'+e(t.title)+'</strong><small>'+e(t.assignee)+' · '+e(t.due)+'</small></div><span class="demo-state '+(t.completed?'done':'pending')+'">'+(t.completed?'Concluída':'Em aberto')+'</span></article>').join("")+'</div>':'<div class="demo-empty">Esta equipe não possui tarefas na demonstração.</div>';
}
function tasks(state){
 const chips=btn("Todas","filterAssignee","Todas",state.taskAssignee==="Todas")+state.team.map(t=>btn(t.name,"filterAssignee",t.name,state.taskAssignee===t.name)).join("");
 const members=state.team.map(t=>'<option value="'+e(t.name)+'">'+e(t.name)+'</option>').join("");
 return sectionTitle("Tarefas e atividades","Marque tarefas como concluídas ou crie novas tarefas fictícias.")
 +'<div class="demo-filters" role="group" aria-label="Responsável pelas tarefas">'+chips+'</div>'+taskRows(state)
 +'<form class="demo-inline-form" data-demo-form="task"><h4>Nova tarefa de teste</h4><div class="demo-form-fields"><label>Descrição<input name="title" required maxlength="74" placeholder="Revisar minuta fictícia"></label><label>Responsável<select name="assignee">'+members+'</select></label><button type="submit">Adicionar tarefa</button></div></form>';
}
const dateLabel=date=>{const [y,m,d]=date.split("-");return d+"/"+m+"/"+y;};
function calendar(state){
 const entries=[...state.events].sort((a,b)=>a.date.localeCompare(b.date));
 return sectionTitle("Agenda","Consulte eventos e adicione compromissos de exemplo.")
 +'<div class="demo-events">'+entries.map(ev=>'<article class="demo-event"><div class="demo-event-date"><strong>'+e(ev.date.slice(8))+'</strong><span>'+e(ev.date.slice(5,7))+'/'+e(ev.date.slice(2,4))+'</span></div><div><strong>'+e(ev.title)+'</strong><small>'+e(dateLabel(ev.date))+' · '+e(ev.time)+' · Compromisso fictício</small></div></article>').join("")+'</div>'
 +'<form class="demo-inline-form" data-demo-form="event"><h4>Agendar evento fictício</h4><div class="demo-form-fields"><label>Compromisso<input name="title" required maxlength="74" placeholder="Reunião de teste"></label><label>Data<input name="date" type="date" min="2026-11-01" max="2030-12-31" required value="2026-11-20"></label><button type="submit">Agendar</button></div></form>';
}
function reports(state){
 const metrics=demoMetrics(state),total=metrics.processes;
 const counts=[["Em andamento",state.processes.filter(x=>x.status==="Em andamento").length],["Pendente",state.processes.filter(x=>x.status==="Pendente").length],["Concluído",state.processes.filter(x=>x.status==="Concluído").length]];
 const summary=state.reportPeriod==="abertos"?counts.filter(x=>x[0]!=="Concluído"):state.reportPeriod==="concluidos"?counts.filter(x=>x[0]==="Concluído"):counts;
 return sectionTitle("Relatórios","Os indicadores abaixo são calculados com os registros da demonstração.")
 +'<div class="demo-filters" role="group" aria-label="Visualização do relatório">'+[["geral","Todos"],["abertos","Não concluídos"],["concluidos","Concluídos"]].map(([v,l])=>btn(l,"reportPeriod",v,state.reportPeriod===v)).join("")+'</div>'
 +'<div class="demo-report-grid"><section class="demo-card"><div class="demo-card-title">Situação da carteira</div>'+summary.map(([label,num])=>'<div class="demo-report-row"><div><strong>'+e(label)+'</strong><span>'+num+' · '+pct(num,total)+'%</span></div><div class="demo-progress" role="img" aria-label="'+e(label)+': '+num+' registros"><span style="width:'+pct(num,total)+'%"></span></div></div>').join("")+'</section><section class="demo-card demo-report-summary"><div class="demo-card-title">Resumo operacional</div><strong>'+metrics.processes+'</strong><p>registros processuais fictícios</p><span>'+metrics.pendingTasks+' tarefa(s) em aberto</span><span>'+metrics.completedTasks+' tarefa(s) concluída(s)</span><button type="button" data-demo-action="exportReport" class="demo-export">Exportar CSV de exemplo ↓</button></section></div>';
}
function team(state){
 return sectionTitle("Equipe","Distribuição demonstrativa de responsabilidades e tarefas.")
 +'<div class="demo-team-grid">'+state.team.map(member=>{
  const total=state.tasks.filter(t=>t.assignee===member.name).length;
  const pending=state.tasks.filter(t=>t.assignee===member.name&&!t.completed).length;
  return '<article class="demo-team-card"><span class="demo-avatar">'+e(member.avatar)+'</span><strong>'+e(member.name)+'</strong><small>'+e(member.role)+'</small><span>'+total+' tarefas · '+pending+' abertas</span><button type="button" data-demo-action="teamTasks" data-value="'+e(member.name)+'">Ver tarefas →</button></article>';
 }).join("")+'</div>';
}
function settings(state){
 return sectionTitle("Configurações","Personalize a apresentação local. Nenhuma preferência é salva.")
 +'<div class="demo-setting"><div><strong>Visualização compacta</strong><small>Reduz espaços entre cartões e linhas.</small></div><button type="button" data-demo-action="compact" data-value="'+String(!state.compact)+'" aria-pressed="'+state.compact+'">'+(state.compact?'Desativar':'Ativar')+'</button></div>'
 +'<div class="demo-setting"><div><strong>Indicadores na visão geral</strong><small>Mostra ou oculta os cartões de resumo.</small></div><button type="button" data-demo-action="metrics" data-value="'+String(!state.showMetrics)+'" aria-pressed="'+state.showMetrics+'">'+(state.showMetrics?'Ocultar':'Mostrar')+'</button></div>'
 +'<div class="demo-setting"><div><strong>Restaurar dados de demonstração</strong><small>Reverte tarefas, processos e agenda aos exemplos iniciais.</small></div><button type="button" data-demo-action="reset" class="demo-reset">Restaurar</button></div>'
 +'<p class="demo-privacy">Este painel é uma simulação local, com dados fictícios. As ações não cadastram processos reais, não alteram o LexisPredict e não enviam informações a servidores.</p>';
}
const VIEWS={overview,processes,tasks,calendar,reports,team,settings};
function nav(state){
 return TABS.map(tab=>'<button class="demo-nav-button'+(state.activeTab===tab?' is-active':'')+'" type="button" data-demo-nav="'+tab+'" '+(state.activeTab===tab?'aria-current="page"':'')+'><span class="demo-nav-icon" aria-hidden="true">'+ICONS[tab]+'</span>'+NAMES[tab]+'</button>').join("");
}
function frame(state){
 return '<div class="lexis-live-demo'+(state.compact?' is-compact':'')+'"><aside class="demo-sidebar"><div class="demo-logo"><b>LP</b><div><strong>LEXISPREDICT</strong><small>DEMONSTRAÇÃO</small></div></div><nav aria-label="Módulos da demonstração">'+nav(state)+'</nav><div class="demo-sidebar-foot">Ambiente fictício<br>Sem acesso a clientes</div></aside><div class="demo-main"><div class="demo-topbar"><span>LexisPredict <b>/ '+NAMES[state.activeTab]+'</b></span><span class="demo-badge">● DADOS FICTÍCIOS</span></div><div class="demo-main-scroll"><div data-demo-panel>'+VIEWS[state.activeTab](state)+'</div><div class="demo-status" role="status" aria-live="polite">'+e(state.notice)+'</div></div></div></div>';
}
function downloadDemoReport(state){
 const m=demoMetrics(state);
 const lines=[["Indicador","Valor"],["Processos de exemplo",m.processes],["Processos em andamento",m.openProcesses],["Tarefas abertas",m.pendingTasks],["Tarefas concluídas",m.completedTasks],["Equipes fictícias",m.team],["Eventos simulados",m.events]];
 const csv="\uFEFF"+lines.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(";")).join("\r\n");
 const a=document.createElement("a");
 a.setAttribute("href","data:text/csv;charset=utf-8,"+encodeURIComponent(csv));
 a.download="lexispredict-relatorio-ficticio.csv";
 document.body.append(a);a.click();a.remove();
}
function mount(gallery){
 const stage=gallery.querySelector(".lp-gallery-stage");
 if(!stage||stage.querySelector(".lexis-live-demo"))return;
 let state=createDemoState();
 const host=document.createElement("div");
 host.className="demo-live-host";
 host.setAttribute("aria-label","Demonstração interativa do LexisPredict com dados fictícios");
 stage.classList.add("has-functional-demo");
 const img=stage.querySelector("[data-preview-main]");
 if(img)img.insertAdjacentElement("afterend",host);else stage.append(host);
 const stageActions=stage.querySelector(".lp-stage-actions span");
 if(stageActions)stageActions.textContent="Demonstração interativa · Dados fictícios";
 const sync=()=>{
  gallery.querySelectorAll("[data-gallery-choice]").forEach((option,i)=>{
   const choice=["overview","processes","tasks"][i];
   const active=state.activeTab===choice;
   option.setAttribute("aria-pressed",String(active));
   option.classList.toggle("is-active",active);
  });
  const title=gallery.querySelector("[data-preview-title]");
  if(title)title.textContent=NAMES[state.activeTab];
 };
 const render=()=>{host.innerHTML=frame(state);sync();};
 function dispatch(action){
  try{state=updateDemoState(state,action);render();}
  catch(error){
   const live=host.querySelector('[role="status"]');
   if(live)live.textContent=error instanceof Error?error.message:"Ação inválida";
  }
 }
 host.addEventListener("click",event=>{
  const b=event.target.closest("button");if(!b||!host.contains(b))return;
  const tab=b.dataset.demoNav;if(tab){dispatch({type:"navigate",tab});return;}
  const action=b.dataset.demoAction;if(!action)return;
  const value=b.dataset.value,id=b.dataset.id;
  if(action==="exportReport"){downloadDemoReport(state);return;}
  if(action==="teamTasks"){
   state={...updateDemoState(state,{type:"navigate",tab:"tasks"}),taskAssignee:value};
   render();return;
  }
  const actions={
   toggleTask:{type:"toggleTask",id},
   filterStatus:{type:"filterStatus",status:value},
   filterAssignee:{type:"filterAssignee",value},
   compact:{type:"compact",value:value==="true"},
   metrics:{type:"metrics",value:value==="true"},
   reportPeriod:{type:"reportPeriod",value},
   reset:{type:"reset"},
  };
  if(actions[action])dispatch(actions[action]);
 });
 host.addEventListener("input",event=>{
  if(!event.target.matches("[data-demo-process-search]"))return;
  state=updateDemoState(state,{type:"search",value:event.target.value});
  const list=host.querySelector("[data-demo-process-list]");
  if(list)list.innerHTML=processRows(state);
  const count=host.querySelector("[data-demo-result-count]");
  if(count)count.textContent=selectProcesses(state,{status:state.statusFilter,query:state.search}).length+" registro(s) encontrados";
 });
 host.addEventListener("submit",event=>{
  const form=event.target.closest("[data-demo-form]");if(!form)return;
  event.preventDefault();
  const data=new FormData(form),kind=form.dataset.demoForm;
  const v=k=>String(data.get(k)||"");
  const action=kind==="task"?{type:"addTask",title:v("title"),assignee:v("assignee")}:kind==="process"?{type:"addProcess",client:v("client"),subject:v("subject")}:{type:"addEvent",title:v("title"),date:v("date")};
  dispatch(action);
 });
 gallery.querySelectorAll("[data-gallery-choice]").forEach((button,i)=>{
  button.addEventListener("click",()=>dispatch({type:"navigate",tab:["overview","processes","tasks"][i]}));
 });
 render();
}
if(typeof document!=="undefined"){
 const start=()=>document.querySelectorAll("[data-lexis-gallery]").forEach(mount);
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
}
