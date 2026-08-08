"use client";
import { upload } from "@vercel/blob/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB per file

// Uploads one or more files DIRECTLY from the browser to Vercel Blob storage,
// bypassing our Next.js API route entirely for the actual file bytes (only a
// short-lived signed token round-trips through /api/upload). This avoids
// Vercel's ~4.5MB request-body limit on serverless functions, which is what
// was silently breaking every image upload (Brands, Sliders, product photos,
// avatars, store logo/cover, guest classifieds) whenever a real phone/camera
// photo (commonly 5-15MB) was selected — those requests were rejected with a
// 413 FUNCTION_PAYLOAD_TOO_LARGE before our code even ran.
//
// Mirrors the old /api/upload JSON response shape so existing call sites only
// need a one-line swap: { images: [{ url }], url }
export async function uploadFilesToBlob(fileOrFiles) {
  const list = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  if (!list.length) throw new Error("Heç bir fayl seçilmədi");

  for (const file of list) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Dəstəklənməyən fayl növü: ${file.type || "naməlum"}. Yalnız JPG, PNG, WEBP, GIF.`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Şəkil çox böyükdür (maks 8MB): ${file.name}`);
    }
  }

  const images = [];
  for (const file of list) {
    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const blob = await upload(key, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    images.push({ url: blob.url });
  }

  return { images, url: images[0]?.url || null };
}
