export const validJid = s => typeof s === 'string' && s.length <= 150 &&
  /^[0-9A-Za-z_.:-]+@(s\.whatsapp\.net|c\.us|lid|g\.us|hosted|hosted\.lid)$/.test(s);

export const textMessage = m => {
  let x = m?.message;
  for (let i = 0; i < 2; i++) x = x?.ephemeralMessage?.message || x?.viewOnceMessage?.message || x;
  const s = x?.conversation || x?.extendedTextMessage?.text ||
    x?.imageMessage?.caption || x?.videoMessage?.caption;
  return typeof s === 'string' && s.trim()
    ? s.slice(0, 4096)
    : 'Mensagem de mídia ou outro conteúdo';
};

export const timestamp = x => {
  const n = Number(x?.toString?.() || x || 0);
  return n > 0 && Number.isFinite(n) ? Math.floor(n) : Math.floor(Date.now() / 1000);
};
