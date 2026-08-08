import { handleUpload } from "@vercel/blob/client";
import { rateLimit } from "@/lib/rateLimit";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB per image
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

// POST /api/upload — issues short-lived, signed client tokens for direct
// browser → Vercel Blob uploads (client-upload pattern). The file bytes never
// pass through this serverless function, so there is no ~4.5MB body-size
// ceiling — this is what previously made every real phone/camera photo
// (routinely 5-15MB) fail with a 413 FUNCTION_PAYLOAD_TOO_LARGE across
// Brands, Sliders, product images, avatars, store logo/cover, and guest
// classifieds. See src/lib/blobUpload.js for the matching client helper.
//
// Kept open to guests too (guest classifieds need to upload photos without an
// account), but constrained by type/size here.
export async function POST(request) {
  const rl = rateLimit(request, { limit: 40, windowMs: 60_000, keyPrefix: "upload" });
  if (rl) return rl;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış sorğu formatı" }, { status: 400 });
  }

  try {
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
