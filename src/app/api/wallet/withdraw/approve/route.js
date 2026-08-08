import { getAuthUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/wallet/withdraw/approve — admin approves a pending withdrawal
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

  const { transactionId } = body;
  if (!transactionId) return Response.json({ error: 'transactionId tələb olunur' }, { status: 422 });

  // Atomic status guard prevents double-approval
  const updated = await prisma.$transaction(async (tx) => {
    const wt = await tx.walletTransaction.findUnique({ where: { id: transactionId } });
    if (!wt) throw new Error('NOT_FOUND');
    if (wt.type !== 'WITHDRAWAL' || wt.status !== 'PENDING') throw new Error('ALREADY_PROCESSED');

    return tx.walletTransaction.update({
      where: { id: transactionId },
      data: { status: 'COMPLETED' },
    });
  }).catch((err) => {
    if (err.message === 'NOT_FOUND') return 'NOT_FOUND';
    if (err.message === 'ALREADY_PROCESSED') return 'ALREADY_PROCESSED';
    throw err;
  });

  if (updated === 'NOT_FOUND') return Response.json({ error: 'Əməliyyat tapılmadı' }, { status: 404 });
  if (updated === 'ALREADY_PROCESSED') return Response.json({ error: 'Bu əməliyyat artıq emal edilib' }, { status: 409 });

  return Response.json({ success: true, transaction: updated });
}
