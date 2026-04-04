import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.siwe) {
    return NextResponse.json({ address: null });
  }

  return NextResponse.json({ address: session.siwe.address, chainId: session.siwe.chainId });
}

export async function DELETE(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Set-Cookie": res.headers.get("Set-Cookie") ?? "" },
  });
}
