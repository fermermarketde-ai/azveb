import { prisma } from "@/lib/prisma";
import { notifyOrderStatusChange } from "@/lib/email";

/**
 * POST /api/webhooks/payment
 *
 * Generic webhook receiver. In production you MUST verify the request
 * signature using your provider's signing secret before trusting the
 * payload (e.g. Stripe's `stripe-signature` header + webhook secret).
 */
export async function POST(request) {
  let event;
  try {
    event = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const { providerRef, status } = event;

  if (!providerRef || !status) {
    return Response.json({ error: "providerRef və status tələb olunur" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({ where: { providerRef } });
  if (!payment) {
    return Response.json({ error: "Ödəniş tapılmadı" }, { status: 404 });
  }

  // Normalize status (case-insensitive)
  const normalizedStatus = ["succeeded", "SUCCEEDED", "success", "completed"].includes(status)
    ? "SUCCEEDED"
    : ["failed", "FAILED", "error"].includes(status)
    ? "FAILED"
    : "PENDING";

  // Update payment record
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: normalizedStatus, rawResponse: event },
  });

  // Idempotency: only update order to PAID if currently PENDING
  // (prevents duplicate webhooks from downgrading orders already at PROCESSING/SHIPPED/DELIVERED)
  const order = await prisma.order.findUnique({ where: { id: payment.orderId } });

  if (normalizedStatus === "SUCCEEDED" && order?.status === "PENDING") {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });

    if (order) {
      notifyOrderStatusChange({
        to: order.buyer?.email || (await prisma.user.findUnique({ where: { id: order.buyerId }, select: { email: true } }))?.email,
        orderId: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        status: "PAID",
      }).catch(() => {});
    }
  }

  return Response.json({ received: true });
}
