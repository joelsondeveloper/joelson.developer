"use client";

import { useEffect, useRef } from "react";

/** One grain layer for all three channels inside the CRT, with no pointer interception. */
export function CrtGrain() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = layer.current!;
    const scene = node.parentElement!.querySelector<HTMLElement>(".portrait-scene")!;
    const sync = () => {
      const time = Number(scene.dataset.aboutTime || 0);
      const visible = String(time >= .88 && time < 9.55);
      if (node.dataset.visible !== visible) node.dataset.visible = visible;
    };
    const observer = new MutationObserver(sync);
    observer.observe(scene, { attributes: true, attributeFilter: ["data-about-time"] }); sync();
    return () => observer.disconnect();
  }, []);
  return <div ref={layer} className="crt-grain" data-visible="false" aria-hidden="true" />;
}
