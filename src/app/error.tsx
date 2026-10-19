"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { error: Error & { digest?:string }; retry: () => void }) { return <main className="site-message"><p>VHS / TRANSMISSÃO INTERROMPIDA</p><h1>Vamos tentar de novo?</h1><p>Não foi possível concluir esta transmissão. Você pode tentar novamente ou voltar ao início.</p><button type="button" onClick={retry}>Tentar novamente ↻</button><Link href="/">Voltar ao início</Link></main>; }
