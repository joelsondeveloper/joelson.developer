"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, useGLTF } from "@react-three/drei";
import { Box3, CanvasTexture, Group, SRGBColorSpace, Vector3, Mesh, Material, Texture, Color } from "three";
import { gsap } from "gsap";
import { projects } from "@/data/projects";
import { sceneLayout, tapeRoute } from "./scene-layout";

export type TapeMode = "collection" | "dragging" | "inspect" | "inserting" | "tuning" | "playing" | "ejecting";
export interface TapePointer {
  clientX: number; clientY: number; pointerId: number; currentTarget: HTMLElement;
  preventDefault: () => void; stopPropagation: () => void;
}
export interface Handlers { down: (e: TapePointer) => void; move: (e: TapePointer) => void; up: (e: TapePointer) => void; cancel: () => void }
export interface VhsController { tapes: Record<number, Handlers>; invalidate?: () => void }
interface Props {
  selected: number | null; mode: TapeMode; drag: boolean; reduced: boolean; rotation: number;
  progress: RefObject<number>;
  onHit: (index: number, width: number, height: number, x: number, y: number, rotation: number, enabled: boolean) => void;
  onRegister: (index: number, handlers: Handlers | null) => void;
  onReady: (invalidate?: () => void) => void;
  onSelect: (index: number) => void; onGrab: (index: number) => void; onInsert: (index: number) => void;
  onInserted: () => void; onEjected: () => void; onReturn: () => void;
}
let disposal: ReturnType<typeof setTimeout> | undefined;

