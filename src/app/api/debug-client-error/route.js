let LOGS = [];
export async function POST(request) {
  try {
    const body = await request.json();
    LOGS.unshift({ ...body, at: new Date().toISOString() });
    LOGS = LOGS.slice(0, 20);
    console.error("[CLIENT-ERROR]", JSON.stringify(body));
  } catch {}
  return Response.json({ ok: true });
}
export async function GET() {
  return Response.json({ logs: LOGS });
}
