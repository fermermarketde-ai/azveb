import { put } from "@vercel/blob";
import { rateLimit } from "@/lib/rateLimit";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB per image (pre-compression)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

// POST /api/upload — multipart/form-data file upload (server-side Vercel Blob put).
// Client compresses images before sending, so files stay under ~3MB (well within
// Vercel's 4.5MB function body limit). Server uploads to Blob using put().
//
// Also still supports the old JSON token-generation pattern for backward compat
// (client-side @vercel/blob/client upload), but the primary path is now multipart.
export async function POST(request) {
  const rl = rateLimit(request, { limit: 40, windowMs: 60_000, keyPrefix: "upload" });
  if (rl) return rl;

  const contentType = request.headers.get("content-type") || "";

  // --- Multipart file upload (new primary path) ---
  if (contentType.startsWith("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return Response.json({ error: "Fayl tapılmadı" }, { status: 400 });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json({ error: `Dəstəklənməyən fayl növü: ${file.type}` }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ error: "Şəkil çox böyükdür (maks 8MB)" }, { status: 413 });
      }

      const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const pathname = `products/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: true,
      });

      return Response.json({ url: blob.url, images: [{ url: blob.url }] });
    } catch (err) {
      console.error("Blob upload error:", err);
      return Response.json({ error: err.message || "Yükləmə xətası" }, { status: 500 });
    }
  }

  // --- Legacy JSON token generation (for @vercel/blob/client upload) ---
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış sorğu formatı" }, { status: 400 });
  }

  try {
    const { handleUpload } = await import("@vercel/blob/client");
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_FILE_SIZE,
        addRandomSuffix: true,
      }),
    });
    return Response.json(jsonResponse);
  } catch (err) {
    console.error("Blob token error:", err);
    return Response.json({ error: err.message || "Yükləmə xətası" }, { status: 400 });
  }
}
