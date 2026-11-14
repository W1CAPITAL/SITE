// A free Durable Object's daily SQLite write allowance resets at 00:00 UTC.
// Keep the WhatsApp session and historical data intact; do not retry writes in a tight loop.
export function isDurableWriteQuotaError(error) {
 const message=String(error?.message??error??'');
 return /Exceeded allowed rows written in Durable Objects free tier/i.test(message)
   || /Durable Objects.*rows written.*free tier/i.test(message);
}
export function quotaRetrySeconds(now=Date.now()) {
 const day=86400000,reset=(Math.floor(now/day)+1)*day;
 return Math.max(1,Math.ceil((reset-now)/1000));
}
export function quotaResponse(path,now=Date.now()) {
 const seconds=quotaRetrySeconds(now);
 const resetAt=new Date(now+seconds*1000).toISOString();
 const status=path==='/api/status'?200:429;
 const error='Limite diário gratuito de gravações da Cloudflare atingido. Sua sessão não foi apagada. O limite se renova às 00:00 UTC. Não tente reconectar repetidamente.';
 return Response.json({state:'quota_exceeded',error,resetAt,retryAfterSeconds:seconds}, {
   status,headers:{'Retry-After':String(seconds),'Cache-Control':'no-store'}
 });
}
