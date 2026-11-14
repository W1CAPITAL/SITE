import { validJid } from './format.js';

export function historyRequestAnchor(jid,row){
  if(!validJid(jid)||!row||typeof row.id!=='string'||!row.id||row.id.length>180)return null;
  const timestamp=Number(row.at);
  if(!Number.isSafeInteger(timestamp)||timestamp<=0)return null;
  return {key:{remoteJid:jid,id:row.id,fromMe:!!row.from_me},timestamp};
}
