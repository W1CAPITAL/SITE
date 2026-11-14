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


/** Converte números digitados pelo usuário em um JID individual. Não verifica se a conta existe. */
export const phoneToJid = input => {
  if (typeof input !== 'string' || !/^\+?[\d\s().-]+$/.test(input.trim())) return null;
  const digits = input.replace(/\D/g, '');
  if (/^0+$/.test(digits)) return null;
  let e164 = digits;
  // Números brasileiros sem código do país (DDD + número de 8 ou 9 dígitos).
  if (!input.trim().startsWith('+') && /^\d{10,11}$/.test(digits) && !digits.startsWith('55')) {
    e164 = '55' + digits;
  }
  if (!/^[1-9]\d{9,14}$/.test(e164)) return null;
  return e164 + '@s.whatsapp.net';
};
