"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { usePreparedResource } from "@/lib/scene-preparation";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ContactOverlay } from "./ContactOverlay";
import { CONTACT } from "./contact-motion";

/** Contact destination and media share the existing timeline; no new pin. */
export function ContactScene({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  const prepared = usePreparedResource("contact-photo");
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false), [videoWanted, setVideoWanted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageReady, setImageReady] = useState(false);
  useEffect(() => {
    const root = sceneRef.current!, video = videoRef.current!;
    const portrait = root.parentElement!.querySelector<HTMLElement>(".portrait-scene")!;
    let desiredTime: number = CONTACT.videoStart, alive = true;
    let previousNear: boolean | undefined, previousVideo: boolean | undefined;
    const seek = () => {
      if (!alive || video.readyState < 1 || video.seeking || reduced) return;
      const target = Math.min(desiredTime, Math.max(0, video.duration - 1 / 24));
      if (Math.abs(video.currentTime - target) > 1 / 48) video.currentTime = target;
    };
    const sync = () => {
      const time = Number(portrait.dataset.aboutTime || 0);
      root.dataset.active = String(time >= CONTACT.enter);
      const overlay = root.querySelector<HTMLElement>(".contact-overlay")!;
      const interactive = time >= 11.34; overlay.inert = !interactive; overlay.setAttribute("aria-hidden", String(!interactive));
      root.dataset.phase = time < CONTACT.play ? "entry" : time < CONTACT.zoom ? "reveal" : time < CONTACT.glitch ? "zoom" : time < CONTACT.clear ? "glitch" : "final";
      const progress = Math.max(0, Math.min(1, (time - CONTACT.play) / CONTACT.reveal));
      desiredTime = CONTACT.videoStart + progress * (CONTACT.videoEnd - CONTACT.videoStart);
      root.dataset.targetTime = desiredTime.toFixed(3);
      const nextNear = time >= CONTACT.prepare;
      const nextVideo = !reduced && time >= CONTACT.prepare && time < CONTACT.clear + .1;
      if (nextNear !== previousNear) { previousNear = nextNear; setNear(nextNear); }
      if (nextVideo !== previousVideo) { previousVideo = nextVideo; setVideoWanted(nextVideo); }
      seek();
    };
    const decoded = () => { video.style.opacity = "1"; seek(); };
    const seeked = () => { root.dataset.videoTime = video.currentTime.toFixed(3); seek(); };
    const error = () => { root.dataset.videoError = "true"; video.style.opacity = "0"; };
    const resize = () => { root.dataset.viewport = `${innerWidth}x${innerHeight}`; };
    video.addEventListener("loadedmetadata", seek); video.addEventListener("loadeddata", decoded); video.addEventListener("seeked", seeked); video.addEventListener("error", error);
    const observer = new MutationObserver(sync); observer.observe(portrait, { attributes: true, attributeFilter: ["data-about-time"] });
    window.addEventListener("resize", resize); resize(); sync();
    if (video.readyState >= 2) decoded();
    return () => { alive = false; observer.disconnect(); window.removeEventListener("resize", resize); video.pause(); video.removeEventListener("loadedmetadata", seek); video.removeEventListener("loadeddata", decoded); video.removeEventListener("seeked", seeked); video.removeEventListener("error", error); };
  }, [sceneRef, reduced]);
  useEffect(() => {
    const video = videoRef.current!;
    if (!videoWanted) { video.pause(); video.removeAttribute("src"); video.load(); video.style.opacity = "0"; }
  }, [videoWanted]);
  return <section id="contatos" ref={sceneRef} className="contact-scene" aria-labelledby="contact-title" data-reduced={reduced} data-ready={String(imageReady)}>
    <div className="contact-flight" aria-hidden="true">
      {near && !reduced && <Image className="contact-poster" src="/images/contacts/hill-poster.webp" alt="" fill unoptimized />}
      <video ref={videoRef} src={videoWanted ? "/videos/contacts/hill-reversed.mp4" : undefined} preload="auto" muted playsInline disablePictureInPicture tabIndex={-1} aria-hidden="true" />
      <div className="contact-zoom-still">{near && !reduced && <Image src="/images/contacts/hill-zoom.webp" alt="" fill unoptimized />}</div>
    </div>
    <div className="contact-final">
      {(near || prepared) && <Image src="/images/contacts/telephone-sunset.png" alt="Cabine telefônica vintage iluminada, junto a um caminho na colina ao pôr do sol" fill unoptimized onLoad={() => setImageReady(true)} />}
    </div>
    <div className="contact-interference" aria-hidden="true"><i /><i /><i /></div>
    <div className="contact-grain" aria-hidden="true" />
    <ContactOverlay />
    <svg className="contact-filters" aria-hidden="true"><defs><filter id="contact-rgb" colorInterpolationFilters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" /><feOffset in="red" dx="4" result="r" /><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" /><feOffset in="cyan" dx="-3" result="c" /><feBlend in="r" in2="c" mode="screen" /></filter></defs></svg>
  </section>;
}

