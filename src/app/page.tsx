import { CinematicIntro } from "@/components/scenes/CinematicIntro";

/**
 * Home page — renders Scene 01 (the cinematic TV scroll experience).
 *
 * This stays a Server Component; all client-side behavior lives inside the
 * `CinematicIntro` scene component. No placeholder copy or decorative UI is
 * rendered here — the video is the sole protagonist.
 */
export default function Home() {
  return (
    <main className="bg-background">
      <CinematicIntro />
    </main>
  );
}
