"use client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB pre-compression check
const MAX_DIMENSION = 1920; // max width/height after resize
const JPEG_QUALITY = 0.82;

/**
 * Compresses/resize an image File using canvas, returns a new File (JPEG).
 * Keeps files under ~3MB to stay safely within Vercel's 4.5MB function body limit.
 * HEIC/HEIF not supported by canvas — passed through as-is (rare on web).
 */
async function compressImage(file) {
  // Non-image or HEIC: pass through
  if (!file.type.startsWith("image/") || file.type === "image/heic" || file.type === "image/heif") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.(png|webp|gif)$/i, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => resolve(file); // fallback to original
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Uploads one or more images via our server-side /api/upload endpoint.
 * Images are compressed client-side first, then sent as multipart/form-data.
 * Server handles the actual Vercel Blob upload using put() — no CSP issues,
 * no undici polyfill problems, no browser→Blob cross-origin PUT needed.
 * Returns { images: [{url}], url } for backward compatibility with old call sites.
 */
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

  // Compress all images first
  const compressed = await Promise.all(list.map((f) => compressImage(f)));

  const images = [];
  for (const file of compressed) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Yükləmə xətası (${res.status})`);
    }

    const data = await res.json();
    images.push({ url: data.url || data.images?.[0]?.url });
  }

  return { images, url: images[0]?.url || null };
}
