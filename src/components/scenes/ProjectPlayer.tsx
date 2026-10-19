"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { PortfolioProject } from "@/data/projects";

function EnlargedImage({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close(); }, []);
  return <dialog ref={ref} className="project-lightbox" aria-label={"Imagem ampliada de " + title} onCancel={e => { e.preventDefault(); e.stopPropagation(); onClose(); }}>
    <button type="button" onClick={onClose} autoFocus>FECHAR IMAGEM ×</button>
    <div><Image src={src} alt={title} fill sizes="90vw" quality={90} style={{ objectFit: "contain" }} /></div>
  </dialog>;
}

export function ProjectPlayer({ project, index, onEject }: { project: PortfolioProject; index: number; onEject: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), video = useRef<HTMLVideoElement>(null);
  const [media, setMedia] = useState<{ images: boolean[]; video: boolean } | null>(null);
  const [enlarged, setEnlarged] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0), [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = dialog.current; node?.showModal();
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    const controller = new AbortController();
    void fetch(`/api/projects/media?id=${project.id}`, { signal: controller.signal }).then(r => r.json()).then(setMedia).catch(() => { if (!controller.signal.aborted) setMedia({ images: [false, false], video: false }); });
    return () => { controller.abort(); node?.close(); document.body.style.overflow = previous; };
  }, [project.id]);
  useEffect(() => {
    const element = video.current;
    return () => { if (element) { element.pause(); element.removeAttribute("src"); element.load(); } };
  }, [media?.video]);
  const eject = () => { video.current?.pause(); onEject(); };
  const timecode = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  return <dialog ref={dialog} className="project-player" aria-labelledby="project-player-title" data-lenis-prevent onCancel={e => { e.preventDefault(); eject(); }}>
    <header className="project-player-bar"><span>{playing ? "▶ PLAY" : "Ⅱ PAUSE"} / TAPE {String(index + 1).padStart(3, "0")} / {timecode}</span><button type="button" onClick={eject} autoFocus>EJECT ↑</button></header>
    <div className="project-player-content">
      <p className="projects-kicker">{project.subtitle}</p><h2 id="project-player-title">{project.title}</h2><p className="project-description">{project.description}</p>
      <div className="project-video">
        {media?.video ? <video ref={video} src={project.media.video} poster={media.images[0] ? project.media.images[0] : undefined} controls playsInline preload="metadata" onTimeUpdate={e => setSeconds(e.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setMedia(current => current ? { ...current, video: false } : current)} /> : <div className="project-preview"><span aria-hidden="true">▶</span><p>Prévia em preparação</p><small>Vídeo demonstrativo em breve.</small></div>}
      </div>
      <div className="project-gallery">{project.media.images.map((src, i) => <div key={src} className="project-gallery-item">
        {media?.images[i] ? <button type="button" onClick={() => setEnlarged(src)} aria-label={`Ampliar imagem ${i + 1} de ${project.title}`}><Image src={src} alt={`${project.title}, imagem ${i + 1}`} fill sizes="(max-width: 767px) 85vw, 40vw" quality={90} onError={() => setMedia(current => current ? { ...current, images: current.images.map((value, j) => j === i ? false : value) } : current)} /><span>AMPLIAR ↗</span></button> : <div className="project-preview"><p>Imagem {String(i + 1).padStart(2, "0")}</p><small>Prévia em preparação</small></div>}
      </div>)}</div>
      <div className="project-information"><section><h3>Tecnologias</h3><ul className="project-technologies">{project.technologies.map(t => <li key={t}>{t}</li>)}</ul></section><section><h3>Funcionalidades</h3><ul>{project.features.map(t => <li key={t}>{t}</li>)}</ul></section><section><h3>Por dentro do projeto</h3><ul>{project.technicalDetails.map(t => <li key={t}>{t}</li>)}</ul></section></div>
      <div className="project-links"><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">VISITAR SITE ↗</a><a href={project.githubUrl} target="_blank" rel="noopener noreferrer">VER CÓDIGO ↗</a></div>
    </div>
    {enlarged && <EnlargedImage src={enlarged} title={project.title} onClose={() => setEnlarged(null)} />}
  </dialog>;
}
