import { validJid, textMessage, timestamp } from './format.js';

// Pure normalization: reject invalid IDs without losing a whole history chunk.
export function normalizeHistory(items) {
  const rows=[];
  for (const m of Array.isArray(items)?items:[]) {
    const jid=m?.key?.remoteJid, id=m?.key?.id;
    if (!validJid(jid)||typeof id!=='string'||!id||id.length>180) continue;
    rows.push({jid,id,text:textMessage(m),at:timestamp(m.messageTimestamp),from_me:m.key.fromMe?1:0});
  }
  return rows;
}

// One SQL statement per group of messages, rather than thousands of individual
// synchronous writes during WhatsApp history synchronization.
export function persistHistoryBatch(sql, rows, size=25) {
  let inserted=0;
  const limit=Math.max(1,Math.min(25,Math.floor(size)||25));
  for(let offset=0;offset<rows.length;offset+=limit) {
    const batch=rows.slice(offset,offset+limit);
    const vals=batch.flatMap(m=>[m.jid,m.id,m.text,m.at,m.from_me]);
    const placeholders=batch.map(()=>'(?,?,?,?,?)').join(',');
    sql.exec('INSERT OR IGNORE INTO messages(jid,id,text,at,from_me) VALUES '+placeholders,...vals);
    const latest=new Map();
    for(const m of batch) {
      const old=latest.get(m.jid);
      if(!old||m.at>=old.at)latest.set(m.jid,m);
    }
    const recent=[...latest.values()];
    const chatValues=recent.flatMap(m=>[m.jid,m.at,m.text.slice(0,150)]);
    sql.exec('INSERT INTO chats(jid,last_at,preview) VALUES '+recent.map(()=>'(?,?,?)').join(',')+
      ' ON CONFLICT(jid) DO UPDATE SET last_at=MAX(chats.last_at,excluded.last_at),'+
      'preview=CASE WHEN excluded.last_at>=chats.last_at THEN excluded.preview ELSE chats.preview END',
      ...chatValues);
    inserted+=batch.length;
  }
  return inserted;
}
