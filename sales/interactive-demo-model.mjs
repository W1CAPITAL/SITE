/* LexisPredict demonstrativo: dados sintéticos e estado apenas na memória do navegador. */
export const TABS=Object.freeze(["overview","processes","tasks","calendar","reports","team","settings"]);

const processSeed=[
 {id:"EX-2026-001",client:"Empresa Exemplo A",subject:"Acompanhamento contratual",status:"Em andamento",owner:"Equipe 01"},
 {id:"EX-2026-002",client:"Empresa Exemplo B",subject:"Revisão documental",status:"Pendente",owner:"Equipe 02"},
 {id:"EX-2026-003",client:"Empresa Exemplo C",subject:"Organização de carteira",status:"Em andamento",owner:"Equipe 01"},
 {id:"EX-2026-004",client:"Empresa Exemplo D",subject:"Consulta demonstrativa",status:"Concluído",owner:"Equipe 03"},
 {id:"EX-2026-005",client:"Empresa Exemplo E",subject:"Registro de acompanhamento",status:"Em andamento",owner:"Equipe 02"},
];
const taskSeed=[
 {id:"T-01",title:"Revisar documentos de exemplo",assignee:"Equipe 01",completed:false,due:"05/11"},
 {id:"T-02",title:"Preparar retorno demonstrativo",assignee:"Equipe 02",completed:false,due:"06/11"},
 {id:"T-03",title:"Atualizar cadastro fictício",assignee:"Equipe 01",completed:true,due:"04/11"},
 {id:"T-04",title:"Organizar agenda interna",assignee:"Equipe 03",completed:false,due:"09/11"},
 {id:"T-05",title:"Conferir relatório de teste",assignee:"Equipe 02",completed:true,due:"03/11"},
];
const eventSeed=[
 {id:"EV-01",title:"Reunião de demonstração",date:"2026-11-06",time:"10:30"},
 {id:"EV-02",title:"Revisão de carteira fictícia",date:"2026-11-10",time:"14:00"},
 {id:"EV-03",title:"Retorno de acompanhamento",date:"2026-11-13",time:"09:00"},
 {id:"EV-04",title:"Apresentação de relatório",date:"2026-11-17",time:"15:30"},
];
const teamSeed=[
 {id:"TEAM-01",name:"Equipe 01",role:"Acompanhamento processual",avatar:"01"},
 {id:"TEAM-02",name:"Equipe 02",role:"Organização e tarefas",avatar:"02"},
 {id:"TEAM-03",name:"Equipe 03",role:"Relatórios e agenda",avatar:"03"},
];
const own=Object.prototype.hasOwnProperty;
function clean(value,label){
 const normalized=String(value??"").trim().replace(/\s+/g," ");
 if(!normalized||normalized.length>74)throw new RangeError(label+" deve conter entre 1 e 74 caracteres");
 return normalized;
}
export function createDemoState(){
 return {
  activeTab:"overview",search:"",statusFilter:"Todos",taskAssignee:"Todas",
  compact:false,showMetrics:true,reportPeriod:"geral",notice:"",
  processes:processSeed.map(x=>({...x})),
  tasks:taskSeed.map(x=>({...x})),
  events:eventSeed.map(x=>({...x})),
  team:teamSeed.map(x=>({...x})),
 };
}
export function demoMetrics(state){
 return {
  processes:state.processes.length,
  openProcesses:state.processes.filter(x=>x.status==="Em andamento").length,
  pendingTasks:state.tasks.filter(x=>!x.completed).length,
  completedTasks:state.tasks.filter(x=>x.completed).length,
  team:state.team.length,
  events:state.events.length,
 };
}
export function selectProcesses(state,{status="Todos",query=""}={}){
 const text=String(query).trim().toLocaleLowerCase("pt-BR");
 return state.processes.filter(p=>(status==="Todos"||p.status===status)&&
  (!text||[p.id,p.client,p.subject,p.owner].some(s=>s.toLocaleLowerCase("pt-BR").includes(text))));
}
export function updateDemoState(state,action){
 if(!action||!own.call(action,"type"))throw new TypeError("Ação inválida");
 switch(action.type){
  case "navigate":
   if(!TABS.includes(action.tab))throw new RangeError("Módulo não encontrado");
   return {...state,activeTab:action.tab,search:"",notice:""};
  case "search":
   return {...state,search:String(action.value??"").slice(0,90)};
  case "filterStatus":
   if(!["Todos","Em andamento","Pendente","Concluído"].includes(action.status))throw new RangeError("Filtro desconhecido");
   return {...state,statusFilter:action.status};
  case "filterAssignee":
   if(action.value!=="Todas"&&!state.team.some(t=>t.name===action.value))throw new RangeError("Equipe desconhecida");
   return {...state,taskAssignee:action.value};
  case "toggleTask":{
   if(!state.tasks.some(t=>t.id===action.id))throw new RangeError("Tarefa inexistente");
   return {...state,tasks:state.tasks.map(t=>t.id===action.id?{...t,completed:!t.completed}:t),notice:"Tarefa atualizada na demonstração."};
  }
  case "addTask":{
   const title=clean(action.title,"Título"),assignee=clean(action.assignee,"Responsável");
   if(!state.team.some(t=>t.name===assignee))throw new RangeError("Responsável desconhecido");
   const id="T-"+String(state.tasks.length+1).padStart(2,"0");
   return {...state,tasks:[...state.tasks,{id,title,assignee,completed:false,due:"A definir"}],notice:"Tarefa de demonstração criada."};
  }
  case "addProcess":{
   const client=clean(action.client,"Cliente fictício"),subject=clean(action.subject,"Assunto");
   const id="EX-2026-"+String(state.processes.length+1).padStart(3,"0");
   return {...state,processes:[...state.processes,{id,client,subject,status:"Pendente",owner:"Equipe 01"}],statusFilter:"Todos",search:"",notice:"Registro fictício criado."};
  }
  case "addEvent":{
   const title=clean(action.title,"Evento");
   const date=String(action.date??"");
   if(!/^20\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(date)||Number.isNaN(new Date(date+"T12:00:00Z").getTime())||new Date(date+"T12:00:00Z").toISOString().slice(0,10)!==date)throw new RangeError("Data inválida");
   const id="EV-"+String(state.events.length+1).padStart(2,"0");
   return {...state,events:[...state.events,{id,title,date,time:"09:00"}],notice:"Evento demonstrativo adicionado."};
  }
  case "compact":return {...state,compact:Boolean(action.value)};
  case "metrics":return {...state,showMetrics:Boolean(action.value)};
  case "reportPeriod":
   if(!["geral","abertos","concluidos"].includes(action.value))throw new RangeError("Período não disponível");
   return {...state,reportPeriod:action.value};
  case "reset":return {...createDemoState(),activeTab:state.activeTab,notice:"Demonstração restaurada."};
  default:throw new RangeError("Ação não reconhecida: "+action.type);
 }
}
