import { site } from "@/lib/site";

/**
 * Provisional placeholder home page.
 *
 * Intentionally minimal — it exists only to validate that the app builds,
 * hydrates and renders. The cinematic TV, video, hill and other scenes will
 * be introduced in later phases; nothing animated or interactive lives here yet.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {site.name}
      </h1>
      <p className="text-foreground/60 text-base sm:text-lg">{site.tagline}</p>
    </main>
  );
}
