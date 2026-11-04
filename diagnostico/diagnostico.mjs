/* W1 Capital: self-assessment uses synthetic labels only; never collects responses. */
export const QUESTIONS=Object.freeze([
 {id:"carteira",title:"Centralização da carteira",prompt:"A equipe encontra as referências e o último acompanhamento de cada processo em um lugar definido?",action:"Centralize as referências e documente o último acompanhamento em um fluxo de acesso controlado."},
 {id:"responsaveis",title:"Responsáveis e tarefas",prompt:"Cada acompanhamento importante tem um responsável e uma próxima ação identificados?",action:"Defina responsáveis e uma próxima ação verificável para cada atividade."},
 {id:"prazos",title:"Prazos e compromissos",prompt:"Os prazos são conferidos nas fontes oficiais e separados de tarefas e lembretes internos?",action:"Separe prazos processuais, agenda e tarefas; mantenha a conferência nas fontes oficiais."},
 {id:"retornos",title:"Atendimento ao cliente",prompt:"A equipe consegue localizar quando houve o último contato e quando será o próximo retorno?",action:"Padronize o registro de atendimento e a data do próximo retorno."},
 {id:"indicadores",title:"Relatórios e indicadores",prompt:"Existe um resumo periódico de tarefas pendentes, atividades concluídas e andamento da carteira?",action:"Crie um resumo semanal simples, com indicadores que possam ser conferidos."},
 {id:"acessos",title:"Permissões e documentos",prompt:"O acesso a documentos e informações é limitado por função e revisado periodicamente?",action:"Revise permissões e compartilhamentos antes de centralizar informações confidenciais em qualquer ferramenta."}
]);
export function levelForScore(score){
 if(!Number.isInteger(score)||score<0||score>12)throw new RangeError("Pontuação inválida");
 return score<=4?"inicial":score<=8?"em_evolucao":"estruturada";
}
export function evaluateAnswers(answers){
 if(!Array.isArray(answers)||answers.length!==QUESTIONS.length||answers.some(v=>!Number.isInteger(v)||v<0||v>2))throw new RangeError("Responda a todas as perguntas.");
 const score=answers.reduce((a,b)=>a+b,0);
 const priorities=QUESTIONS.map((q,i)=>({...q,value:answers[i]})).sort((a,b)=>a.value-b.value).slice(0,2);
 return {score,maxScore:12,level:levelForScore(score),priorities};
}
export function buildContactLink(source){
 const allowed={linkedin:"LinkedIn",instagram:"Instagram",indicacao:"indicação",site:"site da W1 Capital"};
 const from=Object.prototype.hasOwnProperty.call(allowed,String(source||"").toLowerCase())?allowed[String(source).toLowerCase()]:"site da W1 Capital";
 const msg="Olá, W1 Capital! Conheci o diagnóstico gratuito pelo "+from+" e gostaria de conversar sobre uma demonstração do LexisPredict para meu escritório.";
 return "https://wa.me/5513991199349?text="+encodeURIComponent(msg);
}
const labels={
 inicial:{title:"Organização que pode ganhar estrutura",description:"Há oportunidades para criar uma base de acompanhamento mais previsível. Começar com registros e responsáveis claros costuma ser um passo útil."},
 em_evolucao:{title:"Rotina em evolução",description:"Sua operação indica algumas práticas estabelecidas. Vale consolidar as mais inconsistentes antes de adicionar complexidade."},
 estruturada:{title:"Rotina com práticas estruturadas",description:"Pelas respostas informadas, a equipe já aplica várias práticas organizacionais. A revisão de acessos e a consistência dos indicadores seguem importantes."}
};
if(typeof document!=="undefined"){
 const form=document.querySelector("#diagnostico-form");
 const result=document.querySelector("#resultado");
 if(form&&result){
  form.addEventListener("submit",event=>{
   event.preventDefault();
   if(!form.checkValidity()){form.reportValidity();return;}
   const answers=QUESTIONS.map(q=>{
    const selected=form.querySelector('input[name="q_'+q.id+'"]:checked');
    return selected?Number(selected.value):null;
   });
   let assessment;
   try{assessment=evaluateAnswers(answers);}catch{return;}
   const level=labels[assessment.level];
   const title=result.querySelector("[data-result-title]"),intro=result.querySelector("[data-result-intro]"),score=result.querySelector("[data-score]"),list=result.querySelector("[data-priorities]");
   title.textContent=level.title;
   intro.textContent=level.description;
   score.textContent=assessment.score+" de "+assessment.maxScore+" pontos";
   list.replaceChildren();
   assessment.priorities.forEach(q=>{
    const li=document.createElement("li");
    const strong=document.createElement("strong");strong.textContent=q.title;
    const p=document.createElement("p");p.textContent=q.action;
    li.append(strong,p);list.append(li);
   });
   result.hidden=false;result.scrollIntoView({behavior:"smooth",block:"start"});
  });
  form.querySelector("[data-reset]")?.addEventListener("click",()=>{
   form.reset();result.hidden=true;form.scrollIntoView({behavior:"smooth",block:"start"});
  });
  const src=new URLSearchParams(window.location.search).get("utm_source");
  result.querySelector("[data-contact]")?.setAttribute("href",buildContactLink(src));
 }
}
