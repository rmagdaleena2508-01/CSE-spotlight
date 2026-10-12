import imageCompression from "browser-image-compression";

// Phone photos are often 3 to 12 MB, far bigger than a web page needs, and
// that is what made uploading slow. Before uploading, each picture is made
// smaller right here in the browser, in a background worker so the page
// stays smooth. A 6 MB phone photo usually ends up well under 1 MB and still
// looks sharp on any screen. PDFs are left exactly as they are.
//
// The worker script is served from this site (public/vendor), so nothing is
// loaded from another website.

const WORKER_SCRIPT = "/vendor/browser-image-compression-2.0.2.js";

const SETTINGS = {
  // Showcase photos: plenty for a full-screen view.
  photos: { maxWidthOrHeight: 1920, maxSizeMB: 1, fileType: "image/webp", initialQuality: 0.82 },
  // Certificates: kept bigger and clearer, so small print stays readable for faculty.
  certificates: { maxWidthOrHeight: 2400, maxSizeMB: 2, fileType: "image/jpeg", initialQuality: 0.9 },
} as const;

const EXTENSION = { "image/webp": "webp", "image/jpeg": "jpg" } as const;

export async function shrinkImage(file: File, bucket: keyof typeof SETTINGS): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const settings = SETTINGS[bucket];
  try {
    const smaller = await imageCompression(file, { ...settings, useWebWorker: true, libURL: WORKER_SCRIPT });
    // Never upload a "smaller" picture that came out bigger.
    if (smaller.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + "." + EXTENSION[settings.fileType];
    return new File([smaller], name, { type: settings.fileType, lastModified: file.lastModified });
  } catch {
    // If the browser cannot shrink it, upload the picture as it is.
    return file;
  }
}
