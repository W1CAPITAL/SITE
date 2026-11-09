#!/usr/bin/env node
// Export 15-second hook for external Virality Predictor. Never uploads or charges.
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function chooseHookDuration(duration, cap=15) {
  if (!Number.isFinite(duration) || duration<=0) throw new Error('Vídeo inválido: duração indisponível.');
  if (!Number.isFinite(cap) || cap<=0 || cap>15) throw new Error('Limite máximo do Predictor: 15 segundos.');
  return Math.min(duration,cap);
}
export function formatPredictorCommand(hookFile) {
  if (!hookFile || hookFile.startsWith('-')) throw new Error('Arquivo inválido');
  return 'higgsfield generate create brain_activity --video '+JSON.stringify(resolve(hookFile))+' --wait';
}
function main(args) {
  if (args.length<2 || args.includes('--help')) {
    console.log('Uso: node virality-hook.mjs <entrada.mp4> <trecho-15s.mp4>');
    return args.includes('--help')?0:1;
  }
  const [input,output]=args.map(item=>resolve(item));
  if (!existsSync(input)) throw new Error('Arquivo não encontrado: '+input);
  if (input===output) throw new Error('A saída não pode sobrescrever o original.');
  const duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',input],{encoding:'utf8'}).trim());
  const take=chooseHookDuration(duration);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-i',input,'-t',String(take),'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','veryfast','-crf','22','-c:a','aac','-b:a','160k','-movflags','+faststart',output],{stdio:'inherit'});
  console.log('Trecho local preparado: '+output+' ('+take.toFixed(2)+' segundos)');
  console.log('Envio e pontuação NÃO executados. Após autorizar acesso/uso da Higgsfield:');
  console.log(formatPredictorCommand(output));
  return 0;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{process.exitCode=main(process.argv.slice(2))}
  catch(e){console.error(e.message);process.exitCode=1}
}
