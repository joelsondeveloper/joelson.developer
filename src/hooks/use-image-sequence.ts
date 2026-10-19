"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsap } from "./use-gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

import { introSequence, introFrameUrl as frameUrl } from "@/lib/intro-sequence";

export const INTRO_FRAME_COUNT = introSequence.desktop.frameCount;

const MB = 1024 * 1024;
const DESKTOP_BUDGET = 96 * MB;
const MOBILE_BUDGET = 32 * MB;

const MAX_BITMAPS = 28;
const MAX_BLOBS = 96;
const MAX_JOBS = 3;
const MAX_RETRIES = 2;

type Variant = "desktop" | "mobile";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}


export function useImageSequence(
  scrollDistanceVh = 4,
  configureTimeline?: (timeline: gsap.core.Timeline) => void,
  onProgress?: (progress: number) => void,
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const reducedRef = useRef(prefersReducedMotion);
  useLayoutEffect(() => { reducedRef.current = prefersReducedMotion; }, [prefersReducedMotion]);

  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store normalized progress so desktop/mobile use the
  // same scroll position when responsive assets are switched.
  const progressRef = useRef(0);

  const requestedFrame = useRef(0);
  const requestDraw = useRef<(() => void) | null>(null);

  const [variant, setVariant] = useState<Variant>(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setVariant(query.matches ? "mobile" : "desktop");
    };

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });

    if (!canvas || !container || !ctx) return;

    let active = true;
    let sleeping = false;
    let raf = 0;
    let jobs = 0;
    let lastDrawn = -1;
    let revealed = false;
    let direction = 1;
    let previousTarget = 0;
    let pumpQueued = false;

    const abort = new AbortController();

    const isMobile = variant === "mobile";
    const frameCount = introSequence[variant].frameCount;
    const lastFrame = frameCount - 1;
    const anchorFrames = [0, Math.round(lastFrame / 2), lastFrame];

    const frameWidth = introSequence[variant].width;
    const frameHeight = introSequence[variant].height;
    const frameBytes = frameWidth * frameHeight * 4;

    const budget = isMobile ? MOBILE_BUDGET : DESKTOP_BUDGET;

    const cacheLimit = clamp(Math.floor(budget / frameBytes), 3, MAX_BITMAPS);

    const warmRadius = Math.max(
      2,
      Math.min(8, Math.floor((cacheLimit - 2) / 2)),
    );

    const decoded = new Map<number, ImageBitmap>();
    const blobs = new Map<number, Blob>();
    const loading = new Set<number>();
    const failures = new Map<number, number>();
    const permanentlyFailed = new Set<number>();

    requestedFrame.current = clamp(
      reducedRef.current ? 0 : Math.round(progressRef.current * lastFrame),
      0,
      lastFrame,
    );

    let requested = requestedFrame.current;
    let lastValidFrame = -1;
    previousTarget = requested;

    const stats = {
      draws: 0,
      misses: 0,
      substitutions: 0,
      failed: 0,
    };

    function updateStats() {
      if (!active) return;

      canvas!.dataset.cachedFrames = String(decoded.size);
      canvas!.dataset.decodedBytes = String(decoded.size * frameBytes);
      canvas!.dataset.cacheLimit = String(cacheLimit);
      canvas!.dataset.compressedFrames = String(blobs.size);
      canvas!.dataset.frameMisses = String(stats.misses);
      canvas!.dataset.frameSubstitutions = String(stats.substitutions);
      canvas!.dataset.draws = String(stats.draws);
      canvas!.dataset.failedFrames = String(stats.failed);
      canvas!.dataset.totalFrames = String(frameCount);
      canvas!.dataset.variant = variant;
    }

    function touch(index: number) {
      const image = decoded.get(index);
      if (!image) return;

      decoded.delete(index);
      decoded.set(index, image);
    }

    function evictDecoded() {
      while (decoded.size > cacheLimit) {
        const protectedFrames = new Set([...anchorFrames, requested, lastDrawn]);

        const candidates = [...decoded.keys()].filter(
          (index) => !protectedFrames.has(index),
        );

        if (!candidates.length) break;

        candidates.sort(
          (a, b) => Math.abs(b - requested) - Math.abs(a - requested),
        );

        const victim = candidates[0];

        decoded.get(victim)?.close();
        decoded.delete(victim);
      }

      updateStats();
    }

    function evictBlobs() {
      while (blobs.size > MAX_BLOBS) {
        const candidates = [...blobs.keys()].filter(
          (index) => index !== requested && !loading.has(index),
        );

        if (!candidates.length) break;

        candidates.sort(
          (a, b) => Math.abs(b - requested) - Math.abs(a - requested),
        );

        blobs.delete(candidates[0]);
      }

      updateStats();
    }

    function findFrame(target: number): number | null {
      if (decoded.has(target)) return target;
      let nearest: number | null = decoded.has(lastDrawn) ? lastDrawn : null;
      let distance = nearest === null ? Infinity : Math.abs(nearest - target);
      for (const index of decoded.keys()) {
        // Advance toward the requested frame without overshooting or flickering backwards.
        if (lastDrawn >= 0 && (target >= lastDrawn ? index < lastDrawn || index > target : index > lastDrawn || index < target)) continue;
        const nextDistance = Math.abs(index - target);
        if (nextDistance < distance) { nearest = index; distance = nextDistance; }
      }
      return nearest;
    }

    function draw() {
      raf = 0;
      if (!active) return;

      const target = requestedFrame.current;
      // Retain the already painted canvas during a responsive source switch/resize.
      if (lastDrawn < 0 && canvas!.dataset.frame !== undefined && !decoded.has(target)) return;
      const index = findFrame(target);

      if (index === null) {
        stats.misses++;
        updateStats();
        return;
      }

      if (index === lastDrawn) return;

      const image = decoded.get(index);
      if (!image) return;

      if (index !== target) {
        stats.substitutions++;
      }

      const scale = Math.max(
        canvas!.width / image.width,
        canvas!.height / image.height,
      );

      const width = image.width * scale;
      const height = image.height * scale;

      ctx!.drawImage(
        image,
        (canvas!.width - width) / 2,
        (canvas!.height - height) / 2,
        width,
        height,
      );

      lastDrawn = index;
      lastValidFrame = index;

      canvas!.dataset.frame = String(index);
      canvas!.style.visibility = "visible";

      stats.draws++;
      touch(index);
      updateStats();

      if (!revealed) { revealed = true; setIsReady(true); }
    }

    function scheduleDraw() {
      if (!active || raf) return;
      raf = requestAnimationFrame(draw);
    }

    async function loadFrame(index: number) {
      if (
        !active ||
        loading.has(index) ||
        decoded.has(index) ||
        permanentlyFailed.has(index)
      ) {
        return;
      }

      loading.add(index);
      jobs++;

      try {
        let blob = blobs.get(index);

        if (!blob) {
          const response = await fetch(frameUrl(index, variant), {
            signal: abort.signal,
            cache: "force-cache",
          });

          if (!response.ok) {
            throw new Error(`Frame HTTP ${response.status}`);
          }

          blob = await response.blob();

          if (!active) return;

          blobs.set(index, blob);
          evictBlobs();
        }

        const bitmap = await createImageBitmap(blob);

        if (!active) {
          bitmap.close();
          return;
        }

        if (sleeping && index !== 0 && index !== requestedFrame.current) { bitmap.close(); return; }

        if (decoded.has(index)) {
          bitmap.close();
          return;
        }

        decoded.set(index, bitmap);
        touch(index);

        evictDecoded();
        scheduleDraw();
      } catch (error) {
        if (!active || abort.signal.aborted) return;

        const attempts = (failures.get(index) ?? 0) + 1;
        failures.set(index, attempts);
        blobs.delete(index);

        if (attempts >= MAX_RETRIES) {
          permanentlyFailed.add(index);
          stats.failed++;
          setHasError(true);

          console.warn(
            `[ImageSequence] Failed frame ${index + 1}/${frameCount}`,
            error,
          );
        }
      } finally {
        loading.delete(index);
        jobs--;

        if (active) {
          updateStats();
          queuePump();
        }
      }
    }

    function buildPriority(): number[] {
      const target = requestedFrame.current;
      const result: number[] = [];
      const seen = new Set<number>();

      function add(index: number) {
        if (index < 0 || index >= frameCount || seen.has(index)) {
          return;
        }

        seen.add(index);
        result.push(index);
      }

      add(target);

      for (const anchor of anchorFrames) add(anchor);

      for (let offset = 1; offset <= warmRadius; offset++) {
        add(target + offset * direction);
        add(target - offset * direction);
      }

      for (let offset = warmRadius + 1; offset <= warmRadius + 4; offset++) {
        add(target + offset * direction);
      }

      if (target === 0) {
        for (let index = 1; index <= warmRadius + 4; index++) {
          add(index);
        }
      }

      return result;
    }

    function pump() {
      if (!active || sleeping) return;

      const priority = buildPriority();

      for (const index of priority) {
        if (jobs >= MAX_JOBS) break;

        if (
          decoded.has(index) ||
          loading.has(index) ||
          permanentlyFailed.has(index)
        ) {
          continue;
        }

        // Keep one slot available for the exact frame requested by a scroll jump.
        if (index !== requestedFrame.current && jobs >= MAX_JOBS - 1) continue;
        void loadFrame(index);
      }
    }

    function queuePump() {
      if (!active || pumpQueued) return;

      pumpQueued = true;

      queueMicrotask(() => {
        pumpQueued = false;
        if (active) pump();
      });
    }

    function request() {
      if (!active) return;

      requestedFrame.current = clamp(
        reducedRef.current ? 0 : Math.round(progressRef.current * lastFrame),
        0,
        lastFrame,
      );

      requested = requestedFrame.current;
      canvas!.dataset.requestedFrame = String(requested);
      if (requested === previousTarget && lastDrawn === requested) return;

      if (requested !== previousTarget) {
        direction = requested > previousTarget ? 1 : -1;
        previousTarget = requested;
      }

      // A ready bitmap can paint in the same ScrollTrigger update, with no catch-up tween.
      if (decoded.has(requested)) { if (raf) cancelAnimationFrame(raf); draw(); } else scheduleDraw();
      queuePump();
    }

    function resize() {
      if (!active) return;

      const bounds = container!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

      const width = Math.max(1, Math.round(bounds.width * ratio));

      const height = Math.max(1, Math.round(bounds.height * ratio));

      if (canvas!.width !== width || canvas!.height !== height) {
        const snapshot = document.createElement("canvas");
        snapshot.width = canvas!.width; snapshot.height = canvas!.height;
        snapshot.getContext("2d")?.drawImage(canvas!, 0, 0);
        canvas!.width = width;
        canvas!.height = height;
        ctx!.drawImage(snapshot, 0, 0, width, height);
        lastDrawn = -1;
      }

      scheduleDraw();
    }

    function setSleeping(value: boolean) {
      if (sleeping === value) return;

      sleeping = value;

      if (sleeping) {
        for (const [index, bitmap] of decoded) {
          if (!anchorFrames.includes(index) && index !== requestedFrame.current && index !== lastValidFrame) {
            bitmap.close();
            decoded.delete(index);
          }
        }

        evictDecoded();
      } else {
        request();
        queuePump();
      }
    }

    requestDraw.current = request;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const portrait = container.querySelector<HTMLElement>(".portrait-scene");

    const sceneObserver = new MutationObserver(() => {
      if (!portrait) return;

      const aboutTime = Number(portrait.dataset.aboutTime ?? 0);

      setSleeping(aboutTime > 1.05);
    });

    if (portrait) {
      sceneObserver.observe(portrait, {
        attributes: true,
        attributeFilter: ["data-about-time"],
      });

      // Apply the current scene state immediately.
      setSleeping(Number(portrait.dataset.aboutTime ?? 0) > 1.05);
    }

    const visibilityObserver = new IntersectionObserver((entries) => {
      if (isMobile) {
        setSleeping(!entries[0].isIntersecting);
      }
    });

    visibilityObserver.observe(container);

    resize();
    queuePump();

    return () => {
      active = false;
      abort.abort();

      resizeObserver.disconnect();
      sceneObserver.disconnect();
      visibilityObserver.disconnect();

      cancelAnimationFrame(raf);
      requestDraw.current = null;

      decoded.forEach((bitmap) => bitmap.close());
      decoded.clear();
      blobs.clear();
      loading.clear();
    };
  }, [variant]);

  useGsap(
    (context) => {
      const media = gsap.matchMedia();

      context.add(() => {
        media.add(
          {
            desktop: "(min-width: 768px)",
            mobile: "(max-width: 767px)",
          },
          (mediaContext) => {
            const container = containerRef.current;
            if (!container) return;

            const isMobile = Boolean(mediaContext.conditions?.mobile);

            const frameCount = isMobile
              ? introSequence.mobile.frameCount
              : introSequence.desktop.frameCount;

            const lastFrame = frameCount - 1;

            const proxy = {
              frame: 0,
            };

            const update = () => {
              const progress = clamp(proxy.frame / lastFrame, 0, 1);

              progressRef.current = progress;

              requestedFrame.current = prefersReducedMotion
                ? 0
                : clamp(Math.round(progress * lastFrame), 0, lastFrame);

              container.dataset.scrollProgress = progress.toFixed(4);

              onProgress?.(progress);
              requestDraw.current?.();
            };

            const timeline = gsap.timeline();

            timeline.to(
              proxy,
              {
                frame: lastFrame,
                duration: 1,
                ease: "none",
                onUpdate: update,
              },
              0,
            );

            configureTimeline?.(timeline);
            update();

            ScrollTrigger.create({
              animation: timeline,
              trigger: container,
              start: "top top",
              end: () =>
                "+=" +
                window.innerHeight * scrollDistanceVh * timeline.duration(),
              pin: true,
              pinSpacing: true,
              scrub: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            });
          },
        );

        return () => media.revert();
      });
    },
    {
      scope: containerRef,
      respectReducedMotion: false,
      dependencies: [
        scrollDistanceVh,
        configureTimeline,
        onProgress,
        prefersReducedMotion,
      ],
    },
  );

  return {
    containerRef,
    canvasRef,
    isReady,
    hasError,
    prefersReducedMotion,
  };
}
