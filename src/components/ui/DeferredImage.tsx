"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePreparedResource } from "@/lib/scene-preparation";
import { imageAssets } from "@/lib/image-assets";

type Props = ImageProps & { activation?: "immediate" | "nearby" | "portrait" };

/** Prewarm the next scene without requesting every hidden image at page load. */
export function DeferredImage({ activation = "immediate", ...props }: Props) {
  const prepared = usePreparedResource(typeof props.src === "string" ? props.src : "");
  const root = useRef<HTMLSpanElement>(null);
  const [requested, setReady] = useState(activation === "immediate");
  const ready = requested || prepared;
  useEffect(() => {
    if (ready) return;
    const element = root.current;
    if (!element) return;
    const scene = element.closest<HTMLElement>(".portrait-scene");
    if (scene) {
      const index = Number(element.closest<HTMLElement>("[data-about-panel]")?.dataset.aboutPanel ?? -1);
      const threshold = activation === "portrait" ? .65 : [.8, 1.9, 3.07][index] ?? .8;
      const trigger = scene.closest<HTMLElement>("#cinematic-intro")!;
      const inspect = () => {
        const progress = activation === "portrait" ? Number(trigger.dataset.scrollProgress ?? 0) : Number(scene.dataset.aboutTime ?? trigger.dataset.scrollProgress ?? 0);
        if (progress >= threshold) setReady(true);
      };
      const observer = new MutationObserver(inspect);
      observer.observe(activation === "portrait" ? trigger : scene, { attributes: true, attributeFilter: [activation === "portrait" ? "data-scroll-progress" : "data-about-time"] });
      inspect();
      return () => observer.disconnect();
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setReady(true);
    }, { rootMargin: "400px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [activation, ready, prepared]);

  const asset = typeof props.src === "string" ? imageAssets[props.src] : undefined;
  return <span ref={root} className="deferred-image" data-image-ready={ready}>
    {ready && <Image {...props} alt={props.alt} src={asset?.src ?? props.src} width={asset?.width ?? props.width} height={asset?.height ?? props.height} placeholder={asset ? "blur" : "empty"} blurDataURL={asset?.blurDataURL} quality={90} decoding="async" loading={activation === "immediate" ? "lazy" : "eager"} />}
  </span>;
}



