import { NextRequest, NextResponse } from "next/server";

const COOKIE = "osp_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function expectedToken(): string | null {
  const pw = process.env.SITE_PASSWORD;
  if (!pw) return null;
  return Buffer.from(`osp:${pw}`).toString("base64url");
}

export async function POST(req: NextRequest) {
  const expected = expectedToken();
  if (!expected) {
    const res = NextResponse.json({ ok: true, open: true });
    return res;
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const password = (body.password || "").trim();
  if (!password || password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
