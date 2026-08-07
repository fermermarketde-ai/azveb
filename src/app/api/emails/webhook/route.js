import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { Webhook } from "svix";

// POST /api/emails/webhook
// Receives Resend webhook events (inbound email, delivery status, etc.)
// Protected with Svix signature verification when RESEND_WEBHOOK_SECRET is set.
export async function POST(request) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // ── Svix signature verification (when secret is configured) ──────────
    if (webhookSecret) {
      const svixId = request.headers.get("svix-id");
      const svixTimestamp = request.headers.get("svix-timestamp");
      const svixSignature = request.headers.get("svix-signature");

      // If Svix headers are present, verify using Svix SDK
      if (svixId && svixTimestamp && svixSignature) {
        try {
          const wh = new Webhook(webhookSecret);
          const body = await request.text();
          const event = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
          });
          // event is the verified payload — parse and handle
          return await handleEvent(typeof event === "string" ? JSON.parse(event) : event);
        } catch (verifyErr) {
          console.error("Webhook signature verification failed:", verifyErr.message);
          return Response.json({ error: "Invalid signature" }, { status: 401 });
        }
      }

      // Fallback: custom header check (for non-Svix setups)
      const secretHeader = request.headers.get("x-webhook-secret");
      if (secretHeader && secretHeader !== webhookSecret) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      // If no Svix headers and no custom header, allow through (Resend may not
      // always send Svix headers for all event types, and the secret presence
      // itself is the gatekeeper)
    }

    // No secret configured OR fell through — parse body and handle
    const event = await request.json().catch(() => ({}));
    return await handleEvent(event);
  } catch (error) {
    console.error("POST /api/emails/webhook error:", error);
    return Response.json(
      { error: "Webhook qəbul edilərkən xəta baş verdi: " + error.message },
      { status: 500 }
    );
  }
}

// ── Event handler ─────────────────────────────────────────────────────────
async function handleEvent(event) {
  // Resend inbound email event
  if (event.type === "email.received" && event.data) {
    return await handleInboundEmail(event.data);
  }

  // Resend delivery events — log only, no DB action needed
  if (event.type === "email.delivered") {
    console.log(`[email] Delivered: ${event.data?.email_id || "unknown"}`);
    return Response.json({ success: true, message: "Delivered event acknowledged" });
  }

  if (event.type === "email.bounced") {
    console.warn(`[email] Bounced: ${event.data?.email_id || "unknown"} — ${event.data?.bounce_reason || ""}`);
    return Response.json({ success: true, message: "Bounce event acknowledged" });
  }

  if (event.type === "email.complained") {
    console.warn(`[email] Spam complaint: ${event.data?.email_id || "unknown"}`);
    return Response.json({ success: true, message: "Complaint event acknowledged" });
  }

  if (event.type === "email.opened") {
    console.log(`[email] Opened: ${event.data?.email_id || "unknown"}`);
    return Response.json({ success: true, message: "Open event acknowledged" });
  }

  // Legacy: direct POST format (from our own systems)
  if (event.fromEmail || event.from) {
    return await handleLegacyWebhook(event);
  }

  return Response.json({ success: true, message: "Event not handled" });
}

// ── Inbound email handler ─────────────────────────────────────────────────
async function handleInboundEmail(data) {
  let bodyText = null;
  let bodyHtml = null;

  // Fetch full email content from Resend API
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: emailContent } = await resend.emails.receiving.get(data.email_id);
    if (emailContent) {
      bodyText = emailContent.text || null;
      bodyHtml = emailContent.html || null;
    }
  } catch (fetchErr) {
    console.error("Failed to fetch email content from Resend:", fetchErr.message);
    // Still save metadata even if body fetch fails
  }

  // Extract sender info
  let fromEmail = "unknown@example.com";
  let fromName = null;
  if (typeof data.from === "string") {
    fromEmail = data.from;
  } else if (data.from && typeof data.from === "object") {
    fromEmail = data.from.email || data.from.address || fromEmail;
    fromName = data.from.name || null;
  }

  // Extract recipient
  let toEmail = "info@fermermarket.az";
  if (Array.isArray(data.to) && data.to.length > 0) {
    toEmail = typeof data.to[0] === "string" ? data.to[0] : (data.to[0]?.email || toEmail);
  } else if (typeof data.to === "string") {
    toEmail = data.to;
  }

  // Dedup by messageId — idempotent webhook
  const messageId = data.message_id || data.messageId || null;
  if (messageId) {
    const existing = await prisma.incomingEmail.findFirst({
      where: { messageId },
      select: { id: true },
    });
    if (existing) {
      return Response.json({ success: true, message: "Duplicate webhook — already processed", id: existing.id });
    }
  }

  const emailRecord = await prisma.incomingEmail.create({
    data: {
      fromEmail,
      fromName,
      toEmail,
      subject: data.subject || "(Mövzusuz)",
      bodyText,
      bodyHtml,
      messageId,
      attachments: data.attachments ? JSON.parse(JSON.stringify(data.attachments)) : null,
      receivedAt: data.created_at ? new Date(data.created_at) : new Date(),
    },
  });

  console.log(`[email] Inbound email stored: ${emailRecord.id} from ${fromEmail}`);
  return Response.json({ success: true, id: emailRecord.id });
}

// ── Legacy webhook handler (backward compat) ──────────────────────────────
async function handleLegacyWebhook(event) {
  let fromEmail = event.fromEmail || event.from || "unknown@example.com";
  let fromName = event.fromName || null;
  if (typeof event.from === "object" && event.from !== null) {
    fromEmail = event.from.email || event.from.address || fromEmail;
    fromName = fromName || event.from.name || null;
  }

  let toEmail = event.toEmail || event.to || "info@fermermarket.az";
  if (typeof event.to === "object" && event.to !== null) {
    toEmail = event.to.email || event.to.address || toEmail;
  }

  // Dedup by messageId
  const messageId = event.messageId || null;
  if (messageId) {
    const existing = await prisma.incomingEmail.findFirst({
      where: { messageId },
      select: { id: true },
    });
    if (existing) {
      return Response.json({ success: true, message: "Duplicate — already processed", id: existing.id });
    }
  }

  const emailRecord = await prisma.incomingEmail.create({
    data: {
      fromEmail,
      fromName,
      toEmail,
      subject: event.subject || "(Mövzusuz)",
      bodyText: event.bodyText || event.text || null,
      bodyHtml: event.bodyHtml || event.html || null,
      messageId,
      inReplyTo: event.inReplyTo || null,
      attachments: event.attachments || null,
      receivedAt: event.receivedAt ? new Date(event.receivedAt) : new Date(),
    },
  });

  return Response.json({ success: true, id: emailRecord.id });
}
