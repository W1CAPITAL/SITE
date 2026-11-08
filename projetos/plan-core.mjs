/** W1 AI Lab: planejamento editorial offline. Não gera vídeo nem promete viralização. */
export const PROVIDERS=Object.freeze([
{id:'higgsfield',name:'Open-Higgsfield',usage:'existing-adapter',purpose:'B-roll com instância privada autorizada'},
{id:'genjutsu',name:'Genjutsu',usage:'existing-adapter',purpose:'Movimento a partir de mídia autorizada'},
{id:'reel-studio',name:'W1 Reel Studio',usage:'existing-editor',purpose:'Montagem MP4, voz, música e efeitos'},
{id:'hypit',name:'Hypit',usage:'internal-only',purpose:'Composições editáveis de vídeo para uso interno'},
{id:'shorts',name:'AI YouTube Shorts Generator',usage:'external-cli',purpose:'Recortes de vídeos longos próprios/licenciados'},
{id:'motionsmith-unreal',name:'MotionSmith Pro V2',usage:'external-unreal',purpose:'Plugin para Unreal Engine e GPU NVIDIA'},
{id:'motionsmith-mcp',name:'MotionSmith MCP',usage:'unverified',purpose:'Endpoint remoto não verificado; nenhuma conexão ativa'}
]);
const NAMES={w1:'W1 Capital',lexis:'LexisPredict'};
const CHECKLIST=[
'Apresentar telas e projetos reais, sem inventar resultados nem depoimentos.',
'Conferir escrita, legibilidade no celular e sincronismo das legendas.',
'Usar música licenciada ou do catálogo do Instagram na publicação; não garantir viralização.',
'Ouvir a narração inteira e revisar volume, efeitos e naturalidade da voz.',
'Conferir direitos de imagens, vídeos, rostos e sons.'
];
export function buildPlan(input){
 if(!input||!Object.hasOwn(NAMES,input.brand)||!['reel','carrossel'].includes(input.format)||
 typeof input.topic!=='string'||input.topic.trim().length<3||input.topic.trim().length>180)
  throw Error('Selecione marca, formato e tema válido (3 a 180 caracteres).');
 const topic=input.topic.trim(),brand=NAMES[input.brand];
 const product=input.brand==='lexis'?'a plataforma jurídica real':'um projeto real da W1';
 const cta=input.brand==='lexis'?'Solicite uma demonstração do LexisPredict.':'Conheça nossos projetos e peça um orçamento.';
 const scenes=input.format==='reel'?[
  {role:'Gancho · 0–2s',headline:'Você ainda perde tempo com '+topic+'?',visual:'Abertura dinâmica com tipografia grande e movimento real.'},
  {role:'Problema · 2–6s',headline:'O obstáculo que ninguém mostra',visual:'Cena curta com imagem ou captura própria contextualizando o problema.'},
  {role:'Demonstração real · 6–13s',headline:'Veja como funciona',visual:'Gravação de tela de '+product+', sem fingir funcionalidades.'},
  {role:'Resultado observado · 13–18s',headline:'Benefício sem exageros',visual:'Comparação visual clara; não usar estatísticas sem comprovação.'},
  {role:'Convite · 18–22s',headline:cta,visual:'Tela final breve com marca, URL verdadeira e uma ação.'}
 ]:[
  {role:'Capa · 1/6',headline:'O que ninguém te mostra sobre '+topic,visual:'Interface real ou foto própria em destaque, título grande e legível.'},
  {role:'Problema · 2/6',headline:'O erro mais comum',visual:'Print ou imagem concreta mostrando o obstáculo, não um bloco de texto.'},
  {role:'Diagnóstico · 3/6',headline:'Por que isso acontece?',visual:'Detalhe visual, setas e uma frase curta.'},
  {role:'Exemplo · 4/6',headline:'Na prática, fica assim',visual:'Tela real de '+product+' com dados protegidos.'},
  {role:'Método · 5/6',headline:'O que fazer agora',visual:'Passos numerados com imagens e ícones de apoio.'},
  {role:'Convite · 6/6',headline:cta,visual:'Capa final com CTA e identidade vinho/prata.'}
 ];
 return {brand,format:input.format,topic,scenes,checklist:[...CHECKLIST],notice:'Roteiro-base editável; não é MP4 nem carrossel pronto.'};
}
