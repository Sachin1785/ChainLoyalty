import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { generateNonce } from "siwe";
import { sessionOptions, SessionData } from "@/lib/session";

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.nonce = generateNonce();
  await session.save();

  return new NextResponse(JSON.stringify({ nonce: session.nonce }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": res.headers.get("Set-Cookie") ?? "",
    },
  });
}
