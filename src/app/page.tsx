import { CinematicIntro } from "@/components/scenes/CinematicIntro";

/** The entire CRT experience shares one pinned viewport on desktop and mobile. */
export default function Home() {
  return <main className="bg-background"><CinematicIntro /></main>;
}