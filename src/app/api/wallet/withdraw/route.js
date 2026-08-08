import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { walletWithdrawSchema } from "@/lib/validators";

// POST /api/wallet/withdraw — request a withdrawal (goes to PENDING, admin approves)
export async function POST(request) {
  const authUser = await getAuthUser(request);
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const parsed = walletWithdrawSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validasiya xətası", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Use interactive transaction to prevent race condition on balance check
  const tx = await prisma.$transaction(async (prismaTx) => {
    const wallet = await prismaTx.wallet.findUnique({ where: { userId: authUser.sub } });
    if (!wallet) throw new Error("NO_WALLET");
    if (Number(wallet.balance) < parsed.data.amount) throw new Error("INSUFFICIENT_FUNDS");

    const updatedWallet = await prismaTx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: parsed.data.amount } },
    });

    if (Number(updatedWallet.balance) < 0) throw new Error("INSUFFICIENT_FUNDS");

    const transaction = await prismaTx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "WITHDRAWAL",
        status: "PENDING",
        amount: parsed.data.amount,
        description: parsed.data.note || "Çıxarış tələbi",
      },
    });

    return transaction;
  }).catch((err) => {
    if (err.message === "NO_WALLET") return null;
    if (err.message === "INSUFFICIENT_FUNDS") return "INSUFFICIENT_FUNDS";
    throw err;
  });

  if (tx === "INSUFFICIENT_FUNDS") {
    return Response.json({ error: "Balans yetərli deyil" }, { status: 422 });
  }
  if (!tx) {
    return Response.json({ error: "Pul kisəsi tapılmadı" }, { status: 404 });
  }

  return Response.json({ transaction: tx }, { status: 201 });
}
