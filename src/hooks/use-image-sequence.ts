"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useGsap } from "./use-gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export const INTRO_FRAME_COUNT = 192;
const CACHE_LIMIT = 24;
const WARM_RADIUS = 10;

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
  const requestDraw = useRef<(() => void) | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !container || !context) return;

    canvas.style.visibility = "hidden";
    const abort = new AbortController();
    const variant = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
    const blobs = new Map<number, Promise<Blob>>();
    const decoded = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    const failed = new Set<number>();
    let active = true;
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
      while (decoded.size > CACHE_LIMIT) {
        const candidates = [...decoded.keys()].filter(index => index !== 0 && index !== requestedFrame.current);
        const farthest = candidates.reduce((a, b) =>
          Math.abs(b - requestedFrame.current) > Math.abs(a - requestedFrame.current) ? b : a,
        );
        decoded.get(farthest)?.close();
        decoded.delete(farthest);
      }
      canvas!.dataset.cachedFrames = String(decoded.size);
    }

    function pump() {
      if (!active) return;
      const target = requestedFrame.current;
      const priority = [target];
      for (let offset = 1; offset <= WARM_RADIUS; offset++) priority.push(target + offset, target - offset);
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
      scheduleDraw();
      pump();
    }

    function resize() {
      const bounds = container!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas!.height = Math.max(1, Math.round(bounds.height * ratio));
      lastDrawn = -1;
      scheduleDraw();
    }

    requestDraw.current = request;
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    request();

    // Prefetch compressed files only. Decoding stays near the scroll position.
    let next = 0;
    async function prefetch() {
      while (active && next < INTRO_FRAME_COUNT) {
        const index = next++;
        try { await fetchFrame(index); } catch { /* Demand loading reports failures. */ }
      }
    }
    for (let worker = 0; worker < 4; worker++) void prefetch();

    return () => {
      active = false;
      abort.abort();
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      requestDraw.current = null;
      decoded.forEach(image => image.close());
      decoded.clear();
      blobs.clear();
    };
  }, []);

  useGsap(() => {
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
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: () => `+=${window.innerHeight * scrollDistanceVh}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    timeline.to(proxy, { frame: INTRO_FRAME_COUNT - 1, duration: 1, ease: "none", onUpdate: update }, 0);
    configureTimeline?.(timeline);
    update();
  }, {
    scope: containerRef,
    // The user explicitly wants scroll scrubbing enabled by default.
    // Scene motion is enabled by the explicit portfolio preference.
    respectReducedMotion: false,
    dependencies: [scrollDistanceVh, configureTimeline, onProgress],
  });

  return { containerRef, canvasRef, isReady, hasError, prefersReducedMotion };
}

