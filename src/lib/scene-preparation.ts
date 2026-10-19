"use client";
import { useSyncExternalStore } from "react";
import { getImageProps } from "next/image";
import { getReducedMotionPreference } from "@/hooks/use-prefers-reduced-motion";
import { introSequence, introFrameUrl } from "@/lib/intro-sequence";
import { imageAssets } from "@/lib/image-assets";

type Job = { key: string; priority: number; run: () => Promise<unknown>; status: "queued" | "running" | "ready" | "failed" };
const jobs = new Map<string, Job>(), listeners = new Set<() => void>();
let running = 0, started = false;
let observer: MutationObserver | undefined;
let controller = new AbortController();
function emit() { listeners.forEach(listener => listener()); }
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function usePreparedResource(key: string) {
  return useSyncExternalStore(subscribe, () => jobs.get(key)?.status === "ready", () => false);
}
export function preparationReport() { return [...jobs.values()].map(({key, status, priority}) => ({key, status, priority})); }
export function constrainedConnection() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "");
}
function limit() { return innerWidth < 768 || constrainedConnection() ? 1 : 2; }
function pump() {
  if (!started || document.hidden) return;
  while (running < limit()) {
    const next = [...jobs.values()].filter(job => job.status === "queued" && job.priority < 100 && (!job.key.endsWith("-module") || job.priority < 0 || Number(document.querySelector<HTMLElement>(".portrait-scene")?.dataset.aboutTime || 0) > 1.05)).sort((a,b) => a.priority-b.priority)[0];
    if (!next) return;
    running++; next.status = "running"; emit();
    void next.run().then(() => { next.status = "ready"; }, () => { next.status = "failed"; }).finally(() => { running--; emit(); setTimeout(pump, 40); });
  }
}
function enqueue(key: string, priority: number, run: Job["run"]) {
  const existing = jobs.get(key);
  if (existing) existing.priority = Math.min(priority, existing.priority);
  else jobs.set(key, { key, priority, run, status: "queued" });
}
async function cacheFile(url: string) {
  const response = await fetch(url, { cache: "force-cache", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
  if (!response.ok) throw new Error(url);
  await response.arrayBuffer(); // Bytes enter HTTP cache; no retained buffers/textures.
}
export function prepareImage(src: string, sizes: string, width = 420, height = 360) {
  const asset = imageAssets[src];
  const props = getImageProps({ src: asset?.src ?? src, width: asset?.width ?? width, height: asset?.height ?? height, alt: "", sizes, quality: 90 }).props;
  return new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    const timer = setTimeout(() => { image.src = ""; reject(new Error("Image timeout")); }, 15000);
    image.onload = () => { void image.decode().then(() => { clearTimeout(timer); resolve(); }, () => { clearTimeout(timer); reject(new Error("Image decode failed")); }); };
    image.onerror = () => { clearTimeout(timer); reject(new Error("Image unavailable")); };
    image.sizes = sizes; if (props.srcSet) image.srcset = props.srcSet; image.src = props.src;
  });
}
export function startScenePreparation() {
  if (started) return;
  started = true; controller = new AbortController();
  for (const job of jobs.values()) if (job.status === "failed") job.status = "queued";
  enqueue("/images/joelson-portrait.png", 1, () => prepareImage("/images/joelson-portrait.png", "(max-width: 767px) 95vw, 48vw"));
  const photos = ["curiosity","science","creativity","education","development","experiments","growth","collaboration","future"];
  photos.forEach((name, index) => {
    const src = "/images/about-polaroids/" + name + ".jpg", asset = imageAssets[src];
    const ratio = asset ? (asset.width / asset.height) / .75 : 1;
    enqueue(src, 2 + index / 3, () => prepareImage(src, "(max-width: 767px) " + 30*ratio + "vw, (max-height: 650px) " + 78*ratio + "px, " + 112*ratio + "px"));
  });
  enqueue("projects-room", 2, () => cacheFile("/images/projects/liminal-vhs.webp"));
  enqueue("character-fallback", 3, () => prepareImage("/images/experiences/crt-character.webp", "(max-width:767px) 100vw, 55vw"));
  enqueue("contact-photo", 4, () => cacheFile("/images/contacts/telephone-sunset.png"));
  enqueue("contact-poster", 4, () => cacheFile("/images/contacts/hill-poster.webp"));
  enqueue("contact-zoom", 4, () => cacheFile("/images/contacts/hill-zoom.webp"));
  // Sparse coverage first makes large forward/reverse jumps useful before every frame arrives.
  const variant = innerWidth < 768 ? "mobile" : "desktop";
  const frame = (i: number) => introFrameUrl(i, variant);
  const frameCount = introSequence[variant].frameCount;
  const deferredPriority = constrainedConnection() ? 100 : 0;
  if (!constrainedConnection() && !getReducedMotionPreference()) {
    for (let i=0;i<frameCount;i++) enqueue("frame:"+variant+":"+i, i%12===0 || i===frameCount-1 ? 5 : 12, () => cacheFile(frame(i)));
  }
    enqueue("vhs-module", 6 + deferredPriority, () => import("@/components/scenes/VhsScene"));
    enqueue("vhs-model", 7 + deferredPriority, () => cacheFile("/models/vhs-cassette.glb"));
    enqueue("character-module", 8 + deferredPriority, () => import("@/components/scenes/CrtCharacter"));
    enqueue("character-model", 9 + deferredPriority, () => cacheFile("/models/crt-character-parts.glb"));
    enqueue("contact-video", getReducedMotionPreference() ? 110 : 10 + deferredPriority, () => cacheFile("/videos/contacts/hill-reversed.mp4"));
  document.addEventListener("visibilitychange", pump);
  const portrait = document.querySelector(".portrait-scene");
  const promoted = new Set<string>();
  let heroExited = false;
  const observe = () => {
    const time = Number((portrait as HTMLElement | null)?.dataset.aboutTime || 0);
    if (time > 1.05 && !heroExited) { heroExited = true; pump(); }
    for (const [id, threshold] of [["projetos", 2.5], ["experiencias", 5.5], ["contatos", 7.2]] as const) {
      if (time >= threshold && !promoted.has(id)) { promoted.add(id); prioritizeScene(id); }
    }
  };
  if (portrait) { observer = new MutationObserver(observe); observer.observe(portrait, { attributes:true, attributeFilter:["data-about-time"] }); }
  observe();
  pump();
}
export function prioritizeScene(id: string) {
  // Navigation overtakes background frame warming; it never blocks the scroll.
  for (const job of jobs.values()) {
    if (job.key === "contact-video" && getReducedMotionPreference()) continue;
    if ((id === "contatos" && job.key.startsWith("contact-")) ||
        (id === "experiencias" && job.key.startsWith("character-")) ||
        (id === "projetos" && /^(vhs-|projects-)/.test(job.key))) job.priority = -1;
  }
  pump();
}


export function stopScenePreparation() { started = false; controller.abort(); observer?.disconnect(); document.removeEventListener("visibilitychange", pump); }
