import { NextResponse } from "next/server";
import { open, stat } from "node:fs/promises";
import path from "node:path";
import { projects } from "@/data/projects";

async function available(url: string, video = false) {
  const root = path.resolve(process.cwd(), "public");
  const file = path.resolve(root, "." + url);
  if (!file.startsWith(root + path.sep)) return false;
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size < 16) return false;
    const handle = await open(file, "r");
    try {
      const bytes = Buffer.alloc(16); await handle.read(bytes, 0, 16, 0);
      return video ? bytes.toString("ascii", 4, 8) === "ftyp"
        : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    } finally { await handle.close(); }
  } catch { return false; }
}

export async function GET(request: Request) {
  const project = projects.find(p => p.id === new URL(request.url).searchParams.get("id"));
  if (!project) return NextResponse.json({ error: "Projeto desconhecido" }, { status: 400 });
  const images = await Promise.all(project.media.images.map(url => available(url)));
  const video = await available(project.media.video, true);
  return NextResponse.json({ images, video }, { headers: { "Cache-Control": "no-store" } });
}
