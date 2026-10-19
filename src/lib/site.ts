/** Public identity; only configure the real production origin when deploying. */
export const site = {
  name: "Joelson Vicente | Desenvolvedor",
  tagline: "Desenvolvedor, criativo e aprendiz em constante evolução.",
  description: "Portfólio de Joelson Vicente, desenvolvedor com projetos em JavaScript, TypeScript, React e Node.js. Conheça minha trajetória e entre em contato.",
} as const;
export type Site = typeof site;
export function getSiteUrl(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return undefined;
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("NEXT_PUBLIC_SITE_URL deve ser uma origem HTTP(S) válida, sem caminho, credenciais ou parâmetros.");
  return url;
}
export const siteUrl = getSiteUrl();
export const siteIndexable = !!siteUrl && process.env.VERCEL_ENV !== "preview";
