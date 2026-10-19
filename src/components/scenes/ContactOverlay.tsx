"use client";

import type { CSSProperties } from "react";
import { ViewfinderCorners } from "@/components/ui/ViewfinderCorners";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { navigatePortfolio } from "@/lib/portfolio-navigation";
import { contactChannels, contactDetails } from "@/data/contacts";

function ContactIcon({ type }: { type: typeof contactChannels[number]["id"] }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    {type === "email" && <><rect x="3" y="6" width="26" height="20" rx="2" /><path d="m4 8 12 10L28 8M4 25l8-10m16 10-8-10" /></>}
    {type === "linkedin" && <><rect x="3" y="3" width="26" height="26" rx="3" fill="currentColor" stroke="none" /><path d="M9 14v10m0-15v.2m6 14.8V14m0 4c0-5 8-5 8 0v6" stroke="#77543f" strokeWidth="3.2" strokeLinecap="round" /></>}
    {type === "github" && <><path d="M11 27c-6 2-5-4-8-4m9 6v-5c-7-1-9-5-8-10 0-2 1-3 2-4-1-2-1-4 0-6l6 3a21 21 0 0 1 8 0l6-3c1 2 1 4 0 6 1 1 2 2 2 4 1 5-1 9-8 10v5" strokeLinecap="round" strokeLinejoin="round" /></>}
    {type === "instagram" && <><rect x="3" y="3" width="26" height="26" rx="7" /><circle cx="16" cy="16" r="6" /><circle cx="24" cy="8" r="1.5" fill="currentColor" stroke="none" /></>}
  </svg>;
}
export function ContactOverlay() {
  return <div className="contact-overlay" inert aria-hidden="true">
    <div className="contact-analog" aria-hidden="true"><ViewfinderCorners /></div>
    <div className="contact-content">
      <h2 id="contact-title" className="contact-title">Contato.</h2>
      <p className="contact-subtitle">ME CHAME PELO CANAL QUE PREFERIR.<br />VOU TENTAR RESPONDER O MAIS RÁPIDO POSSÍVEL.</p>
      <ul className="contact-channels" aria-label="Canais de contato">{contactChannels.map(channel => {
        const value = contactDetails[channel.id];
        const print = <><span className="contact-channel-print"><ContactIcon type={channel.id} /></span><span className="contact-channel-caption">{channel.label}</span>{!value && <span className="contact-channel-pending">EM BREVE</span>}</>;
        return <li className="contact-channel-entry" key={channel.id} style={{ "--contact-rotation": `${channel.rotation}deg` } as CSSProperties}>
          {value ? <a className="contact-channel" href={channel.id === "email" ? `mailto:${value}` : value} target={channel.id === "email" ? undefined : "_blank"} rel={channel.id === "email" ? undefined : "noopener noreferrer"} aria-label={channel.id === "email" ? "Enviar e-mail para Joelson" : `Abrir ${channel.name} de Joelson em nova aba`}>{print}</a> : <div className="contact-channel contact-channel-unavailable" aria-label={`${channel.name}: endereço ainda não informado`}>{print}</div>}
        </li>;
      })}</ul>
    </div>
    <aside className="contact-invitation" data-contact-decor><p>Vamos conversar?</p><span>IDEIAS, OPORTUNIDADES<br />OU APENAS UMA BOA<br />CONVERSA. ESTOU SEMPRE<br />ABERTO.</span></aside>
    <p className="contact-stories" data-contact-decor>Histórias<br />também se<br />conectam aqui.</p>
    <p className="contact-farewell" data-contact-decor>Até logo...</p>
    <button type="button" className="contact-return" aria-label="Voltar ao início do portfólio" onClick={() => navigatePortfolio("inicio")}><ScrollIndicator label="TOQUE PARA VOLTAR" /></button>
  </div>;
}