function Tape({ index, ...props }: Props & { index: number }) {
  const { scene } = useGLTF("/models/vhs-cassette.glb");
  const group = useRef<Group>(null);
  const { invalidate, size, gl } = useThree();
  const layout = sceneLayout(size.width, size.height);
  const route = () => tapeRoute(props.progress.current, index, size.width, size.height);
  const selected = props.selected === index;
  const returning = useRef(false), initialized = useRef(false);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.children[0]?.rotation.set(0, 0, 0);
    clone.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(clone);
    const scale = 2.35 / bounds.getSize(new Vector3()).x;
    clone.position.copy(bounds.getCenter(new Vector3()).multiplyScalar(-scale));
    clone.scale.setScalar(scale);
    // Materials belong to this instance; geometry and image textures remain shared.
    clone.traverse(object => {
      if (object instanceof Mesh) {
        const multiple = Array.isArray(object.material);
        const materials = (multiple ? object.material as Material[] : [object.material as Material]).map(material => {
        const owned = material.clone();
        if ("color" in owned) owned.userData.baseColor = (owned.color as Color).clone();
        return owned;
      });
        object.material = multiple ? materials : materials[0];
      }
    });
    return clone;
  }, [scene]);
  useEffect(() => {
    model.traverse(object => {
      if (!(object instanceof Mesh)) return;
      (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
        if ("color" in material && material.userData.baseColor) (material.color as Color).copy(material.userData.baseColor).multiplyScalar(props.selected !== null && !selected ? .42 : 1);
      });
    });
    invalidate();
  }, [model, props.selected, selected, invalidate]);
  useEffect(() => () => { model.traverse(object => { if (object instanceof Mesh) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose()); }); }, [model]);
  const label = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 180;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#e8dfca"; ctx.fillRect(0, 0, 1024, 180);
    ctx.fillStyle = projects[index].accent; ctx.fillRect(0, 0, 16, 180);
    ctx.fillStyle = "#26241f"; ctx.font = "bold 38px monospace";
    ctx.fillText(projects[index].tapeLabel.split(" — ")[0], 42, 72);
    ctx.font = "26px monospace"; ctx.fillText(projects[index].tapeLabel.split(" — ")[1], 42, 129);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }, [index]);
  useEffect(() => () => label.dispose(), [label]);
  const gesture = useRef<{ x: number; y: number; startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean; drag: boolean; near: boolean } | null>(null);
  const animateReturn = () => {
    const node = group.current!, target = selected && props.mode === "inspect" ? { x: 0, y: 0, z: 2, scale: size.width < 768 ? 1.3 : 1.65, rx: -.08, ry: 0, rz: 0 } : route();
    returning.current = true; animation.current?.kill();
    animation.current = gsap.timeline({ onUpdate: invalidate, onComplete: () => { returning.current = false; invalidate(); } })
      .to(node.position, { x: target.x, y: target.y, z: target.z, duration: props.reduced ? .01 : .5 })
      .to(node.rotation, { x: target.rx, y: target.ry, z: target.rz, duration: props.reduced ? .01 : .5 }, 0)
      .to(node.scale, { x: target.scale, y: target.scale, z: target.scale, duration: props.reduced ? .01 : .5 }, 0);
  };
  useEffect(() => {
    const node = group.current!;
    if (props.mode === "dragging" || props.mode === "tuning" || props.mode === "playing") return;
    const duration = props.reduced ? .01 : .65;
    animation.current?.kill(); returning.current = false;
    const timeline = gsap.timeline({ onUpdate: invalidate }); animation.current = timeline;
    if (props.mode === "collection") {
      const target = route();
      if (!initialized.current) {
        node.position.set(target.x, target.y, target.z); node.rotation.set(target.rx, target.ry, target.rz); node.scale.setScalar(target.scale); initialized.current = true;
      } else {
        returning.current = true;
        timeline.to(node.position, { x: target.x, y: target.y, z: target.z, duration })
          .to(node.rotation, { x: target.rx, y: target.ry, z: target.rz, duration }, 0)
          .to(node.scale, { x: target.scale, y: target.scale, z: target.scale, duration, onComplete: () => { returning.current = false; invalidate(); } }, 0);
      }
    } else if (selected && props.mode === "inserting") {
      const scale = layout.slotWidth / 2.35 * .93;
      timeline.to(node.position, { x: layout.slotX, y: layout.slotY, z: 1, duration, ease: "power2.inOut" })
        .to(node.rotation, { x: -Math.PI / 2, y: 0, z: 0, duration }, 0)
        .to(node.scale, { x: scale, y: scale, z: scale, duration }, 0)
        .to(node.scale, { y: .001, z: .001, duration: duration * .65, ease: "power2.in" })
        .to(node.scale, { x: .001, duration: .06, onComplete: props.onInserted });
    } else if (selected && props.mode === "ejecting") {
      const target = route();
      timeline.to(node.scale, { x: target.scale, y: target.scale, z: target.scale, duration })
        .to(node.position, { x: target.x, y: target.y, z: target.z, duration }, 0)
        .to(node.rotation, { x: target.rx, y: target.ry, z: target.rz, duration, onComplete: props.onEjected }, 0);
    } else if (selected && props.mode === "inspect") {
      const scale = size.width < 768 ? 1.3 : 1.65;
      timeline.to(node.position, { x: 0, y: 0, z: 2, duration, ease: "power3.inOut" })
        .to(node.rotation, { x: -.08, y: 0, z: 0, duration }, 0)
        .to(node.scale, { x: scale, y: scale, z: scale, duration }, 0);
    }
    return () => { timeline.kill(); };
    // Route coordinates are sampled when a mode changes, never reset by the scroll itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, props.mode, props.reduced, props.onInserted, props.onEjected, size.width, size.height]);
  useEffect(() => { if (selected && group.current && props.mode === "inspect") { group.current.rotation.y = props.rotation; invalidate(); } }, [props.rotation, selected, props.mode, invalidate]);
  useFrame(() => {
    const node = group.current!;
    if ((!selected || props.mode === "collection") && !gesture.current && !returning.current) {
      const point = route(); node.position.set(point.x, point.y, point.z); node.rotation.set(point.rx, point.ry, point.rz);
      node.scale.setScalar(point.scale);
    }
    const width = 2.35 * layout.zoom * node.scale.x * Math.max(.35, Math.abs(Math.cos(node.rotation.y)));
    const height = Math.max(1.31 * layout.zoom * node.scale.y, 34);
    props.onHit(index, width, height, size.width / 2 + node.position.x * layout.zoom - width / 2,
      size.height / 2 - node.position.y * layout.zoom - height / 2, -node.rotation.z,
      ["collection", "inspect", "dragging"].includes(props.mode) && (props.selected === null || selected || props.mode === "collection"));
  });
  const point = (e: TapePointer) => {
    const rect = gl.domElement.getBoundingClientRect();
    return { x: (e.clientX - rect.left - rect.width / 2) / layout.zoom, y: (rect.height / 2 - e.clientY + rect.top) / layout.zoom };
  };
  const slotReady = (ready: boolean) => gl.domElement.closest("[data-vcr-stage]")?.setAttribute("data-slot-ready", String(ready));
  const down = (e: TapePointer) => {
    if (!["collection", "inspect"].includes(props.mode)) return;
    e.stopPropagation(); e.preventDefault(); animation.current?.kill();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e), node = group.current!;
    gesture.current = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, offsetX: node.position.x - p.x, offsetY: node.position.y - p.y, moved: false, drag: props.mode === "collection" || props.drag, near: false };
  };
  const move = (e: TapePointer) => {
    const current = gesture.current, node = group.current; if (!current || !node) return;
    e.stopPropagation(); e.preventDefault();
    const moved = Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > 5;
    if (moved && !current.moved && current.drag && props.mode === "collection") props.onGrab(index);
    current.moved ||= moved;
    if (current.moved && current.drag) {
      const p = point(e); node.position.set(p.x + current.offsetX, p.y + current.offsetY, 2);
      current.near = Math.abs(node.position.x - layout.slotX) < layout.slotWidth * .65 && Math.abs(node.position.y - layout.slotY) < Math.max(.55, layout.slotHeight * 2);
      slotReady(current.near);
    } else if (current.moved) {
      node.rotation.y += (e.clientX - current.x) * .008;
      node.rotation.x = Math.max(-1.1, Math.min(1.1, node.rotation.x + (e.clientY - current.y) * .008));
    }
    current.x = e.clientX; current.y = e.clientY; invalidate();
  };
  const up = (e: TapePointer) => {
    const current = gesture.current; if (!current) return;
    e.stopPropagation(); e.preventDefault(); gesture.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    slotReady(false);
    if (!current.moved) props.onSelect(index);
    else if (current.drag && current.near) props.onInsert(index);
    else if (current.drag) { animateReturn(); if (props.mode === "dragging") props.onReturn(); }
  };
  const cancel = () => { gesture.current = null; slotReady(false); animateReturn(); if (props.mode === "dragging") props.onReturn(); };
  useEffect(() => {
    props.onRegister(index, { down, move, up, cancel });
    return () => props.onRegister(index, null);
  });
  useEffect(() => () => { animation.current?.kill(); }, []);
  return <group ref={group}>
    <primitive object={model} dispose={null} />
    <mesh position={[0, -.43, .19]}><planeGeometry args={[1.95, .34]} /><meshBasicMaterial map={label} color={props.selected !== null && !selected ? "#777777" : "#ffffff"} /></mesh>
    <mesh position={[0, .66, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.95, .2]} /><meshBasicMaterial map={label} /></mesh>
  </group>;
}
function Contents(props: Props) {
  const { size, invalidate } = useThree(); const { scene } = useGLTF("/models/vhs-cassette.glb");
  const { onReady } = props;
  useEffect(() => { onReady(invalidate); invalidate(); return () => onReady(); }, [onReady, invalidate]);
  useEffect(() => {
    clearTimeout(disposal);
    return () => { disposal = setTimeout(() => {
      const geometries = new Set<Mesh["geometry"]>(), materials = new Set<Material>(), textures = new Set<Texture>();
      scene.traverse(object => { if (object instanceof Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => { materials.add(material); Object.values(material).forEach(value => { if (value instanceof Texture) textures.add(value); }); }); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => { t.dispose(); if (typeof ImageBitmap !== "undefined" && t.image instanceof ImageBitmap) t.image.close(); }); useGLTF.clear("/models/vhs-cassette.glb");
    }, 150); };
  }, [scene]);
  return <><OrthographicCamera makeDefault position={[0, 0, 12]} zoom={sceneLayout(size.width, size.height).zoom} /><ambientLight intensity={1.8} /><directionalLight position={[3, 4, 6]} intensity={2.8} />{projects.map((p, index) => <Tape key={p.id} index={index} {...props} />)}</>;
}
export default function VhsScene(props: Props) {
  return <Canvas orthographic frameloop="demand" dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: "none" }}><Suspense fallback={null}><Contents {...props} /></Suspense></Canvas>;
}
