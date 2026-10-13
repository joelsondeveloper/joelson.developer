import type { gsap } from "gsap";

/**
 * Shared application types.
 *
 * Centralized here so components, hooks and lib modules agree on the same
 * contracts and future scenes/animations can extend them consistently.
 */

/**
 * Callback executed inside a scoped GSAP context.
 *
 * Receives the active {@link gsap.Context} so animations created here are
 * tracked for automatic cleanup by the `useGsap` hook.
 */
export type GsapSetup = (context: gsap.Context) => void;
