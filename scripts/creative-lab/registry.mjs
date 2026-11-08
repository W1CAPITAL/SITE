/**
 * Canonical W1 Creative Lab catalog, not a claim that upstream programs are deployed.
 * Source repos are independent software; none are vendored into W1's public site.
 */
export const CREATIVE_TOOLS=Object.freeze([
  {id:"open-higgsfield",name:"Open-Higgsfield",kind:"geração de cenas",state:"integrated-gateway",
   url:"https://github.com/TechBeme/open-higgsfield",license:"MIT",
   requirements:["Instância privada","Cloudflare Access","Provedor e créditos autorizados"],
   usage:"Integração de controle disponível no AI Lab do LexisPredict; só gera se configurada."},
  {id:"genjutsu-sirio",name:"Genjustsu · Sirio",kind:"transferência de movimento",state:"external-private",
   url:"https://github.com/sirioberati/Genjustsu-Open-Source-Workflow",license:"MIT",
   requirements:["Executor privado","Serviços de profundidade e vídeo","Consentimento e revisão visual integral"],
   usage:"Exportar MP4 aprovado; importar manualmente no W1 Reel Studio."},
  {id:"genjutsu-abdullayev",name:"Open Genjutsu · Abdullayev",kind:"transferência de movimento",state:"external-private",
   url:"https://github.com/abdullayevziyodulla/open-genjutsu",license:"MIT",
   requirements:["Executor privado","Provedor/modelo compatível","Revisão integral do clipe"],
   usage:"Exportar MP4 aprovado; importar manualmente no W1 Reel Studio."},
  {id:"genjutsu-anil",name:"Open Genjutsu · Anil",kind:"transferência de movimento",state:"external-private",
   url:"https://github.com/Anil-matcha/open-genjutsu",license:"MIT",
   requirements:["Executor privado","MuAPI ou provedor compatível","Revisão integral do clipe"],
   usage:"Exportar MP4 aprovado; importar manualmente no W1 Reel Studio."},
  {id:"voicestudio",name:"VoiceStudio",kind:"narração em português",state:"external-private",
   url:"https://github.com/debpalash/VoiceStudio",license:"AGPL-3.0 — serviço separado",
   requirements:["Servidor local e modelo de voz autorizado","Escuta humana e revisão"],
   usage:"A API localhost já é suportada pelo editor W1 Reel Studio; não embutir o código AGPL."},
  {id:"hypit",name:"Hypit",kind:"composição e animação de vídeo",state:"installable-private",
   url:"https://github.com/hypit-ai/hypit",
   license:"Apache 2.0 modificado: uso interno permitido; revenda, redistribuição comercial e serviço multiusuário exigem licença comercial",
   requirements:["Node.js >=22.15","pnpm","FFmpeg e recursos de render","Ambiente privado de uma organização"],
   usage:"Instalação opcional por script em worker privado; exportar MP4, sem hospedar Hypit como SaaS W1.",
   sha:"2d31e88765e297f0795348b460c77a6067f12261"},
  {id:"youtube-shorts",name:"AI YouTube Shorts Generator",kind:"recortes verticais e transcrição",state:"installable-private",
   url:"https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator",license:"MIT",
   requirements:["Python >=3.10","venv","MuAPI ou FFmpeg/Whisper e API LLM no modo local","Direitos de uso do vídeo de origem"],
   usage:"Instalação opcional em worker privado; API de terceiros pode cobrar créditos.",
   sha:"13451d439b71643bd3e9df091e0f3ca786610dc9"},
  {id:"motionsmith-mcp",name:"MotionSmith · MCP informado",kind:"conector de automação",state:"unverified",
   url:"https://motionsmith.miftahul.com/api/mcp",license:"Não verificada",
   requirements:["Documentação de ferramentas e autenticação","Verificação de origem e permissões"],
   usage:"URL registrada para avaliação. Não está conectada ao site ou ao AI Lab."},
  {id:"motionsmith-unreal",name:"MotionSmith Pro V2",kind:"animação 3D no Sequencer",state:"manual-external",
   url:"https://github.com/webportalim/MotionSmith-AI-Pro-Text-to-Motion-for-Sequencer",
   license:"Plugin externo distribuído pelo Fab; condições próprias",
   requirements:["Windows 64-bit","Unreal Engine 5.8","Runtime MotionSmith","NVIDIA CUDA GPU","Instalação pelo Fab"],
   usage:"O repositório contém apresentação, não o plugin instalável. Exportar vídeo de Unreal e importar no editor W1."}
]);
export const findCreativeTool=id=>CREATIVE_TOOLS.find(tool=>tool.id===id)||null;
export const installableTools=()=>CREATIVE_TOOLS.filter(tool=>tool.state==="installable-private");
