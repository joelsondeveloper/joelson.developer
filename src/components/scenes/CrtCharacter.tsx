"use client";

import { Suspense, useEffect, useMemo, useRef, useCallback, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, useGLTF } from "@react-three/drei";
import { Group, MathUtils, Mesh, MeshStandardMaterial, Texture, Material, BufferGeometry, Box3, Vector3 } from "three";

const URL = "/models/crt-character-parts.glb";
let disposal: ReturnType<typeof setTimeout> | undefined;
export function preloadCharacter() { clearTimeout(disposal); useGLTF.preload(URL); }
export interface Gaze { x: number; y: number; events: EventTarget }
interface Props { gaze: RefObject<Gaze>; reduced: boolean; reaction: boolean; onReady: () => void; onDispose: () => void }

function Actor({ gaze, reduced, reaction, onReady, onDispose, onFrame }: Props & { onFrame: (yaw: number, pitch: number, frames: number, body: string) => void }) {
  const { scene: source } = useGLTF(URL), { invalidate, size } = useThree();
  const uniforms = useMemo(() => ({ time: { value: 0 }, reaction: { value: 0 } }), []);
  const scene = useMemo(() => {
    const clone = source.clone(true);
    clone.updateMatrixWorld(true);
    const parts: Mesh[] = [];
    clone.traverse(object => { if (object instanceof Mesh) parts.push(object); });
    const head = new Group(), body = new Group();
    head.name = "HeadPivot"; head.position.set(0, .6505, 0); body.name = "Body";
    clone.add(head, body); clone.updateMatrixWorld(true);
    // This export contains independent meshes, not a skeleton. Move intact TV
    // pieces into one pivot; leave collar, neck connector and shoulders untouched.
    for (const screen of parts) {
      if (new Box3().setFromObject(screen).min.y < .65) { body.attach(screen); continue; }
      const offset = screen.getWorldPosition(new Vector3());
      head.attach(screen);
    const material = (screen.material as MeshStandardMaterial).clone();
    material.onBeforeCompile = shader => {
      shader.uniforms.uCrtOffset = { value: offset };
      shader.uniforms.uCrtTime = uniforms.time; shader.uniforms.uCrtReaction = uniforms.reaction;
      shader.vertexShader = "varying vec3 vCrtPosition;\nuniform vec3 uCrtOffset;\n" + shader.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\nvCrtPosition = position + uCrtOffset;`);
      shader.fragmentShader = "varying vec3 vCrtPosition;\nuniform float uCrtTime;\nuniform float uCrtReaction;\n" + shader.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        // The original sunset identifies itself by its pigment; no extra plane or replaced UVs.
        float pigment = smoothstep(.06,.17,diffuseColor.r-diffuseColor.g) * smoothstep(.015,.09,diffuseColor.b-diffuseColor.g);
        float glass = pigment * step(.65,vCrtPosition.y) * step(vCrtPosition.y,.90) * smoothstep(.12,.16,vCrtPosition.z);
        float line = .022 + .018*sin(vCrtPosition.y*1800.0);
        diffuseColor.rgb *= 1.0-glass*line;
        float tracking = smoothstep(.985,1.0,fract(uCrtTime*.075));
        totalEmissiveRadiance += diffuseColor.rgb*glass*(.20+uCrtReaction*.24+tracking*.055);
      `);
    };
    material.customProgramCacheKey = () => "portfolio-crt-parts-sunset-v2";
    screen.material = material;
    }
    return clone;
  }, [source, uniforms]);
  const live = useRef<{ head: Group; body: Group; uniforms: typeof uniforms } | null>(null);
  useEffect(() => { live.current = { head: scene.getObjectByName("HeadPivot") as Group, body: scene.getObjectByName("Body") as Group, uniforms }; return () => { live.current = null; }; }, [scene, uniforms]);
  const root = useRef<Group>(null), elapsed = useRef(0), frames = useRef(0), readySent = useRef(false);
  useEffect(() => {
    clearTimeout(disposal); invalidate();
    return () => {
      readySent.current = false; onDispose();
      scene.getObjectByName("HeadPivot")!.traverse(object => { if (object instanceof Mesh) (object.material as Material).dispose(); });
      disposal = setTimeout(() => {
        const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(), textures = new Set<Texture>();
        source.traverse(object => { if (object instanceof Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => { materials.add(material); Object.values(material).forEach(value => { if (value instanceof Texture) textures.add(value); }); }); } });
        geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => { value.dispose(); if (typeof ImageBitmap !== "undefined" && value.image instanceof ImageBitmap) value.image.close(); }); useGLTF.clear(URL);
      }, 180);
    };
  }, [scene, source, invalidate, onDispose]);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined, focused = document.hasFocus(), interactionUntil = 0;
    const events = gaze.current.events;
    const canRender = () => !document.hidden && !reduced && (focused || performance.now() < interactionUntil);
    const tick = () => {
      if (canRender()) invalidate();
      else { clearInterval(timer); timer = undefined; }
    };
    const sync = () => {
      if (canRender()) { if (!timer) timer = setInterval(tick, 1000 / 30); invalidate(); }
      else { clearInterval(timer); timer = undefined; }
    };
    // Input remains authoritative when an embedded browser reports stale focus.
    // Keep enough frames for damping to settle, then suspend again when unfocused.
    const wake = () => { interactionUntil = performance.now() + 1800; sync(); };
    const blur = () => { focused = false; sync(); }, focus = () => { focused = true; sync(); };
    events.addEventListener("change", wake);
    document.addEventListener("visibilitychange", sync); window.addEventListener("blur", blur); window.addEventListener("focus", focus); sync();
    return () => { clearInterval(timer); events.removeEventListener("change", wake); document.removeEventListener("visibilitychange", sync); window.removeEventListener("blur", blur); window.removeEventListener("focus", focus); };
  }, [invalidate, reduced, gaze]);
  useEffect(() => { invalidate(); }, [reaction, reduced, invalidate]);
  useFrame((_, delta) => {
    const state = live.current; if (!state) return;
    const { head, body } = state;
    const dt = Math.min(delta, .07); elapsed.current += dt;
    const x = reduced ? 0 : MathUtils.clamp(gaze.current.x, -1, 1) * .30;
    const y = reduced ? 0 : MathUtils.clamp(gaze.current.y, -1, 1) * -.14;
    head.rotation.y = reduced ? 0 : MathUtils.damp(head.rotation.y, x, 6, dt);
    head.rotation.x = reduced ? 0 : MathUtils.damp(head.rotation.x, y, 6, dt);
    if (root.current) root.current.position.y = reduced ? 0 : Math.sin(elapsed.current * .8) * .00045;
    state.uniforms.time.value = reduced ? 0 : elapsed.current;
    state.uniforms.reaction.value = reaction ? .8 : 0;
    frames.current += 1;
    onFrame(head.rotation.y, head.rotation.x, frames.current, `${body.rotation.x},${body.rotation.y},${body.rotation.z}`);
    if (!readySent.current) { readySent.current = true; onReady(); }
  });
  // Keep both antennas inside the frustum; crop the torso at the middle of the chest.
  const visibleHeight = .57;
  const zoom = Math.min(size.height / visibleHeight, size.width / .49);
  return <><OrthographicCamera makeDefault position={[0,.765,3]} zoom={zoom} /><ambientLight intensity={1.7} /><directionalLight position={[-1,2,3]} intensity={2.5} color="#ffead9" /><directionalLight position={[2,1,-2]} intensity={1.2} color="#d7b6c3" /><group ref={root}><primitive object={scene} dispose={null} /></group></>;
}
export default function CrtCharacter(props: Props) {
  const diagnostic = useRef<HTMLDivElement>(null);
  const report = useCallback((yaw: number, pitch: number, frames: number, body: string) => {
    const element = diagnostic.current; if (!element) return;
    element.dataset.headYaw = yaw.toFixed(4); element.dataset.headPitch = pitch.toFixed(4); element.dataset.bodyRotation = body; element.dataset.frames = String(frames);
  }, []);
  return <div ref={diagnostic} className="crt-renderer"><Canvas orthographic frameloop="demand" dpr={[1,1.25]} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}><Suspense fallback={null}><Actor {...props} onFrame={report} /></Suspense></Canvas></div>;
}
