"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useGsap } from "./use-gsap";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/** Minimum time delta (seconds) that justifies a new seek on the video. */
const SEEK_EPSILON = 1 / 60; // ~one frame at 60fps

/** Fallback duration (s) used only until the real metadata is known. */
const FALLBACK_DURATION = 10;

/**
 * Layout effects must run only in the browser to avoid React's SSR warning
 * ("useLayoutEffect does nothing on the server") and any hydration mismatch.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface UseVideoScrubOptions {
  /**
   * Total scroll distance (in viewport heights) the pinned scene consumes.
   * Larger values produce a slower, more cinematic zoom.
   */
  scrollDistanceVh?: number;
  /**
   * When true (default) the scroll-driven scrub is skipped for users who
   * prefer reduced motion; the scene instead shows the static first frame.
   */
  respectReducedMotion?: boolean;
  /** Explicit page-level choice; overrides the system preference for this scene. */
  motionEnabled?: boolean;
}

export interface UseVideoScrubReturn {
  /** Ref to attach to the `<video>` element. */
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Ref to attach to the scroll-trigger container (the pinned scene). */
  containerRef: RefObject<HTMLDivElement | null>;
  /** True once the first frame is decoded and paintable (safe to reveal/scrub). */
  isReady: boolean;
  /** True if the video failed to load. */
  hasError: boolean;
}

/**
 * Binds an HTML5 video's `currentTime` to the page scroll position using a
 * single GSAP `ScrollTrigger` (pin + scrub), reusing the project's `useGsap`
 * infrastructure so cleanup and reduced-motion handling stay centralized.
 *
 * Media readiness is handled internally via native `addEventListener` plus an
 * immediate `readyState` check, so a cached video (whose `loadeddata` may have
 * fired before React attached listeners) can never leave the scene stuck.
 *
 * Performance strategy:
 * - No React state is touched per frame; progress is written straight to the
 *   video element through a ref inside a GSAP proxy tween.
 * - Redundant seeks are skipped when the delta is below one frame.
 * - The tween range uses the real `duration` read from `loadedmetadata`.
 */
export function useVideoScrub({
  scrollDistanceVh = 4,
  respectReducedMotion = true,
  motionEnabled,
}: UseVideoScrubOptions = {}): UseVideoScrubReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = motionEnabled ?? !(respectReducedMotion && prefersReducedMotion);

  // Guards shared between the metadata handlers and the scroll tween.
  const durationRef = useRef(FALLBACK_DURATION);

  // Reads real duration from metadata; flips `isReady` once the first frame is
  // decoded (readyState >= HAVE_CURRENT_DATA). Registered with addEventListener
  // AND checked immediately so cached videos never stall the scene.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const readDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        durationRef.current = video.duration;
      }
    };

    const markReadyIfDecoded = () => {
      readDuration();
      // HAVE_CURRENT_DATA (2) means the first frame is available to paint.
      if (video.readyState >= 2) setIsReady(true);
    };

    const handleError = () => setHasError(true);

    // Listeners registered before any readyState inspection (spec: register
    // first, then read state) so we never miss an event.
    video.addEventListener("loadedmetadata", readDuration);
    video.addEventListener("loadeddata", markReadyIfDecoded);
    video.addEventListener("canplay", markReadyIfDecoded);
    video.addEventListener("error", handleError);

    // Immediate inspection covers cached/preloaded media.
    readDuration();
    if (video.readyState >= 2) setIsReady(true);
    if (video.error) setHasError(true);

    return () => {
      video.removeEventListener("loadedmetadata", readDuration);
      video.removeEventListener("loadeddata", markReadyIfDecoded);
      video.removeEventListener("canplay", markReadyIfDecoded);
      video.removeEventListener("error", handleError);
    };
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    // Avoid redundant / imperceptible seeks that would stutter decoding.
    if (Math.abs(time - video.currentTime) < SEEK_EPSILON) return;

    try {
      video.currentTime = time;
    } catch {
      // Seeking can throw if the media isn't seekable yet — ignore safely.
    }
  }, []);

  // Mode changes reset the paused video; static mode never seeks to the end.
  useIsomorphicLayoutEffect(() => {
    if (!isReady) return;
    videoRef.current?.pause();
    seekTo(0);
  }, [isReady, shouldAnimate, seekTo]);

  useGsap(
    () => {
      const container = containerRef.current;
      // Guard: the tween range must match the real duration, and we avoid a
      // premature pin before the first frame is ready.
      if (!container || !isReady || !shouldAnimate) return;

      // Proxy object animated 0 -> duration; onUpdate writes to the video.
      const proxy = { time: 0 };

      gsap.to(proxy, {
        time: Math.max(0, durationRef.current - 0.05),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          // Pixel-based distance so the zoom pace is predictable and
          // recomputed on resize via invalidateOnRefresh.
          end: () => `+=${window.innerHeight * scrollDistanceVh}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => seekTo(proxy.time),
      });
    },
    {
      scope: containerRef,
      // The resolved choice includes explicit consent; do not gate it a second time.
      respectReducedMotion: false,
      dependencies: [isReady, scrollDistanceVh, shouldAnimate],
    },
  );

  return { videoRef, containerRef, isReady, hasError };
}

