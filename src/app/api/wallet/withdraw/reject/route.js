import { getAuthUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/wallet/withdraw/reject — admin rejects a pending withdrawal and refunds balance
export async function POST(request) {
  const authUser = await getAuthUser(request);
  const denied = requireRole(authUser, ['ADMIN', 'SUPER_ADMIN']);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Yanlış JSON formatı' }, { status: 400 });
  }

  const { transactionId, reason } = body;
  if (!transactionId) return Response.json({ error: 'transactionId tələb olunur' }, { status: 422 });

  // Atomic status guard prevents double-rejection/double-refund
  const result = await prisma.$transaction(async (tx) => {
    const wt = await tx.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });
    if (!wt) throw new Error('NOT_FOUND');
    if (wt.type !== 'WITHDRAWAL' || wt.status !== 'PENDING') throw new Error('ALREADY_PROCESSED');

    // Reject the withdrawal + refund balance + create refund transaction
    await tx.walletTransaction.update({
      where: { id: transactionId },
      data: { status: 'REJECTED', description: `Rədd edildi${reason ? ': ' + reason : ''}` },
    });

    await tx.wallet.update({
      where: { id: wt.walletId },
      data: { balance: { increment: wt.amount } },
    });

    const refundTx = await tx.walletTransaction.create({
      data: {
        walletId: wt.walletId,
        type: 'REFUND',
        status: 'COMPLETED',
        amount: wt.amount,
        description: `Çıxarış sorğusu rədd edildi — məbləğ geri qaytarıldı${reason ? ': ' + reason : ''}`,
      },
    });

    return refundTx;
  }).catch((err) => {
    if (err.message === 'NOT_FOUND') return 'NOT_FOUND';
    if (err.message === 'ALREADY_PROCESSED') return 'ALREADY_PROCESSED';
    throw err;
  });

  if (result === 'NOT_FOUND') return Response.json({ error: 'Əməliyyat tapılmadı' }, { status: 404 });
  if (result === 'ALREADY_PROCESSED') return Response.json({ error: 'Bu əməliyyat artıq emal edilib' }, { status: 409 });

  return Response.json({ success: true });
}
