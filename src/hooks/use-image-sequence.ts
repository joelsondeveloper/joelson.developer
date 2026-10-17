"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsap } from "./use-gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export const INTRO_FRAME_COUNT = 192;
const CACHE_LIMIT = 24;
const DECODED_BUDGET = 48 * 1024 * 1024;
const COMPRESSED_LIMIT = 48;

/** Scroll-controlled canvas with compressed prefetch and a bounded decoded cache. */
export function useImageSequence(
  scrollDistanceVh = 4,
  configureTimeline?: (timeline: gsap.core.Timeline) => void,
  onProgress?: (progress: number) => void,
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestedFrame = useRef(0);
  const previousPaint = useRef<HTMLCanvasElement | null>(null);
  const [variant, setVariant] = useState<"desktop" | "mobile">(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");
  const requestDraw = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const updateVariant = () => setVariant(query.matches ? "mobile" : "desktop");
    query.addEventListener("change", updateVariant);
    return () => query.removeEventListener("change", updateVariant);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !container || !context) return;

    const abort = new AbortController();
    const frameBytes = (variant === "mobile" ? 768 * 432 : 1280 * 720) * 4;
    const cacheLimit = Math.min(CACHE_LIMIT, Math.floor(DECODED_BUDGET / frameBytes));
    const warmRadius = Math.min(10, Math.floor((cacheLimit - 2) / 2));
    let direction = 1, previousRequest = 0, prefetching = false;
    const blobs = new Map<number, Promise<Blob>>();
    const decoded = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    const failed = new Set<number>();
    let active = true, sleeping = false;
    let jobs = 0;
    let animationFrame = 0;
    let lastDrawn = -1;
    let revealed = false;

    async function fetchFrame(index: number): Promise<Blob> {
      const existing = blobs.get(index);
      if (existing) return existing;
      const pending = (async () => {
        const url = `/images/tv-zoom/${variant}/frame-${String(index + 1).padStart(4, "0")}.webp`;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await fetch(url, { signal: abort.signal, cache: "force-cache" });
            if (!response.ok) throw new Error(`Frame HTTP ${response.status}`);
            return await response.blob();
          } catch (error) {
            if (!active || attempt === 1) throw error;
          }
        }
        throw new Error("Frame unavailable");
      })();
      blobs.set(index, pending);
      return pending;
    }

    function draw() {
      animationFrame = 0;
      if (!active || decoded.size === 0) return;
      const target = requestedFrame.current;
      // Keep a painted frame while a fast jump is still decoding its target.
      let index = target;
      if (!decoded.has(index)) {
        index = [...decoded.keys()].reduce((nearest, candidate) =>
          Math.abs(candidate - target) < Math.abs(nearest - target) ? candidate : nearest,
        );
      }
      const image = decoded.get(index);
      if (!image || index === lastDrawn) return;
      const scale = Math.max(canvas!.width / image.width, canvas!.height / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context!.drawImage(image, (canvas!.width - width) / 2, (canvas!.height - height) / 2, width, height);
      lastDrawn = index;
      previousPaint.current = null;
      canvas!.style.visibility = "visible";
      canvas!.dataset.frame = String(index);
      if (!revealed) {
        revealed = true;
        setIsReady(true);
      }
    }

    function scheduleDraw() {
      if (active && !animationFrame) animationFrame = requestAnimationFrame(draw);
    }

    function evict() {
      // Keep frame zero available for an immediate return to the beginning.
      while (decoded.size > cacheLimit) {
        const candidates = [...decoded.keys()].filter(index => index !== 0 && index !== requestedFrame.current);
        const farthest = candidates.reduce((a, b) =>
          Math.abs(b - requestedFrame.current) > Math.abs(a - requestedFrame.current) ? b : a,
        );
        decoded.get(farthest)?.close();
        decoded.delete(farthest);
      }
      canvas!.dataset.cachedFrames = String(decoded.size);
      canvas!.dataset.decodedBytes = String(decoded.size * frameBytes);
      canvas!.dataset.cacheLimit = String(cacheLimit);
    }

    function pump() {
      if (!active || (sleeping && decoded.has(requestedFrame.current))) return;
      const target = requestedFrame.current;
      const priority = [target];
      if (!sleeping) for (let offset = 1; offset <= warmRadius; offset++) priority.push(target + offset, target - offset);
      for (const index of priority) {
        if (jobs >= 2) break;
        if (index < 0 || index >= INTRO_FRAME_COUNT || decoded.has(index) || decoding.has(index) || failed.has(index)) continue;
        jobs++;
        decoding.add(index);
        void fetchFrame(index)
          .then(blob => active ? createImageBitmap(blob) : null)
          .then(image => {
            if (!image) return;
            if (!active) { image.close(); return; }
            if (sleeping && index !== 0 && index !== requestedFrame.current) { image.close(); return; }
            decoded.set(index, image);
            evict();
            scheduleDraw();
          })
          .catch(() => {
            if (active) {
              failed.add(index);
              setHasError(true);
            }
          })
          .finally(() => {
            jobs--;
            decoding.delete(index);
            pump();
          });
      }
    }

    function request() {
      if (requestedFrame.current !== previousRequest) direction = requestedFrame.current > previousRequest ? 1 : -1;
      previousRequest = requestedFrame.current;
      scheduleDraw(); pump();
      void prefetchNearby();
    }

    async function prefetchNearby() {
      // Only prewarm a short look-ahead after movement starts. Demand loading has priority.
      if (prefetching || sleeping || requestedFrame.current === 0) return;
      prefetching = true;
      const center = requestedFrame.current;
      try {
        for (let offset = warmRadius + 1; active && !sleeping && offset <= warmRadius + 8; offset++) {
          if (Math.abs(requestedFrame.current - center) > warmRadius) break;
          const index = center + direction * offset;
          if (index < 0 || index >= INTRO_FRAME_COUNT) continue;
          try { await fetchFrame(index); } catch { /* Demand loading reports failures. */ }
        }
      } finally {
        prefetching = false;
        if (active) {
          while (blobs.size > COMPRESSED_LIMIT) {
            const candidates = [...blobs.keys()].filter(index => index !== 0 && index !== requestedFrame.current && !decoding.has(index));
            if (!candidates.length) break;
            const farthest = candidates.reduce((a, b) => Math.abs(b - requestedFrame.current) > Math.abs(a - requestedFrame.current) ? b : a);
            blobs.delete(farthest);
          }
          canvas!.dataset.compressedFrames = String(blobs.size);
        }
      }
    }

    function resize() {
      const bounds = container!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas!.height = Math.max(1, Math.round(bounds.height * ratio));
      lastDrawn = -1;
      if (previousPaint.current) context!.drawImage(previousPaint.current, 0, 0, canvas!.width, canvas!.height);
      if (decoded.size) draw();
      scheduleDraw();
    }

    requestDraw.current = request;
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const setSleeping = (value: boolean) => {
      if (sleeping === value) return;
      sleeping = value;
      if (sleeping) {
        for (const [index, bitmap] of decoded) {
          if (index !== 0 && index !== requestedFrame.current) { bitmap.close(); decoded.delete(index); }
        }
        for (const index of blobs.keys()) if (index !== 0 && index !== requestedFrame.current) blobs.delete(index);
        canvas.dataset.cachedFrames = String(decoded.size);
        canvas.dataset.decodedBytes = String(decoded.size * frameBytes);
        pump();
      } else request();
    };
    const portrait = container.querySelector<HTMLElement>(".portrait-scene");
    const sceneObserver = new MutationObserver(() => {
      if (portrait) setSleeping(Number(portrait.dataset.aboutTime ?? 0) > 1.05);
    });
    if (portrait) sceneObserver.observe(portrait, { attributes: true, attributeFilter: ["data-about-time"] });
    const visibilityObserver = new IntersectionObserver(entries => {
      if (variant === "mobile") setSleeping(!entries[0].isIntersecting);
    });
    visibilityObserver.observe(container);
    resize();
    request();

    return () => {
      active = false;
      // Preserve the painted image through a desktop/mobile asset switch.
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width; snapshot.height = canvas.height;
      snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
      previousPaint.current = snapshot;
      abort.abort();
      observer.disconnect();
      sceneObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      requestDraw.current = null;
      decoded.forEach(image => image.close());
      decoded.clear();
      blobs.clear();
    };
  }, [variant]);

  useGsap(context => {
    const media = gsap.matchMedia();
    context.add(() => {
    media.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, () => {
    const container = containerRef.current;
    if (!container) return;
    const proxy = { frame: 0 };
    const update = () => {
      requestedFrame.current = Math.max(0, Math.min(INTRO_FRAME_COUNT - 1, Math.round(proxy.frame)));
      const progress = proxy.frame / (INTRO_FRAME_COUNT - 1);
      container.dataset.scrollProgress = progress.toFixed(4);
      onProgress?.(progress);
      requestDraw.current?.();
    };
    const timeline = gsap.timeline();
    timeline.to(proxy, { frame: INTRO_FRAME_COUNT - 1, duration: 1, ease: "none", onUpdate: update }, 0);
    configureTimeline?.(timeline);
    update();
    ScrollTrigger.create({ animation: timeline, trigger: container, start: "top top",
      end: () => "+=" + window.innerHeight * scrollDistanceVh * timeline.duration(),
      pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
    });
    });
    return () => media.revert();
    });
  }, {
    scope: containerRef,
    // The user explicitly wants scroll scrubbing enabled by default.
    // Scene motion is enabled by the explicit portfolio preference.
    respectReducedMotion: false,
    dependencies: [scrollDistanceVh, configureTimeline, onProgress],
  });

  return { containerRef, canvasRef, isReady, hasError, prefersReducedMotion };
}


