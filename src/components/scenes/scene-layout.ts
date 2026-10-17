/** Calibrated against the Runway room plate (2752 × 1536). */
export const ROOM_ASPECT = 2752 / 1536;
export const SLOT = { x: .696, y: .605, width: .137, height: .036 };
export function sceneLayout(width: number, height: number) {
  const coverWidth = Math.max(width, height * ROOM_ASPECT);
  const coverHeight = coverWidth / ROOM_ASPECT;
  const left = (width - coverWidth) * .7;
  const top = (height - coverHeight) * .5;
  const zoom = width / (width < 768 ? 9 : 16);
  return { zoom, slotX: (left + coverWidth * SLOT.x - width / 2) / zoom,
    slotY: (height / 2 - top - coverHeight * SLOT.y) / zoom,
    slotWidth: coverWidth * SLOT.width / zoom,
    slotHeight: coverHeight * SLOT.height / zoom };
}
export function tapeRoute(progress: number, index: number, width: number, height: number) {
  const { zoom } = sceneLayout(width, height);
  // Include entry/exit margins for the full cassette, not only its center.
  const t = -.32 - index * .2 + Math.max(0, Math.min(1, progress)) * 2.15;
  const x = .06 + .9 * t + .09 * Math.sin(2 * Math.PI * t);
  const y = .94 - .81 * t + .07 * Math.sin(3 * Math.PI * t + index * .5);
  return { x: (x - .5) * width / zoom, y: (.5 - y) * height / zoom,
    z: .15 * Math.sin(t * Math.PI * 2), rx: -.13 + .16 * Math.cos(t * 5),
    ry: .3 * Math.sin(t * 6 + index), rz: -.13 + .2 * Math.sin(t * 5 + index),
    scale: width < 768 ? .8 : 1.08 };
}
