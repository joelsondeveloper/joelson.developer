"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type TapeSound = "insert" | "eject";
/** Short, locally synthesized transport sounds. No audio is fetched or autoplayed. */
export function useVhsSounds(scene: RefObject<HTMLElement | null>) {
  const context = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const prepare = useCallback(() => {
    if (mutedRef.current || !window.AudioContext) return;
    try {
      context.current ??= new AudioContext();
      if (context.current.state === "suspended") void context.current.resume().catch(() => {});
    } catch { /* Sound is optional when audio is unavailable. */ }
  }, []);
  useEffect(() => {
    const node = scene.current;
    const unlock = (event: Event) => {
      if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key)) return;
      if (node?.dataset.active === "true") prepare();
    };
    node?.addEventListener("pointerdown", unlock, { capture: true, passive: true });
    node?.addEventListener("keydown", unlock, true);
    return () => {
      node?.removeEventListener("pointerdown", unlock, true);
      node?.removeEventListener("keydown", unlock, true);
      const audio = context.current; context.current = null;
      if (audio && audio.state !== "closed") void audio.close().catch(() => {});
    };
  }, [scene, prepare]);
  const toggle = () => {
    const next = !mutedRef.current; mutedRef.current = next; setMuted(next);
    if (next && context.current?.state === "running") void context.current.suspend().catch(() => {});
    if (!next) prepare();
  };
  const play = useCallback((kind: TapeSound) => {
    if (mutedRef.current || document.hidden) return;
    prepare();
    const audio = context.current;
    if (!audio || audio.state !== "running") return;
    const start = audio.currentTime + .015, duration = kind === "insert" ? .52 : .42;
    const bus = audio.createGain(); bus.gain.value = .20; bus.connect(audio.destination);
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
    const samples = buffer.getChannelData(0);
    let seed = 7139;
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      samples[i] = (seed / 2147483648 - 1);
    }
    const source = audio.createBufferSource(); source.buffer = buffer;
    const filter = audio.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1500;
    const envelope = audio.createGain(); envelope.gain.setValueAtTime(.001, start);
    envelope.gain.linearRampToValueAtTime(.23, start + .025);
    envelope.gain.exponentialRampToValueAtTime(.04, start + duration * .65);
    envelope.gain.exponentialRampToValueAtTime(.001, start + duration);
    source.connect(filter).connect(envelope).connect(bus); source.start(start);
    const motor = audio.createOscillator(), motorGain = audio.createGain();
    motor.type = "triangle"; motor.frequency.setValueAtTime(kind === "insert" ? 125 : 165, start);
    motor.frequency.exponentialRampToValueAtTime(kind === "insert" ? 75 : 95, start + duration);
    motorGain.gain.setValueAtTime(.001, start); motorGain.gain.linearRampToValueAtTime(.15, start + .05);
    motorGain.gain.exponentialRampToValueAtTime(.001, start + duration);
    motor.connect(motorGain).connect(bus); motor.start(start); motor.stop(start + duration);
    const clicks: OscillatorNode[] = [], gains: GainNode[] = [];
    for (const delay of [0, duration - .08]) {
      const click = audio.createOscillator(), gain = audio.createGain(), t = start + delay;
      click.type = "triangle"; click.frequency.setValueAtTime(680, t); click.frequency.exponentialRampToValueAtTime(90, t + .045);
      gain.gain.setValueAtTime(.001, t); gain.gain.linearRampToValueAtTime(.6, t + .003); gain.gain.exponentialRampToValueAtTime(.001, t + .065);
      click.connect(gain).connect(bus); click.start(t); click.stop(t + .07); clicks.push(click); gains.push(gain);
    }
    motor.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); motor.disconnect(); motorGain.disconnect(); clicks.forEach(node => node.disconnect()); gains.forEach(node => node.disconnect()); bus.disconnect(); };
  }, [prepare]);
  return { play, muted, toggle };
}
