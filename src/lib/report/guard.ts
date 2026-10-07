import "server-only";
import { getViewer } from "@/lib/session";

// Route handlers cannot redirect like pages do, so they answer 403 instead.
export async function facultyOrNull() {
  const viewer = await getViewer();
  return viewer?.kind === "faculty" ? viewer : null;
}

export function fileName(label: string, ext: string) {
  return `cse-achievements-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${ext}`;
}

export function download(body: BodyInit, type: string, name: string) {
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
