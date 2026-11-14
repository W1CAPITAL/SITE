// Cloudflare may evict the in-memory socket; restore only after cooldown.
export function shouldRecover({socket,state,now,retryAfter}){
  return !socket && state!=='logged_out' && now>=retryAfter;
}
export function wakeAfter(hasPendingHistory){return hasPendingHistory?1000:60000}
