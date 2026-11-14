export function getAdminConfigError(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return 'ADMIN_PASSWORD não configurada. Abra Cloudflare > Workers & Pages > zapfast-cloudflare-web > Settings > Variables and Secrets. Crie a variável como Secret em Production, com 20 caracteres ou mais.';
  }
  if (password.length < 20) {
    return 'A senha ADMIN_PASSWORD é curta demais. Troque-a no painel da Cloudflare por um novo Secret com pelo menos 20 caracteres. Depois salve a configuração em Production.';
  }
  return null;
}
