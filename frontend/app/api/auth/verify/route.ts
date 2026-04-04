import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SiweMessage } from "siwe";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  try {
    const { message, signature } = body;
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({
      signature,
      nonce: session.nonce,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 422 });
    }

    session.siwe = {
      address: result.data.address,
      chainId: result.data.chainId,
    };
    session.nonce = undefined;
    await session.save();

    return new NextResponse(JSON.stringify({ ok: true, address: result.data.address }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": res.headers.get("Set-Cookie") ?? "",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
