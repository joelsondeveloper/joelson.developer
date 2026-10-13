"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { DependencyList, RefObject } from "react";
import { gsap } from "@/lib/gsap";
import type { GsapSetup } from "@/types";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Layout effects must run only in the browser to avoid React's SSR warning
 * ("useLayoutEffect does nothing on the server") and any hydration mismatch,
 * while still executing GSAP setup synchronously before the browser paints.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface UseGsapOptions<T extends HTMLElement> {
  /** Element the animation selectors are scoped to. Defaults to the returned ref. */
  scope?: RefObject<T | null>;
  /** When true (default), no animations are created if reduced motion is preferred. */
  respectReducedMotion?: boolean;
  /** Dependency list controlling when the effect re-runs. Defaults to run-once on mount. */
  dependencies?: DependencyList;
}

/**
 * Bridges GSAP and React for the Next.js App Router.
 *
 * - Creates a scoped `gsap.context` so every tween/timeline/ScrollTrigger
 *   registered inside `setup` is tracked and reverted automatically on
 *   cleanup (no leaked animations or listeners).
 * - Uses an isomorphic layout effect for hydration safety.
 * - Honors `prefers-reduced-motion` by skipping animation setup entirely.
 *
 * @returns a ref to attach to the animated root element (or the provided scope).
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: GsapSetup,
  options: UseGsapOptions<T> = {},
): RefObject<T | null> {
  const { scope, respectReducedMotion = true, dependencies = [] } = options;
  const prefersReducedMotion = usePrefersReducedMotion();
  const skipAnimation = respectReducedMotion && prefersReducedMotion;

  const internalRef = useRef<T>(null);
  const scopeRef = scope ?? internalRef;

  useIsomorphicLayoutEffect(() => {
    // Respect the user's motion preference: build no animations at all.
    if (skipAnimation) {
      return;
    }

    const context = gsap.context((self) => {
      setup(self);
    }, scopeRef);

    return () => {
      context.revert();
    };
    // `setup` is intentionally excluded so animations are driven solely by the
    // caller-controlled `dependencies` (mirrors @gsap/react's useGSAP pattern).
  }, [scopeRef, skipAnimation, ...dependencies]);

  return scopeRef;
}
